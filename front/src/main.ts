import { Language, Query, Parser } from "web-tree-sitter";
import { SparkMD5 } from "spark-md5";
import { allowed_parsers, ext_to_parser_map } from "./langs.ts";

const title: string = "ppeb's luabin";
let locked: boolean | null = null;
let _key: string = "";
let _lang: string | null = null;
let _text: string | null = null;

const themes = [
    "solarized-dark",
    "tokyonight",
];

const names = [
    "Solarized Dark",
    "Tokyonight",
];

declare global {
    interface Window {
        lbLoadStoredTheme(): void,
        lbApplyTheme(_: number): void,
        lbNewDocument(_: string | null, _1: string | null): void,
        lbLoadDocument(_: string, _1: string | null, _2: string | null): void,
    }
}

interface ButtonOpts {
    match: string,
    label: string,
    shortcut(_: KeyboardEvent): void,
    shortcutDescription: string,
    action(): void,
}

interface Queries {
    highlights: string,
    injections: string | null,
    locals: string | null
}

const buttons: ButtonOpts[] = [
    {
        match: "#buttons_container .save",
        label: "Save",
        shortcut: function(event: KeyboardEvent) {
            return event.ctrlKey && event.key == "s";
        },
        shortcutDescription: "control + s",
        action: function() {
            saveDocument();
        }
    },
    {
        match: "#buttons_container .new",
        label: "New",
        shortcut: function(event: KeyboardEvent) {
            return event.ctrlKey && event.key == "n";
        },
        shortcutDescription: "control + n",
        action: function() {
            newDocument(null, null);
        }
    },
    {
        match: "#buttons_container .duplicate",
        label: "Duplicate & Edit",
        shortcut: function(event: KeyboardEvent) {
            return locked && event.ctrlKey && event.key == "d";
        },
        shortcutDescription: "control + d",
        action: function() {
            newDocument(_text, _lang);
        }
    },
    {
        match: "#buttons_container .raw",
        label: "Just Text",
        shortcut: function(event: KeyboardEvent) {
            return event.ctrlKey && event.shiftKey && event.key == "j";
        },
        shortcutDescription: "control + j",
        action: function() {
            window.location.href = "/raw/" + _key;
        }
    },
    {
        match: "#buttons_container .theme",
        label: "Change Theme",
        shortcut: function(event: KeyboardEvent) {
            return event.ctrlKey && event.key == "t";
        },
        shortcutDescription: "control + t",
        action: function() {
            nextTheme();
        }
    },
];

let setup = false;
function setupButtons() {
    if (setup)
        return;

    for (let i = 0; i < buttons.length; i++)
        configureButton(buttons[i]);

    document.body.onkeydown = function(event: KeyboardEvent) {
        for (let i = 0; i < buttons.length; i++) {
            const opts = buttons[i];
            const button = document.querySelector<HTMLButtonElement>(opts.match);

            if (button?.classList.contains("enabled") && opts.shortcut && opts.shortcut(event)) {
                event.preventDefault();
                opts.action();

                return;
            }
        }
    };

    setup = true;
}

let pointer: HTMLDivElement | null = null;
function configureButton(opts: ButtonOpts) {
    const button = document.querySelector<HTMLButtonElement>(opts.match);

    if (!button)
        return;

    if (!pointer)
        pointer = document.querySelector("#pointer");

    button.onclick = function(event) {
        event.preventDefault();
        if (button.classList.contains("enabled"))
            opts.action();
    };

    button.onmouseenter = function() {
        document.querySelector("#shortcut_container .label")!.innerHTML = opts.label;
        document.querySelector("#shortcut_container .shortcut")!.innerHTML = opts.shortcutDescription || "";
        document.querySelector<HTMLDivElement>("#shortcut_container")!.style.display = "block";

        if (pointer) {
            button.append(pointer);
            pointer.style.display = "";
        }
    };

    button.onmouseleave = function() {
        document.querySelector<HTMLDivElement>("#shortcut_container")!.style.display = "none";
        pointer?.remove();
    };
}

function enableButtons(buttonList: string[]) {
    loop:
    for (let j = 0; j < buttons.length; j++) {
        const button = document.querySelector<HTMLButtonElement>(buttons[j].match);

        if (!button)
            return;

        for (let i = 0; i < buttonList.length; i++) {
            const className = buttonList[i];

            if (button.classList.contains(className)) {
                button.classList.add("enabled");

                continue loop;
            }
        }

        button.classList.remove("enabled");
    }
}

let currentIdx: number = -1;

