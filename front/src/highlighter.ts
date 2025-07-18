import { Language, Node, Parser, Query, QueryCapture, QueryMatch, Range, Tree, TreeCursor } from "web-tree-sitter";
import { Queries } from "./parser";

interface ByteRange {
    start: number,
    end: number,
}

enum HighlightEventType {
    Source,
    HighlightStart,
    HighlightEnd,
}

interface HighlightEvent {
    type: HighlightEventType,
    source?: { start: number, end: number },
    highlight?: number,
}

function HighlightStart(highlight: number): HighlightEvent {
    return { type: HighlightEventType.HighlightStart, highlight: highlight };
};
const HighlightEnd: HighlightEvent = { type: HighlightEventType.HighlightEnd };

class HighlightConfiguration {
    readonly language: Language;
    readonly languageName: string;
    readonly query: Query;
    readonly combinedInjectionsQuery: Query | null;
    readonly localsPatternIdx: number = 0;
    readonly highlightsPatternIdx: number = 0;
    readonly injectionContentCaptureIdx: number | null = null;
    readonly injectionLanguageCaptureIdx: number | null = null;
    readonly localScopeCaptureIdx: number | null = null;
    readonly localDefCaptureIdx: number | null = null;
    readonly localDefValueCaptureIdx: number | null = null;
    readonly localRefCaptureIdx: number | null = null;

    constructor(
        language: Language,
        name: string,
        highlightsQuery: string,
        injectionsQuery: string,
        localsQuery: string
    ) {
        this.language = language;
        this.languageName = name;

        let combinedQuerySource = injectionsQuery;
        const locals_offset = combinedQuerySource.length;
        combinedQuerySource += localsQuery;
        const highlights_offset = combinedQuerySource.length;
        combinedQuerySource += highlightsQuery;

        this.query = new Query(language, combinedQuerySource);
        for (let i = 0; i < this.query.patternCount(); i++) {
            const offset = this.query.startIndexForPattern(i);
            if (offset < highlights_offset) {
                this.highlightsPatternIdx++;

                if (offset < locals_offset)
                    this.localsPatternIdx++;
            }
        }

        this.combinedInjectionsQuery = new Query(language, injectionsQuery);
        let has_combined_queries = false;
        for (let i = 0; i < this.localsPatternIdx; i++) {
            const settings = this.query.setProperties[i];

            if (settings["injection.combined"]) {
                has_combined_queries = true;
                this.query.disablePattern(i);
            }
            else
                this.combinedInjectionsQuery.disablePattern(i);
        }

        if (!has_combined_queries)
            this.combinedInjectionsQuery = null;

        for (let i = 0; i < this.query.captureNames.length; i++) {
            switch (this.query.captureNames[i]) {
            case "injection.content": this.injectionContentCaptureIdx = i; break;
            case "injection.language": this.injectionLanguageCaptureIdx = i; break;
            case "local.definition": this.localDefCaptureIdx = i; break;
            case "local.definition-value": this.localDefValueCaptureIdx = i; break;
            case "local.reference": this.localRefCaptureIdx = i; break;
            case "local.scope": this.localScopeCaptureIdx = i; break;
            }
        }
    }
}

class HighlightIter {
    readonly source: string;
    readonly languageName: string;
    byteOffset: number;
    readonly highlighter: Highlighter;
    readonly injectionCallback: (_: string) => HighlightConfiguration | null;
    readonly layers: HighlightIterLayer[];
    readonly iterCount: number;
    nextEvent: HighlightEvent | null = null;

    constructor(
        source: string,
        languageName: string,
        highlighter: Highlighter,
        injectionCallback: (_: string) => HighlightConfiguration | null,
        layers: HighlightIterLayer[],
    ) {
        this.source = source;
        this.languageName = languageName;
        this.byteOffset = 0;
        this.highlighter = highlighter;
        this.injectionCallback = injectionCallback;
        this.layers = layers;
        this.iterCount = 0;
    }

