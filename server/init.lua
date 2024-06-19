local cqueues = require("cqueues")
-- local ce = require("cqueues.errno")
local config = require("server.config")
local cjson = require("cjson")
local http_server = require("http.server")
-- local http_headers = require("http.headers")
local languages = require("server.languages")
local router = require("server.router").new()
local utils = require("server.utils")

languages.init()
utils.init()

router:error_page("404", function(_, headers, stream)
    local req_method = headers:get(":method")

    utils.respond_json(cjson.encode({ message = "404 Not Found." }), "404", stream, req_method == "HEAD")
end)

local keygen
do
    local gen_name = utils.config_value("key_generator.type", "random")
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
    local storage_type = utils.config_value("storage.type", "", true)
    if not storage_type then
        utils.stderr_fmt(
            "critical",
            "No storage type configured! Please select one using config.lua or the STORAGE_TYPE environment variable\n"
        )
        os.exit(1, true)
    end

    local store = utils.p_require("server.storage." .. storage_type)

    if store then
        storage = store.new(config)
    elseif storage_type == "sql_db" then
        local sql_db_type = utils.config_value("storage.sql_db_type", "", true)

        storage = (utils.p_require("server.storage." .. (sql_db_type or "")) or require("server.storage.database")).new()
    end
end

local document_handler = require("server.document_handler").new(keygen, storage)

-- Retreive raw documents
router:get("/raw/%w+", function(a, b, c) document_handler:raw_get(a, b, c) end)
router:head("/raw/%w+", function(a, b, c) document_handler:raw_get(a, b, c) end)

-- Add documents
router:post("/documents", function(a, b, c) document_handler:post(a, b, c) end)
router:post("/documents_json", function(a, b, c) document_handler:post_json(a, b, c) end)

-- Get documents
router:get("/documents/%w+", function(a, b, c) document_handler:get(a, b, c) end)
router:head("/documents/%w+", function(a, b, c) document_handler:get(a, b, c) end)

-- NOTE: This route may end up being useful in the future and thus is left in,
-- but it would not work with the existing frontend caching system. Just
-- sending language mappings as JS was deemed a better solution to getting wasm
-- from extensions, see setup.lua in the root directory
--
-- Get wasm for a parser given an extension
-- router:get("/wasm-from-ext", function(_, _, stream)
--     local req = cjson.decode(stream:get_body_as_string())

--     if not req.ext then
--         utils.respond_json(
--             cjson.encode({ message = "Malformed json request, missing ext field" }),
--             "400",
--             stream,
--             false
--         )
--     end

--     local langs = languages.langs_from_ext(req.ext)

--     if not langs then
--         return "404"
--     else
--         local parser = languages.enry_to_ts(langs[1])

--         local path = "./build/wasm/tree-sitter-" .. parser .. ".wasm"
--         local contents, err, errno = router:load_file_cached(path)

--         if contents then
--             local res_headers = http_headers.new()

--             utils.stderr_fmt("info", 'extension "%s" resolved to path "%s"', req.ext, path)
--             res_headers:append(":status", "200")
--             res_headers:append("content-type", "application/wasm")
--             res_headers:append("parser-name", parser)
--             assert(stream:write_headers(res_headers, false))

--             assert(stream:write_chunk(contents, true))
--         else
--             if errno ~= ce.ENOENT then
--                 utils.stderr_fmt(
--                     "critical",
--                     'Attempted to serve wasm blob "%s", but an error was encountered: %s',
--                     path,
--                     err
--                 )
--             end

--             return (errno == ce.EACCESS) and "403" or (errno == ce.ENOENT) and "404" or "503"
--         end
--     end
-- end)

-- Match static files
router:add_static_path("./front")
router:add_static_path("./build/wasm")
router:add_static_path("./js")

-- Match index.html
router:link_static("/%w*", "tree%-sitter", "./front/index.html")

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

local cq = cqueues.new()

do
    local expiry_check_interval = utils.config_value("storage.expiry_check_interval", 86400)
    cq:wrap(function()
        utils.stdout_fmt("info", "Running document expiry checks every %s seconds\n", expiry_check_interval)
        io.stdout:flush()

        while true do
            cqueues.sleep(expiry_check_interval)

            utils.stdout_fmt("info", "Running document expiry check, time is %s\n", os.date("%Y-%m-%d %H:%M:%S"))
            io.stdout:flush()
            storage:expire_documents()
            utils.stdout_fmt(
                "info",
                "Next document expiry check is scheduled for %s\n",
                os.date("%Y-%m-%d %H:%M:%S", os.time() + expiry_check_interval)
            )
            io.stdout:flush()
        end
    end)
end

local server = assert(http_server.listen({
    host = utils.config_value("host", "localhost"),
    port = utils.config_value("port", 7777),
    onstream = reply,
    cq = cq,
}))

assert(server:listen())
do
    local bound_port = select(3, server:localname())
    utils.stdout_fmt("info", "Now listening on port %d\n", bound_port)
end

assert(server:loop())
