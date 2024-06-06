local M = {}
M.__index = M

local ce = require("cqueues.errno")
local http_headers = require("http.headers")
local lfs = require("lfs")
local utils = require("server.utils")

local mdb
do
    -- If available, use libmagic https://github.com/mah0x211/lua-libmagic
    local ok, magic = pcall(require, "libmagic")
    if ok then
        mdb = magic.open(magic.MIME_TYPE + magic.PRESERVE_ATIME + magic.RAW + magic.ERROR)
        assert(mdb:load())
    end
end

function M:handle_err_code(code, server, headers, stream)
    if self.error_pages[code] then
        self.error_pages[code](server, headers, stream)
    else
        local req_method = headers:get(":method")

        local res_headers
        http_headers.new()
        res_headers:append(":status", code)
        res_headers:append("content-type", "text/plain")

        assert(stream:write_headers(res_headers, req_method == "HEAD"))
        if req_method ~= "HEAD" then
            assert(stream:write_chunk("Error " .. code, true))
        end
    end
end

function M:match(server, headers, stream)
    local req_method = headers:get(":method")
    local req_path = headers:get(":path")

    local function serve_file(path)
        local fd, err, errno = io.open(path)

        if fd then
            local res_headers = http_headers.new()
            io.stdout:write(string.format('Path "%s" resolved to static asset "%s"\n', req_path, path))
            res_headers:append(":status", "200")
            res_headers:append("content-type", mdb and mdb:file(path) or "application/octet-stream")

            assert(stream:write_headers(res_headers, req_method == "HEAD"))
            if req_method ~= "HEAD" then
                assert(stream:write_body_from_file(fd))
            end

            fd:close()
        else
            io.stderr:write(
                string.format('Attemped to serve static file %s, but an error was encountered: "%s"', path, err)
            )

            local status_code = (errno == ce.EACCESS) and 403 or 503
            self:handle_err_code(status_code, server, headers, stream)
        end
    end

    for _, tbl in ipairs(self.routes) do
        if req_method == tbl.method and string.match(req_path, tbl.pattern) then
            local status_code = tbl.func(server, headers, stream)
            self:handle_err_code(status_code, server, headers, stream)
            return
        end
    end

    local sanitized, _ = req_path:gsub("%.%.", "")

    for path, file in pairs(self.static_links) do
        if path == sanitized then
            serve_file(file)
            return
        end
    end

    for _, dir in ipairs(self.static_paths) do
        local path = utils.path_combine(dir, sanitized)
        local ft = lfs.attributes(path, "mode")
        if ft ~= "directory" and utils.file_exists(path) then
            serve_file(path)
            return
        end
    end

    io.stderr:write(string.format("Unable to match %s request for %s\n", req_method, req_path))
    self:handle_err_code(404, server, headers, stream)
end

function M:head(pattern, func) table.insert(self.routes, { method = "HEAD", pattern = pattern, func = func }) end

function M:post(pattern, func) table.insert(self.routes, { method = "POST", pattern = pattern, func = func }) end

function M:get(pattern, func) table.insert(self.routes, { method = "GET", pattern = pattern, func = func }) end

function M:add_static_path(directory)
    local fd, err = io.open(directory, "r")

    if fd then
        fd:close()
        table.insert(self.static_paths, directory)
    else
        io.stderr:write(string.format('Unable to open directory "%s" to serve files from: "%s"\n', directory, err))
    end
end

function M:link_static(req_path, file_path)
    local fd, err = io.open(file_path, "r")

    if fd then
        fd:close()
        self.static_links[req_path] = file_path
    else
        io.stderr:write(string.format('Unable to open file "%s" to link to path: "%s"\n', file_path, err))
    end
end

function M:error_page(int, func) self.error_pages[int] = func end

function M.new()
    local ret = {
        routes = {},
        static_paths = {},
        static_links = {},
        error_pages = {},
    }
    return setmetatable(ret, M)
end

return M