function nextTheme() {
    return applyTheme((currentIdx + 1) % themes.length);
}

function loadStoredTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme)
        return false;

    const idx = Number.parseInt(savedTheme);

    if (!idx)
        return false;

    return applyTheme(idx);
}

window.lbLoadStoredTheme = loadStoredTheme;

let prevThemeLink: HTMLLinkElement | null = null;
function applyTheme(idx: number) {
    if (currentIdx === idx)
        return false;

    if (idx < 0 || idx >= themes.length)
        return false;

    const head = document.getElementsByTagName("head")[0];

    const name = themes[idx];
    const prettyName = names[idx];

    if (prevThemeLink)
        prevThemeLink.remove();

    const style = document.createElement("link");
    style.href = `themes/${name}/${name}.css`;
    style.id = "theme";
    style.type = "text/css";
    style.rel = "stylesheet";
    head.append(style);

    prevThemeLink = style;

    const root = document.querySelector<HTMLHtmlElement>(":root")!;
    root.style.setProperty("--logo-img", `url(../themes/${name}/logo.png)`);
    root.style.setProperty("--function-icons-img", `url(../themes/${name}/function-icons.png)`);
    root.style.setProperty("--pointer-img", `url(../themes/${name}/hover-dropdown-tip.png)`);

    buttons[4].label = "Change Theme<br/>" + prettyName;

    if (document.querySelector<HTMLDivElement>("#shortcut_container")!.style.display == "block"
        && document.querySelector("#shortcut_container .label")!.innerHTML.includes("Change Theme"))
        document.querySelector<HTMLButtonElement>(buttons[4].match)?.onmouseenter?.(null!);

    localStorage.setItem("theme", idx.toString());
    currentIdx = idx;

    return true;
}

window.lbApplyTheme = applyTheme;

function setTitle(extension: string | null) {
    document.title = extension ? title + " - " + extension : title;
}

