import { buttons } from "./buttons.ts";

const themes = [
    "solarized-dark",
    "tokyonight",
];

const names = [
    "Solarized Dark",
    "Tokyonight",
];

let currentIdx: number = -1;

export function nextTheme() {
    return applyTheme((currentIdx + 1) % themes.length);
}

export function loadStoredTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme)
        return false;

    const idx = Number.parseInt(savedTheme);

    if (!idx)
        return false;

    return applyTheme(idx);
}


let prevThemeLink: HTMLLinkElement | null = null;
export function applyTheme(idx: number) {
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
