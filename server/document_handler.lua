local M = {}
M.__index = M

local cjson = require("cjson")
local http_headers = require("http.headers")
local utils = require("server.utils")

function M:retreive_document(path)
    local key = utils.get_last_segment(utils.sanitize(path))

    local document = self.store:retrieve(key)

    if document then
        utils.stdout_fmt("info", 'Retrieved document "%s"\n', key)
    else
        utils.stderr_fmt("info", 'Document not found "%s"\n', key)
    end

    return key, document
end

function M:raw_get(server, headers, stream)
    local req_method = headers:get(":method")

    local key, document = self:retreive_document(headers:get(":path"))

    local res_headers = http_headers.new()

    if document then
        res_headers:append(":status", "200")
        res_headers:append("content-type", "text/plain; charset=UTF-8")
        assert(stream:write_headers(res_headers, req_method == "HEAD"))

        if req_method ~= "HEAD" then
            assert(stream:write_body_from_string(document))
        end
    else
        res_headers:append(":status", "404")
        res_headers:append("content-type", "application/json")
        assert(stream:write_headers(res_headers, req_method == "HEAD"))

        if req_method ~= "HEAD" then
            assert(stream:write_body_from_string(cjson.encode({ message = "Document not found." })))
        end
    end
end

function M:get(_, headers, stream)
    local req_method = headers:get(":method")

    local key, document = self:retreive_document(headers:get(":path"))

    local res_headers = http_headers.new()

    if document then
        res_headers:append(":status", "200")
        res_headers:append("content-type", "application/json")
        assert(stream:write_headers(res_headers, req_method == "HEAD"))

        if req_method ~= "head" then
            assert(stream:write_body_from_string(cjson.encode({ data = document, key = key })))
        end
    else
        res_headers:append(":status", "404")
        res_headers:append("content-type", "application/json")
        assert(stream:write_headers(res_headers, req_method == "HEAD"))

        if req_method ~= "HEAD" then
            assert(stream:write_body_from_string(cjson.encode({ message = "Document not found." })))
        end
    end
end

function M:post(_, _, stream)
    -- TODO: Check length

    local key = self.keygen:gen_key()
    local res_headers = http_headers.new()

    local text = stream:get_body_as_string()

    if self.store:store(key, text) then
        utils.stdout_fmt("info", 'Added document "%s"\n', key)

        res_headers:append(":status", "200")
        res_headers:append("content-type", "application/json")
        assert(stream:write_headers(res_headers, false))

        assert(stream:write_body_from_string(cjson.encode({ key = key })))
    else
        utils.stderr_fmt("critical", 'Error adding document "%s"\n', key)

        res_headers:append(":status", "500")
        res_headers:append("content-type", "application/json")
        assert(stream:write_headers(res_headers, false))

        assert(stream:write_body_from_string(cjson.encode({ message = "Error adding document." })))
    end
end

function M.new(keygen, store)
    local ret = {}
    ret.keygen = keygen
    ret.store = store
    return setmetatable(ret, M)
end

return M
