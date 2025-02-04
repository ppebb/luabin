import { enableButtons, setupButtons } from "./buttons.ts";
import { allowed_parsers, ext_to_parser_map } from "./langs.ts";
import { addLineNumbers, removeLineNumbers, htmlEscape, setTitle, showMessage, title } from "./main.ts";
import { Queries, getParserFromlang, highlight } from "./parser.ts";

export let _locked: boolean | null = null;
export let _key: string = "";
export let _lang: string | null = null;
export let _text: string | null = null;

export function lockDocument(text: string) {
    if (_locked === true)
        return;

    _locked = true;

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

    _locked = false;
    document.querySelector<HTMLPreElement>("#box")!.style.display = "none";
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.style.display = "block";
    textarea.value = text;
    textarea.focus();
    enableButtons(["new", "save", "theme"]);
    removeLineNumbers();
}

export function saveDocument() {
    if (_locked)
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

export function newDocument(text: string | null, lang: string | null) {
    setupButtons();
    window.history.pushState(null, title, "/");

    // When duplicating, whatever language has been set should be maintained
    _lang = lang || null;
    _text = text;

    setTitle(null);
    unlockDocument(text || "");
}


export function loadDocument(key: string, ext: string | null, lang: string | null) {
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
