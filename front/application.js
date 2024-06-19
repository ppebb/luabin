var title = "ppeb's luabin";
var locked = null;
var _key = "";
var _lang = null;
var _text = null;

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
            newDocument(_text, _lang);
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
            return event.ctrlKey && event.keyCode === 84;
        },
        shortcutDescription: "control + t",
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
            var button = document.querySelector(opts.match);

            if (button.classList.contains("enabled") && opts.shortcut && opts.shortcut(event)) {
                event.preventDefault();
                opts.action();

                return;
            }
        }
    };

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
    var savedTheme = localStorage.getItem("theme");

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

    var head = document.getElementsByTagName("head")[0];

    var name = themes[idx];
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
    document.querySelector("#linenos").innerHTML = "&gt;";
}

function showMessage(text, severity, cb) {
    var msgBox = document.createElement("li");
    msgBox.classList.add(severity || "info");
    msgBox.innerHTML = text + (cb ? "<br/>Left click to dismiss, right click confirm" : "");

    document.querySelector("#messages").append(msgBox);

    function close() {
        msgBox.classList.add("fade");

        setTimeout(function() {
            msgBox.remove();
        }, 500);
    }

    if (cb) {
        msgBox.oncontextmenu = function(_) {
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

function lockDocument(text) {
    if (locked === true)
        return;

    locked = true;

    var box = document.querySelector("#box");
    box.style.display = "";
    box.focus();
    _text = text;
    document.querySelector("#box code").innerHTML = htmlEscape(text);
    document.querySelector("textarea").style.display = "none";
    enableButtons(["new", "duplicate", "raw", "theme"]);
    addLineNumbers(text.split("\n").length);
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
        // TODO: Use json endpoint, provide language in request if present from duplicate & edit
        var response = await fetch("/documents", {
            method: "POST",
            body: text,
            headers: {
                "Content-Type": "text/plain",
            },
        });

        var json = await response.json();
        if (response.ok) {
            lockDocument(text);
            _key = json.key;

            if (!_lang)
                _lang = json.lang;

            window.history.pushState(null, title + " - " + json.key, `/${_key}:${_lang}`);
            getParserFromlang(_lang, function(w) { highlight(text, w); });
        }
        else {
            showMessage(json.message, "error");
        }
    }

    wrapper();
}

// BUG: Does not clear document when pressing new on an unlocked document
function newDocument(text, lang) {
    setupButtons();
    window.history.pushState(null, title, "/");

    // When duplicating, whatever language has been set should be maintained
    _lang = lang || null;
    _text = text;

    setTitle();
    unlockDocument(text || "");
}

function loadDocument(key, ext, lang) {
    console.log(`key: ${key}, ext: ${ext}, lang: ${lang}`);

    async function wrapper() {
        console.log("fetching document " + key);
        var response = await fetch("/documents/" + key);

        if (response.ok) {
            _key = key;
            console.log("fetched document " + key);
            json = await response.json();

            _lang = json.lang;

            if (ext) {
                var parser = ext_to_parser_map[ext];

                if (parser)
                    _lang = parser;
            }

            if (lang && allowed_parsers.includes(lang))
                _lang = lang;

            getParserFromlang(_lang, function(w) { highlight(json.data, w); });

            setTitle(`${_key}:${_lang}`);
            // TODO: Fix state being weird. Inconsistent formatting
            window.history.pushState(null, title + " - " + json.key, `/${_key}:${_lang}`);
            lockDocument(json.data);
        }
        else {
            window.location.href = "/";
        }
    }

    wrapper();
    setupButtons();
}

async function highlight(text, wasm) {
    const Parser = window.TreeSitter;
    await Parser.init();
    var parser = new Parser;

    parser.setLanguage(await Parser.Language.load(wasm));
    var tree = parser.parse(text);

    console.log(tree);
}

// Cb will be called when/if the parser is resolved and downloaded
async function getParserFromlang(lang, cb) {
    var url = `/tree-sitter-${lang}.wasm`;

    console.log("resolving parser for " + lang);

    var cache = await caches.open("parser-cache");
    var cached = await cache.match(url);

    if (!cached) {
        showMessage(
            `${lang} parser not found in cache! Download?`, "info",
            async function() {
                var parser = await fetchParser(cache, lang, url);

                if (parser)
                    cb(parser);
            }
        );
    }
    else {
        var arrayBuffer = await cached.arrayBuffer();
        var md5 = localStorage.getItem(url + ".md5sum");

        console.log(`${lang} parser retrieved from cache`);
        cb(new Uint8Array(arrayBuffer));

        var response = await fetch(url + ".md5sum");

        if (response.ok) {
            var serverSum = (await response.text()).trimEnd();

            if (serverSum != md5) {
                showMessage(
                    `Checksum mismatch for cached ${lang} parser. Re-download?`, "info",
                    async function() {
                        var parser = await fetchParser(cache, lang, url);

                        if (parser)
                            cb(parser);
                    }
                );
            }
        }
        else
            showMessage(`Unable to retrieve hash for cached ${lang} parser, parser may be out of date!`, "info");
    }
}

async function fetchParser(cache, lang, url) {
    var response = await fetch(url);

    if (response.ok) {
        var clone = response.clone();

        var arrayBuffer = await response.arrayBuffer();
        var md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer, false);

        localStorage.setItem(url + ".md5sum", md5);
        cache.put(url, clone);

        return new Uint8Array(arrayBuffer);
    }
    else {
        showMessage(`Unable to get parser for ${lang}, request failed with status ${response.status}, message: ${(await response.json()).message}`, "error");
        return null;
    }
}
