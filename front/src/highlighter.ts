import { Language, Node, Parser, Query, QueryCapture, QueryMatch, Range, TreeCursor } from "web-tree-sitter";

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

    constructor(language: Language, name: string, highlightsQuery: string, injectionsQuery: string, localsQuery: string) {
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
    readonly byteOffset: number;
    readonly highlighter: Highlighter;
    readonly injectionCallback: (_: string) => string;
    readonly layers: HighlightLayer[];
    readonly iterCount: number;

    sortLayers() {
        while (this.layers.length != 0) {
            let sortKey;
            if ((sortKey = this.layers[0].sortKey())) {

            }
        }
    }
}

class HighlightLayer {
    readonly cursor: TreeCursor;
    readonly captures: QueryCapture[];
    readonly config: HighlightConfiguration;
    depth: number;
    readonly highlightEndStack: number[];

    constructor(cursor: TreeCursor, captures: QueryCapture[], config: HighlightConfiguration, depth: number) {
        this.cursor = cursor;
        this.captures = captures;
        this.config = config;
        this.depth = depth;
        this.highlightEndStack = [];
    }

    sortKey() {
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
        }
    }
}

function makeLayers(source: string, parentName: string | null, highlighter: Highlighter, injectionCallback: (_: string) => HighlightConfiguration, config: HighlightConfiguration, depth: number, ranges: Range[]): HighlightLayer[] {
    const result: HighlightLayer[] = [];
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
        if ((combinedInjectionsQuery = config.combinedInjectionsQuery)) {
            const injectionsByPatternIdx: CombinedInjection[] = Array(combinedInjectionsQuery.patternCount());
            const matches = combinedInjectionsQuery.matches(cursor.currentNode);

            for (const [i, match] of matches.entries()) {
                const entry: CombinedInjection = {
                    languageName: null,
                    nodes: [],
                    includeChildren: false
                };

                const [languageName, contentNode, includeChildren] = injectionForMatch(config, parentName, combinedInjectionsQuery, match);

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

        result.push({
            config: config,
            captures: combinedInjectionsQuery?.captures(tree.rootNode) ?? [],
            cursor: cursor,
        });

        if (queue.length == 0)
            break;

        const [nextConfig, nextDepth, nextRanges] = queue.shift()!;
        config = nextConfig;
        depth = nextDepth;
        ranges = nextRanges;
    }

    return result;
}

class Highlighter {
    parser: Parser;
    cursors: TreeCursor[];

    constructor() {
        this.parser = new Parser();
        this.cursors = [];
    }

    highlight(source: string, config: HighlightConfiguration, injectionCallback: (_: string) => HighlightConfiguration) {
        const layers = makeLayers(
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