    emitEvent(offset: number, event: HighlightEvent | null): HighlightEvent | null {
        let result: HighlightEvent | null = null;

        if (this.byteOffset < offset) {
            result = {
                type: HighlightEventType.Source,
                source: {
                    start: this.byteOffset,
                    end: offset,
                },
            };

            this.byteOffset = offset;
            this.nextEvent = event;
        }
        else
            result = event;

        this.sortLayers();

        return result;
    }

    sortLayers() {
        while (this.layers.length != 0) {
            let sortKey;
            if ((sortKey = this.layers[0].sortKey())) {
                let i = 0;
                while (i + 1 < this.layers.length) {
                    let nextOffset;
                    if ((nextOffset = this.layers[i + 1].sortKey())) {
                        if (nextOffset < sortKey) {
                            i++;
                            continue;
                        }
                    }

                    break;
                }

                if (i > 0) {
                    const slice = this.layers.slice(0, i + 1);
                    const elem = slice.shift();
                    slice.push(elem!);
                    for (let j = 0; j < slice.length; j++) {
                        this.layers[j] = slice[j];
                    }
                }

                const layer = this.layers.shift()!;
                this.highlighter.cursors.push(layer.cursor);
            }
        }
    }

    insertLayer(layer: HighlightIterLayer) {
        const sortKey = layer.sortKey();

        if (!sortKey)
            return;

        let i = 1;
        while (i < this.layers.length) {
            const sortKeyI = this.layers[i].sortKey();
            if (sortKeyI) {
                if (sortKeyI > sortKey) {
                    this.layers.splice(i, 0, layer);
                    i++;
                }
            }
            else
                this.layers.shift();

            this.layers.push(layer);
        }
    }

    next(): HighlightEvent | null {
        while (true) {
            if (this.nextEvent) {
                this.nextEvent = null;
                return this.nextEvent;
            }

            // TODO: Cancellation flag if needed?

            if (this.layers.length == 0) {
                if (this.byteOffset < this.source.length) {
                    const result: HighlightEvent = {
                        type: HighlightEventType.Source,
                        source: {
                            start: this.byteOffset,
                            end: this.source.length,
                        },
                    };

                    this.byteOffset = this.source.length;
                    return result;
                }
                else
                    return null;
            }

            // let range: ByteRange;
            const layer = this.layers[0];
            if (layer.captures.length != 0) {
                const capture = layer.captures[0];
                // range = {
                //     start: capture.node.startIndex,
                //     end: capture.node.endIndex,
                // };

                if (layer.highlightEndStack.length != 0) {
                    const endByte = layer.highlightEndStack[layer.highlightEndStack.length - 1];
                    if (endByte <= capture.node.startIndex) {
                        layer.highlightEndStack.pop();
                        return this.emitEvent(endByte, HighlightEnd);
                    }
                }
            }
            else {
                let he;
                if ((he = layer.highlightEndStack.pop())) {
                    return this.emitEvent(he, HighlightEnd);
                }

                return this.emitEvent(this.source.length, null);
            }

            // const capture = layer.captures.shift()!;
            // const match = layer.matches.shift()!;

            // if (match.patternIndex < layer.config.localsPatternIdx) {
            //     const [languageName, contentNode, includeChildren] = injectionForMatch(
            //         layer.config,
            //         this.languageName,
            //         layer.config.query,
            //         match,
            //     );

            //     // TODO: Does not exist??
            //     //
            //     // match.remove();

            //     if (languageName && contentNode) {
            //         const config = (this.injectionCallback)(languageName);

            //         if (config) {
            //             const ranges = intersectRanges(
            //                 this.layers[0].ranges,
            //                 [contentNode],
            //                 includeChildren,
            //             );

            //             if (ranges.length != 0) {
            //                 const layers = makeLayers(
            //                     this.source,
            //                     this.languageName,
            //                     this.highlighter,
            //                     this.injectionCallback,
            //                     config,
            //                     this.layers[0].depth + 1,
            //                     ranges,
            //                 );

            //                 for (const layer of layers)
            //                     this.insertLayer(layer);
            //             }
            //         }
            //     }

            //     this.sortLayers();
            //     continue;
            // }

            // while (range.start > layer.scopeStack[layer.scopeStack.length - 1].range.end)
            //     layer.scopeStack.pop();

            // let referenceHighlight = null;
            // let definitionHighlight = null;

            // while (match.patternIndex < layer.config.highlightsPatternIdx) {
            //     if (layer.config.localScopeCaptureIdx) {
            //         capture.patternIndex
            //     }
            // }
        }

        return null;
    }
}

