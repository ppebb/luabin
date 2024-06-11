var title = "ppeb's luabin"
var locked = null;
var _key = "";

var themes = [
    "solarized-dark",
    "tokyonight",
];

var names = [
    "Solarized Dark",
    "Tokyonight",
];

var buttons = [
    {
        match: "#buttons_container .save",
        label: "Save",
        shortcut: function(event) {
            return event.ctrlKey && event.keyCode === 83;
        },
        shortcutDescription: "control + s",
        action: function() {
            saveDocument();
        }
    },
    {
        match: "#buttons_container .new",
        label: "New",
        shortcut: function(event) {
            return event.ctrlKey && event.keyCode === 78;
        },
        shortcutDescription: "control + n",
        action: function() {
            newDocument();
        }
    },
    {
        match: "#buttons_container .duplicate",
        label: "Duplicate & Edit",
        shortcut: function(event) {
            return locked && event.ctrlKey && event.keyCode === 68;
        },
        shortcutDescription: "control + d",
        action: function() {
            newDocument(document.querySelector("#box code").innerHTML);
        }
    },
    {
        match: "#buttons_container .raw",
        label: "Just Text",
        shortcut: function(event) {
            return event.ctrlKey && event.shiftKey && event.keyCode === 74;
        },
        shortcutDescription: "control + j",
        action: function() {
            window.location.href = "/raw/" + _key;
        }
    },
    {
        match: "#buttons_container .theme",
        label: "Change Theme",
        shortcut: function(event) {
            return event.ctrlKey && event.keyCode === 67;
        },
        shortcutDescription: "control + c",
        action: function() {
            nextTheme();
        }
    },
];

var setup = false;
function setupButtons() {
    if (setup)
        return;

    for (var i = 0; i < buttons.length; i++)
        configureButton(buttons[i]);

    document.body.onkeydown = function(event) {
        for (var i = 0; i < buttons.length; i++) {
            var opts = buttons[i];
            var button = document.querySelector(opts.match)

            if (button.classList.contains("enabled") && opts.shortcut && opts.shortcut(event)) {
                event.preventDefault();
                opts.action();

                return;
            }
        }
    }

    setup = true;
}

var pointer = null;
function configureButton(opts) {
    var button = document.querySelector(opts.match);

    if (!pointer)
        pointer = document.querySelector("#pointer");

    button.onclick = function(event) {
        event.preventDefault();
        if (button.classList.contains("enabled"))
            opts.action();
    };

    button.onmouseenter = function(_) {
        document.querySelector("#shortcut_container .label").innerHTML = opts.label;
        document.querySelector("#shortcut_container .shortcut").innerHTML = opts.shortcutDescription || "";
        document.querySelector("#shortcut_container").style.display = "block";

        button.append(pointer);
        pointer.style.display = "";
    };

    button.onmouseleave = function(_) {
        document.querySelector("#shortcut_container").style.display = "none";
        pointer.remove();
    };
}

function enableButtons(buttonList) {
    loop:
    for (var j = 0; j < buttons.length; j++) {
        var button = document.querySelector(buttons[j].match);

        for (var i = 0; i < buttonList.length; i++) {
            var className = buttonList[i];

            if (button.classList.contains(className)) {
                button.classList.add("enabled");

                continue loop;
            }
        }

        button.classList.remove("enabled");
    }
}

var currentIdx = null;
function nextTheme() {
    return applyTheme((currentIdx + 1) % themes.length);
}

function loadStoredTheme() {
    var savedTheme = localStorage.getItem("theme")

    if (!savedTheme)
        return false;

    var idx = Number.parseInt(savedTheme);

    if (!idx)
        return false;

    return applyTheme(idx);
}

var prevThemeLink = null;
function applyTheme(idx) {
    if (currentIdx === idx)
        return false;

    if (idx < 0 || idx >= themes.length)
        return false;

    var head = document.getElementsByTagName("head")[0]

    var name = themes[idx]
    var prettyName = names[idx];

    if (prevThemeLink)
        prevThemeLink.remove();

    var style = document.createElement("link");
    style.href = `themes/${name}/${name}.css`;
    style.id = "theme";
    style.type = "text/css";
    style.rel = "stylesheet";
    head.append(style);

    prevThemeLink = style;

    var root = document.querySelector(":root");
    root.style.setProperty("--logo-img", `url(themes/${name}/logo.png)`);
    root.style.setProperty("--function-icons-img", `url(themes/${name}/function-icons.png)`);
    root.style.setProperty("--pointer-img", `url(themes/${name}/hover-dropdown-tip.png)`);

    buttons[4].label = "Change Theme<br/>" + prettyName;

    if (document.querySelector("#shortcut_container").style.display == "block"
        && document.querySelector("#shortcut_container .label").innerHTML.includes("Change Theme"))
        document.querySelector(buttons[4].match).onmouseenter();

    localStorage.setItem("theme", idx.toString());
    currentIdx = idx;

    return true;
}

function setTitle(extension) {
    document.title = extension ? title + " - " + extension : title;
}

function htmlEscape(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

function addLineNumbers(count) {
    var html = "";

    for (var i = 0; i < count; i++)
        html += (i + 1).toString() + "<br/>";

    document.querySelector("#linenos").innerHTML = html;
}

function removeLineNumbers() {
    document.querySelector("#linenos").innerHTML = "&gt;"
}

function showMessage(text, severity) {
    var msgBox = document.createElement("li")
    msgBox.classList.add(severity || "info");
    msgBox.innerHTML = text;

    document.querySelector("#messages").prepend(msgBox);

    msgBox.onclick = function(_) {
        msgBox.classList.add("fade");

        setTimeout(function() {
            document.querySelector("#messages").removeChild(msgBox);
        }, 500);
    }
}

function lockDocument(text) {
    if (locked === true)
        return;

    locked = true;

    var box = document.querySelector("#box");
    box.style.display = "";
    box.focus();
    document.querySelector("#box code").innerHTML = htmlEscape(text);
    document.querySelector("textarea").style.display = "none";
    enableButtons(["new", "duplicate", "raw", "theme"]);
    addLineNumbers(text.split('\n').length);
}

function unlockDocument(text) {
    if (locked === false)
        return;

    locked = false;
    document.querySelector("#box").style.display = "none";
    var textarea = document.querySelector("textarea");
    textarea.style.display = "block";
    textarea.value = text;
    textarea.focus();
    enableButtons(["new", "save", "theme"]);
    removeLineNumbers();
}

function saveDocument() {
    if (locked)
        return false;

    var text = document.querySelector("textarea").value;

    if (!text)
        return false;

    async function wrapper() {
        var response = await fetch("/documents", {
            method: "POST",
            body: text,
            headers: {
                "Content-Type": "text/plain",
            },
        });

        var json = await response.json();
        if (response.ok) {
            lockDocument(document.querySelector("textarea").value);
            _key = json.key;
            window.history.pushState(null, title + " - " + json.key, "/" + json.key);

            // TODO: do highlighting
        }
        else {
            showMessage(json.message, "error")
        }
    }

    wrapper();
}

function newDocument(text) {
    setupButtons();
    window.history.pushState(null, title, '/');

    setTitle();
    unlockDocument(text || "");
}

function loadDocument(key) {
    async function wrapper() {
        console.log("fetching document " + key);
        var response = await fetch("/documents/" + key)

        if (response.ok) {
            _key = key;
            console.log("fetched document " + key);
            json = await response.json()
            setTitle(key);
            lockDocument(json.data);
        }
        else {

            window.location.href = "/";
        }
    }

    wrapper();
    setupButtons();
}
