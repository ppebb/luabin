import { _key, _lang, _locked, _text, newDocument, saveDocument } from "./document.ts";
import { nextTheme } from "./theme.ts";

interface ButtonOpts {
    match: string,
    label: string,
    shortcut(_: KeyboardEvent): boolean,
    shortcutDescription: string,
    action(): void,
}

export const buttons: ButtonOpts[] = [
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
        shortcut: function(event: KeyboardEvent): boolean {
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
        shortcut: function(event: KeyboardEvent): boolean {
            return !!_locked && event.ctrlKey && event.key == "d";
        },
        shortcutDescription: "control + d",
        action: function() {
            newDocument(_text, _lang);
        }
    },
    {
        match: "#buttons_container .raw",
        label: "Just Text",
        shortcut: function(event: KeyboardEvent): boolean {
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
        shortcut: function(event: KeyboardEvent): boolean {
            return event.ctrlKey && event.key == "t";
        },
        shortcutDescription: "control + t",
        action: function() {
            nextTheme();
        }
    },
];

let setup = false;
export function setupButtons() {
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

export function enableButtons(buttonList: string[]) {
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
