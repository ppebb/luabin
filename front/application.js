var title = "ppeb's luabin"
var locked = null;
var _key = "";

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
        label: 'New',
        shortcut: function(event) {
            return event.ctrlKey && event.keyCode === 78;
        },
        shortcutDescription: 'control + n',
        action: function() {
            newDocument();
        }
    },
    {
        match: "#buttons_container .duplicate",
        label: 'Duplicate & Edit',
        shortcut: function(event) {
            return locked && event.ctrlKey && event.keyCode === 68;
        },
        shortcutDescription: 'control + d',
        action: function() {
            newDocument(document.querySelector("#box code").innerHTML)
        }
    },
    {
        match: "#buttons_container .raw",
        label: 'Just Text',
        shortcut: function(event) {
            return event.ctrlKey && event.shiftKey && event.keyCode === 82;
        },
        shortcutDescription: 'control + shift + r',
        action: function() {
            window.location.href = '/raw/' + _key;
        }
    },
];

var setup = false;
function setupButtons() {
    if (setup)
        return;

    for (var i = 0; i < buttons.length; i++)
        configureButton(buttons[i]);

    setup = true;
}

function configureButton(opts) {
    var button = document.querySelector(opts.match);

    button.onclick = (function(event) {
        event.preventDefault();
        if (button.classList.contains("enabled"))
            opts.action();
    })
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
    enableButtons(["new", "duplicate", "raw"]);
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
    enableButtons(["new", "save"]);
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
