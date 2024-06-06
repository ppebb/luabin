local config = require("server.config")
local env = os.getenv
local http_server = require("http.server")
local http_headers = require("http.headers")
local router = require("server.router").new()

router:error_page(404, function(_, headers, stream)
    local req_method = headers:get(":method")

    local res_headers = http_headers.new()
    res_headers:append(":status", "404")
    res_headers:append("content-type", "text/plain")

    assert(stream:write_headers(res_headers, req_method == "HEAD"))
    if req_method ~= "HEAD" then
        assert(stream:write_chunk("404 Page Not Found", true))
    end
end)

router:link_static("/", "./static/index.html")
router:add_static_path("./static")

local function reply(server, stream)
    local req_headers = assert(stream:get_headers())
    local req_method = req_headers:get(":method")

    -- Log request to stdout
    io.stdout:write(
        string.format(
            '[%s] "%s %s HTTP/%g"  "%s" "%s"\n',
            os.date("%d/%b/%Y:%H:%M:%S %z"),
            req_method or "",
            req_headers:get(":path") or "",
            stream.connection.version,
            req_headers:get("referer") or "-",
            req_headers:get("user-agent") or "-"
        )
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
    io.stdout:write(string.format("Now listening on port %d\n", bound_port))
end

assert(server:loop())
