local config = require("server.config")
local env = os.getenv
local http_server = require("http.server")
local http_headers = require("http.headers")
local router = require("server.router").new()
local utils = require("server.utils")

router:error_page("404", function(_, headers, stream)
    local req_method = headers:get(":method")

    local res_headers = http_headers.new()
    res_headers:append(":status", "404")
    res_headers:append("content-type", "text/plain")

    assert(stream:write_headers(res_headers, req_method == "HEAD"))
    if req_method ~= "HEAD" then
        assert(stream:write_chunk("404 Page Not Found", true))
    end
end)

local keygen
do
    local gen_name = env("KEYGENERATOR_TYPE") or config.key_generator.type or "random"
    local ok, gen = pcall(require, "server.keygen." .. gen_name)

    if ok then
        keygen = gen.new(config)
    else
        utils.stderr_fmt("Unable to find key generator %s, defaulting to random\n", gen_name)
        gen = require("server.keygen.random")
    end
end

local storage
do
    local storage_name = env("STORAGE_TYPE") or config.storage.type
    if not storage_name then
        utils.stderr_fmt(
            "critical",
            "No storage type configured! Please select one using config.lua or the STORAGE_TYPE environment variable\n"
        )
        os.exit(1, true)
    end

    local ok, store = pcall(require, "server.storage." .. storage_name)

    if ok then
        storage = store.new(config)
    else
        utils.stderr_fmt(
            "critical",
            'Unable to find storage type "%s", please correct your configuration\n',
            storage_name
        )
        os.exit(1, true)
    end
end

local document_handler = require("server.document_handler").new(keygen, storage)

-- Retreive raw documents
router:get("/raw/%w+", function(a, b, c) document_handler:raw_get(a, b, c) end)
router:head("/raw/%w+", function(a, b, c) document_handler:raw_get(a, b, c) end)

-- Add documents
router:post("/documents", function(a, b, c) document_handler:post(a, b, c) end)

-- Get documents
router:get("/documents/%w+", function(a, b, c) document_handler:get(a, b, c) end)
router:head("/documents/%w+", function(a, b, c) document_handler:get(a, b, c) end)

-- Match static files
router:add_static_path("./front")

-- Match index.html
router:link_static("/%w*", "./front/index.html")

local function reply(server, stream)
    local req_headers = assert(stream:get_headers())
    local req_method = req_headers:get(":method")

    -- Log request to stdout
    utils.stdout_fmt(
        "debug",
        '[%s] "%s %s HTTP/%g"  "%s" "%s"\n',
        os.date("%d/%b/%Y:%H:%M:%S %z"),
        req_method or "",
        req_headers:get(":path") or "",
        stream.connection.version,
        req_headers:get("referer") or "-",
        req_headers:get("user-agent") or "-"
    )

    router:match(server, req_headers, stream)
end

local server = assert(http_server.listen({
    host = env("HOST") or config.host or "localhost",
    port = env("PORT") or config.port or "7777",
    onstream = reply,
}))

assert(server:listen())
do
    local bound_port = select(3, server:localname())
    utils.stdout_fmt("info", "Now listening on port %d\n", bound_port)
end

assert(server:loop())
