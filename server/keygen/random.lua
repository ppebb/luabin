local M = {}
M.__index = M

local utils = require("server.utils")

function M:gen_key()
    local ret = ""

    for _ = 1, self.len do
        local idx = math.ceil(math.random() * #self.keyspace)
        ret = ret .. self.keyspace:sub(idx, idx)
    end

    return ret
end

function M.new()
    local ret = {}
    ret.len = utils.config_value("key_generator.length", 10)
    ret.keyspace =
        utils.config_value("key_generator.keyspace", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
    return setmetatable(ret, M)
end

return M
