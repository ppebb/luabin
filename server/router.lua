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
    local sanitized = utils.sanitize(req_path)

    local function mime_from_ext(str)
        local ext = utils.get_ext(str)

        if ext == "js" then
            return "text/javascript"
        elseif ext == "css" then
            return "text/css"
        else
            return nil
        end
    end

    local function serve_file(path)
        local fd, err, errno = io.open(path)

        if fd then
            local res_headers = http_headers.new()
            utils.stderr_fmt('Path "%s" resolved to static asset "%s"\n', req_path, path)
            res_headers:append(":status", "200")
            res_headers:append(
                "content-type",
                mime_from_ext(path) or (mdb and mdb:file(path)) or "application/octet-stream"
            )

            assert(stream:write_headers(res_headers, req_method == "HEAD"))
            if req_method ~= "HEAD" then
                assert(stream:write_body_from_file(fd))
            end

            fd:close()
        else
            utils.stderr_fmt('Attemped to serve static file %s, but an error was encountered: "%s"\n', path, err)

            local status_code = (errno == ce.EACCESS) and "403" or "503"
            self:handle_err_code(status_code, server, headers, stream)
        end
    end

    local function test_route(handler)
        if req_method == handler.method and string.match(req_path, handler.pattern) then
            local status_code = handler.func(server, headers, stream)
            if status_code ~= 0 and status_code ~= nil then
                self:handle_err_code(status_code, server, headers, stream)
            end

            return true
        end

        return false
    end

    local function test_static(handler)
        local path = utils.path_combine(handler.path, sanitized)
        local ft = lfs.attributes(path, "mode")
        if ft ~= "directory" and utils.file_exists(path) then
            serve_file(path)
            return true
        end

        return false
    end

    local function test_static_link(handler)
        if string.match(sanitized, handler.pattern) then
            serve_file(handler.path)
            return true
        end

        return false
    end

    for _, handler in ipairs(self.handlers) do
        if handler.type == "route" then
            if test_route(handler) then
                return
            end
        elseif handler.type == "directory" then
            if test_static(handler) then
                return
            end
        elseif handler.type == "static_link" then
            if test_static_link(handler) then
                return
            end
        else
            utils.stderr_fmt('Unknown handler of type "%s"', handler.type)
            return
        end
    end

    utils.stderr_fmt("Unable to match %s request for %s\n", req_method, req_path)
    self:handle_err_code("404", server, headers, stream)
end

function M:head(pattern, func)
    table.insert(self.handlers, { type = "route", method = "HEAD", pattern = pattern, func = func })
end

function M:post(pattern, func)
    table.insert(self.handlers, { type = "route", method = "POST", pattern = pattern, func = func })
end

function M:get(pattern, func)
    table.insert(self.handlers, { type = "route", method = "GET", pattern = pattern, func = func })
end

function M:add_static_path(directory)
    local fd, err = io.open(directory, "r")

    if fd then
        fd:close()
        table.insert(self.handlers, { type = "directory", path = directory })
    else
        utils.stderr_fmt('Unable to open directory "%s" to serve files from: "%s"\n', directory, err)
    end
end

function M:link_static(pattern, file_path)
    local fd, err = io.open(file_path, "r")

    if fd then
        fd:close()
        table.insert(self.handlers, { type = "static_link", pattern = pattern, path = file_path })
    else
        utils.stderr_fmt('Unable to open file "%s" to link to path: "%s"\n', file_path, err)
    end
end

function M:error_page(int, func) self.error_pages[int] = func end

function M.new()
    local ret = {}
    ret.handlers = {}
    ret.error_pages = {}
    return setmetatable(ret, M)
end

return M