interface LocalDef {
    name: string,
    valueRange: ByteRange,
    highlight: Highlight | null,
}

interface LocalScope {
    inherits: boolean,
    range: ByteRange,
    localDefs: LocalDef[],
};

class HighlightIterLayer {
    readonly tree: Tree;
    readonly cursor: TreeCursor;
    readonly captures: QueryCapture[];
    readonly matches: QueryMatch[];
    readonly config: HighlightConfiguration;
    readonly highlightEndStack: number[];
    readonly scopeStack: LocalScope[];
    readonly ranges: Range[] = [];
    depth: number;

    constructor(
        tree: Tree,
        cursor: TreeCursor,
        captures: QueryCapture[],
        matches: QueryMatch[],
        config: HighlightConfiguration,
        depth: number,
        ranges: Range[],
    ) {
        this.tree = tree;
        this.cursor = cursor;
        this.captures = captures;
        this.matches = matches;
        this.config = config;
        this.depth = depth;
        this.highlightEndStack = [];
        this.scopeStack = [{
            inherits: false,
            range: { start: 0, end: Number.MAX_SAFE_INTEGER },
            localDefs: [],
        }];
        this.ranges = ranges;
    }

    sortKey(): [number, boolean, number] | null {
        const depth = -this.depth;
        const nextStart = this.captures.length != 0
            ? this.captures[0].node.startIndex
            : null;
        const nextEnd = this.highlightEndStack.length != 0
            ? this.highlightEndStack[this.highlightEndStack.length - 1]
            : null;

        if (nextStart && nextEnd) {
            if (nextStart < nextEnd)
                return [nextStart, true, depth];
            else
                return [nextEnd, false, depth];
        }
        else if (nextStart && !nextEnd)
            return [nextStart, true, depth];
        else if (nextEnd && !nextStart)
            return [nextEnd, false, depth];

        return null;

    }

    static MakeLayers(
        source: string,
        parentName: string | null,
        highlighter: Highlighter,
        injectionCallback: (_: string) => HighlightConfiguration | null,
        config: HighlightConfiguration,
        depth: number,
        ranges: Range[]
    ): HighlightIterLayer[] {
        const result: HighlightIterLayer[] = [];
        const queue: [HighlightConfiguration, number, Range[]][] = [];

        while (true) {
            highlighter.parser.setLanguage(config.language);

            const tree = highlighter.parser.parse(source, null, {
                includedRanges: ranges,
            });

            if (!tree)
                break;

            const cursor = tree.walk();

            let combinedInjectionsQuery;
            let matches;
            if ((combinedInjectionsQuery = config.combinedInjectionsQuery)) {
                const injectionsByPatternIdx: CombinedInjection[] = Array(combinedInjectionsQuery.patternCount());
                matches = combinedInjectionsQuery.matches(cursor.currentNode);

                for (const [i, match] of matches.entries()) {
                    const entry: CombinedInjection = {
                        languageName: null,
                        nodes: [],
                        includeChildren: false
                    };

                    const [languageName, contentNode, includeChildren] = injectionForMatch(
                        config,
                        parentName,
                        combinedInjectionsQuery,
                        match
                    );

                    if (languageName)
                        entry.languageName = languageName;

                    if (contentNode)
                        entry.nodes.push(contentNode);

                    entry.includeChildren = includeChildren;

                    injectionsByPatternIdx[i] = entry;
                }

                for (const injection of injectionsByPatternIdx) {
                    if (!injection.languageName)
                        continue;

                    let next_config;
                    if (!(next_config = injectionCallback(injection.languageName)))
                        continue;

                    const _ranges = intersectRanges(
                        ranges,
                        injection.nodes,
                        injection.includeChildren,
                    );
                    if (_ranges.length != 0)
                        queue.push([next_config, depth + 1, _ranges]);
                }
            }

            result.push(new HighlightIterLayer(
                tree,
                cursor,
                combinedInjectionsQuery?.captures(tree.rootNode) ?? [],
                matches ?? [],
                config,
                depth,
                ranges,
            ));

            if (queue.length == 0)
                break;

            const [nextConfig, nextDepth, nextRanges] = queue.shift()!;
            config = nextConfig;
            depth = nextDepth;
            ranges = nextRanges;
        }

        return result;
    }
}

