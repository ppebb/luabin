import { loadDocument, newDocument } from "./document.ts";
import { applyTheme, loadStoredTheme } from "./theme.ts";

export const title: string = "ppeb's luabin";

declare global {
    interface Window {
        lbLoadStoredTheme(): void,
        lbApplyTheme(_: number): void,
        lbNewDocument(_: string | null, _1: string | null): void,
        lbLoadDocument(_: string, _1: string | null, _2: string | null): void,
    }
}

window.lbLoadStoredTheme = loadStoredTheme;
window.lbApplyTheme = applyTheme;
window.lbLoadDocument = loadDocument;
window.lbNewDocument = newDocument;

export function setTitle(extension: string | null) {
    document.title = extension ? title + " - " + extension : title;
}

export function htmlEscape(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

export function addLineNumbers(count: number) {
    let html = "";

    for (let i = 0; i < count; i++)
        html += (i + 1).toString() + "<br/>";

    document.querySelector("#linenos")!.innerHTML = html;
}

export function removeLineNumbers() {
    document.querySelector("#linenos")!.innerHTML = "&gt;";
}

export function showMessage(text: string, severity: string, cb: (() => void) | null) {
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