function htmlEscape(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

function addLineNumbers(count: number) {
    let html = "";

    for (let i = 0; i < count; i++)
        html += (i + 1).toString() + "<br/>";

    document.querySelector("#linenos")!.innerHTML = html;
}

function removeLineNumbers() {
    document.querySelector("#linenos")!.innerHTML = "&gt;";
}

function showMessage(text: string, severity: string, cb: (() => void) | null) {
    const msgBox = document.createElement("li");
    msgBox.classList.add(severity || "info");
    msgBox.innerHTML = text + (cb ? "<br/>Left click to dismiss, right click confirm" : "");

    document.querySelector("#messages")?.append(msgBox);

    function close() {
        msgBox.classList.add("fade");

        setTimeout(function() {
            msgBox.remove();
        }, 500);
    }

    if (cb) {
        msgBox.oncontextmenu = function() {
            return false;
        };

        msgBox.onmousedown = function(event) {
            close();

            // Right click
            if (event.button == 2) {
                cb();
            };
        };
    }
    else
        setTimeout(close, 4500);
}

function lockDocument(text: string) {
    if (locked === true)
        return;

    locked = true;

    const box = document.querySelector<HTMLPreElement>("#box")!;
    box.style.display = "";
    box.focus();
    _text = text;
    document.querySelector("#box code")!.innerHTML = htmlEscape(text);
    document.querySelector("textarea")!.style.display = "none";
    enableButtons(["new", "duplicate", "raw", "theme"]);
    addLineNumbers(text.split("\n").length);
}

function unlockDocument(text: string) {
    // Always allow the document to be unlocked.

    locked = false;
    document.querySelector<HTMLPreElement>("#box")!.style.display = "none";
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.style.display = "block";
    textarea.value = text;
    textarea.focus();
    enableButtons(["new", "save", "theme"]);
    removeLineNumbers();
}

function saveDocument() {
    if (locked)
        return false;

    const text = document.querySelector("textarea")!.value;

    if (!text)
        return false;

    async function wrapper() {
        const response = await fetch("/documents_json", {
            method: "POST",
            body: JSON.stringify({ lang: _lang, data: text }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await response.json();
        if (response.ok) {
            lockDocument(text);
            _key = json.key;

            if (!_lang)
                _lang = json.lang;

            window.history.pushState(null, title + " - " + json.key, `/${_key}:${_lang}`);
            getParserFromlang(_lang!, function(q: Queries, w: Uint8Array) { highlight(text, q, w); });
        }
        else {
            showMessage(json.message, "error", null);
        }
    }

    wrapper();
}

function newDocument(text: string | null, lang: string | null) {
    setupButtons();
    window.history.pushState(null, title, "/");

    // When duplicating, whatever language has been set should be maintained
    _lang = lang || null;
    _text = text;

    setTitle(null);
    unlockDocument(text || "");
}

window.lbNewDocument = newDocument;

function loadDocument(key: string, ext: string | null, lang: string | null) {
    console.log(`key: ${key}, ext: ${ext}, lang: ${lang}`);

    async function wrapper() {
        console.log("fetching document " + key);
        const response = await fetch("/documents/" + key);

        if (!response.ok) {
            window.location.href = "/";
            return;
        }

        _key = key;
        console.log("fetched document " + key);
        const json = await response.json();

        _lang = json.lang;

        if (ext) {
            const parser = ext_to_parser_map[ext];

            if (parser)
                _lang = parser;
        }

        if (lang && allowed_parsers.includes(lang))
            _lang = lang;

        getParserFromlang(_lang!, function(q: Queries, w: Uint8Array) { highlight(json.data, q, w); });

        setTitle(`${_key}:${_lang}`);
        // TODO: Fix state being weird. Inconsistent formatting
        window.history.pushState(null, title + " - " + json.key, `/${_key}:${_lang}`);
        lockDocument(json.data);
    }

    wrapper();
    setupButtons();
}

window.lbLoadDocument = loadDocument;

async function highlight(text: string, queries: Queries, wasm: Uint8Array) {
    await Parser.init();
    const parser = new Parser;

    const language = await Language.load(wasm);

    parser.setLanguage(language);

    const shouldInject = !!queries.injections;
    const shouldLocals = !!queries.locals;

    const highlightQuery = new Query(language, queries.highlights);
    const injectionQuery = shouldInject ? new Query(language, queries.injections!) : null;
    const localsQuery = shouldLocals ? new Query(language, queries.locals!) : null;

    const tree = parser.parse(text);
    if (!tree)
        return;

    const cursor = tree.walk();

    const highlightMatches = highlightQuery.matches(cursor.currentNode);
    const injectionMatches = injectionQuery?.matches(cursor.currentNode);
    const localsMatches = localsQuery?.matches(cursor.currentNode);

    console.log(highlightMatches);
    console.log(injectionMatches);
    console.log(localsMatches);
}

// Cb will be called when/if the parser is resolved and downloaded
async function getParserFromlang(lang: string, cb: (_: Queries, _1: Uint8Array) => void) {
    const url = `/tree-sitter-${lang}.wasm`;

    console.log("resolving parser for " + lang);

    const queries = await fetchQueries(lang);
    if (!queries)
        return;

    const cache = await caches.open("parser-cache");
    const cached = await cache.match(url);

    if (!cached) {
        showMessage(
            `${lang} parser not found in cache! Download?`, "info",
            async function() {
                const parser = await fetchParser(cache, lang, url);

                if (parser)
                    cb(queries, parser);
            }
        );

        return;
    }

    const arrayBuffer = await cached.arrayBuffer();
    const md5 = localStorage.getItem(url + ".md5sum");

    console.log(`${lang} parser retrieved from cache`);
    cb(queries, new Uint8Array(arrayBuffer));

    const response = await fetch(url + ".md5sum");

    if (!response.ok) {
        showMessage(`Unable to retrieve hash for cached ${lang} parser, parser may be out of date!`, "info", null);
        return;
    }

    const serverSum = (await response.text()).trimEnd();

    if (serverSum == md5)
        return;

    showMessage(
        `Checksum mismatch for cached ${lang} parser. Re-download?`, "info",
        async function() {
            const parser = await fetchParser(cache, lang, url);

            if (parser)
                cb(queries, parser);
        }
    );
}

async function fetchParser(cache: Cache, lang: string, url: string) {
    const response = await fetch(url);

    if (response.ok) {
        const clone = response.clone();

        const arrayBuffer = await response.arrayBuffer();
        const md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer, false);

        localStorage.setItem(url + ".md5sum", md5);
        cache.put(url, clone);

        return new Uint8Array(arrayBuffer);
    }
    else {
        showMessage(`Unable to get parser for ${lang}, request failed with status ${response.status}, message: ${(await response.json()).message}`, "error", null);
        return null;
    }
}

async function fetchQueries(lang: string): Promise<Queries | null> {
    console.log("retrieving queries for " + lang);

    const url = `/queries/${lang}`;
    const response = await fetch(url);

    if (response.ok)
        return await response.json();

    showMessage(`Unable to get queries for ${lang}, request failed with status ${response.status}, message: ${(await response.json()).message}`, "error", null);

    return null;
}
