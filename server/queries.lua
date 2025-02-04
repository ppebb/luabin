local M = {}
M.__index = M

local cjson = require("cjson")
local utils = require("server.utils")

function M:get_queries(lang)
    local queries

    if self.should_cache then
        queries = self.cache[lang]

        if queries then
            return queries
        end
    end

    local success, queries_table = pcall(require, "queries/" .. lang)

    if success then
        queries = cjson.encode(queries_table)
        self.cache[lang] = queries

        return queries
    else
        return nil
    end
end

function M:get(_, headers, stream)
    local req_method = headers:get(":method")

    local lang = utils.get_last_segment(utils.sanitize(headers:get(":path")))
    local queries = self:get_queries(lang)

    if queries then
        utils.respond_json(queries, "200", stream, req_method == "HEAD")
    else
        utils.respond_json(cjson.encode({ message = "Queries not found." }), "404", stream, req_method == "HEAD")
    end
end

function M.new()
    local ret = {}
    ret.should_cache = utils.config_value("cache_static_files", true)
    ret.cache = {}

    return setmetatable(ret, M)
end

return M