class Highlighter {
    parser: Parser;
    cursors: TreeCursor[];

    constructor() {
        this.parser = new Parser();
        this.cursors = [];
    }

    highlight(source: string, config: HighlightConfiguration, injectionCallback: (_: string) => HighlightConfiguration | null) {
        const layers = HighlightIterLayer.MakeLayers(
            source,
            null,
            this,
            injectionCallback,
            config,
            0,
            [{
                startIndex: 0,
                startPosition: { row: 0, column: 0 },
                endIndex: Number.MAX_SAFE_INTEGER,
                endPosition: { row: Number.MAX_SAFE_INTEGER, column: Number.MAX_SAFE_INTEGER }
            }]
        );

        if (layers.length == 0)
            throw "Layers cannot be zero";

        const result = new HighlightIter(
            source,
            config.languageName,
            this,
            injectionCallback,
            layers,
        );

        result.sortLayers();
        return result;
    }
}

interface CombinedInjection {
    languageName: string | null
    nodes: Node[],
    includeChildren: boolean
}

function injectionForMatch(config: HighlightConfiguration, parentName: string | null, query: Query, match: QueryMatch): [string | null, Node | null, boolean] {
    const contentCaptureIdx = config.injectionContentCaptureIdx;
    const languageCaptureIdx = config.injectionLanguageCaptureIdx;

    let languageName: string | null = null;
    let contentNode: Node | null = null;

    for (const capture of match.captures) {
        const idx = capture.patternIndex;
        if (idx == languageCaptureIdx)
            languageName = capture.node.text;
        else if (idx == contentCaptureIdx)
            contentNode = capture.node;
    }

    let includeChildren = false;
    const props = query.setProperties[match.patternIndex];

    let value;
    if ((value = props["injection.language"])) {
        if (!languageName)
            languageName = value;
    }
    else if (props["injection.self"]) {
        if (!languageName)
            languageName = config.languageName;
    }
    else if (props["injection.parent"]) {
        if (!languageName)
            languageName = parentName;
    }
    else if (props["injection.inlclude-children"])
        includeChildren = true;

    return [languageName, contentNode, includeChildren];
}

function intersectRanges(parentRanges: Range[], nodes: Node[], includesChildren: boolean): Range[] {
    const ret: Range[] = [];
    const parentRangeIter = parentRanges.entries();
    // parentRanges cannot be empty
    let parentRange = parentRangeIter.next().value![1];

    for (const node of nodes) {
        let precedingRange: Range = {
            startIndex: 0,
            startPosition: { column: 0, row: 0 },
            endIndex: 0,
            endPosition: { column: 0, row: 0 },
        };
        const followingRange: Range = {
            startIndex: node.endIndex,
            startPosition: node.endPosition,
            endIndex: Number.MAX_SAFE_INTEGER,
            endPosition: { column: Number.MAX_SAFE_INTEGER, row: Number.MAX_SAFE_INTEGER },
        };

        const excludedRanges: Range[] = node.children
            .filter(child => includesChildren && !!child)
            .map<Range>(child => {
                return {
                    startIndex: child!.startIndex,
                    startPosition: child!.startPosition,
                    endIndex: child!.endIndex,
                    endPosition: child!.endPosition,
                };
            });

        excludedRanges.push(followingRange);

        for (const excludedRange of excludedRanges) {
            const range: Range = {
                startIndex: precedingRange.endIndex,
                startPosition: precedingRange.startPosition,
                endIndex: excludedRange.startIndex,
                endPosition: excludedRange.endPosition,
            };

            precedingRange = excludedRange;

            if (range.endIndex < parentRange.startIndex)
                continue;

            while (parentRange.startIndex <= range.endIndex) {
                if (parentRange.endIndex > range.endIndex) {
                    if (range.startIndex < parentRange.startIndex) {
                        range.startIndex = parentRange.startIndex;
                        range.startPosition = parentRange.startPosition;
                    }

                    if (parentRange.endIndex < range.endIndex) {
                        if (range.startIndex < parentRange.endIndex) {
                            ret.push({
                                startIndex: range.startIndex,
                                startPosition: range.startPosition,
                                endIndex: parentRange.endIndex,
                                endPosition: parentRange.endPosition,
                            });
                        }

                        range.startIndex = parentRange.endIndex;
                        range.startPosition = parentRange.startPosition;
                    }
                    else {
                        if (range.startIndex < range.endIndex)
                            ret.push(range);

                        break;
                    }
                }

                let nextRange;
                if ((nextRange = parentRangeIter.next().value))
                    parentRange = nextRange[1];
                else
                    return ret;
            }
        }
    }

    return ret;
}

export class HtmlRenderer {
    private html: StringContainer = new StringContainer();
    private lineOffsets: number[] = [0];
    private carriageReturnHighlight: number | null = null;

    constructor() { }

    setCarriageReturnHighlight(highlight: number | null) {
        this.carriageReturnHighlight = highlight;
    }

    lines() {
        return this.html.contents();
    }

    async render(source: string, queries: Queries, wasm: Uint8Array, cb: (_: number, _1: StringContainer) => void) {
        await Parser.init();

        const language = await Language.load(wasm);

        const highlighter = new Highlighter();
        const config = new HighlightConfiguration(
            language,
            language.name!,
            queries.highlights,
            queries.injections ?? "",
            queries.locals ?? "",
        );

        const iter = highlighter.highlight(source, config, (_) => {
            return null;
        });

        const highlights: number[] = [];
        let event = null;
        while ((event = iter.next())) {
            switch (event.type) {
            case HighlightEventType.Source:
                this.addText(source.slice(event.source!.start, event.source!.end), highlights, cb);
                break;
            case HighlightEventType.HighlightStart:
                highlights.push(event.highlight!);
                this.startHighlight(event.highlight!, cb);
                break;
            case HighlightEventType.HighlightEnd:
                highlights.pop();
                this.endHighlight();
                break;
            }
        }
    }

    startHighlight(h: number, cb: (_: number, _1: StringContainer) => void) {
        this.html.extend("<span ");
        cb(h, this.html);
        this.html.extend(">");
    }

    endHighlight() {
        this.html.extend("</span>");
    }

    addCarriageReturn(cb: (_: number, _1: StringContainer) => void) {
        if (!this.carriageReturnHighlight)
            return;

        this.html.extend("<span ");
        cb(this.carriageReturnHighlight, this.html);
        this.html.extend("></span>");
    }

    addText(src: string, highlights: number[], cb: (_: number, _1: StringContainer) => void) {
        function htmlEscape(c: string): string | null {
            switch (c) {
            case ">": return "&gt;";
            case "<": return "&lt;";
            case "&": return "&amp;";
            case "'": return "&#39;";
            case "\"": return "&quot;";
            default: return null;
            }
        }

        let lastCharCr = false;
        for (let i = 0; i < src.length; i++) {
            const c = src.charAt(i);

            if (c == "\r") {
                lastCharCr = true;
                continue;
            }

            if (lastCharCr) {
                if (c != "\n") {
                    this.addCarriageReturn(cb);
                }

                lastCharCr = false;
            }

            if (c == "\n") {
                highlights.forEach(() => this.endHighlight());
                this.html.extend(c);
                this.lineOffsets.push(this.html.length());
                highlights.forEach((h) => this.startHighlight(h, cb));
                continue;
            }

            const esc = htmlEscape(c);
            this.html.extend(esc ?? c);
        }
    }
}

class StringContainer {
    private internal: string[] = [];
    private len = 0;

    constructor() { }

    extend(str: string) {
        this.internal.push(str);
        this.len += str.length;
    }

    contents(): string {
        return this.internal.join();
    }

    length(): number {
        return this.len;
    }
}
