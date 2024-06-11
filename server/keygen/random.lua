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
    ret.len = utils.config_value_int("key_generator.length", "KEY_GENERATOR_LENGTH", 10)
    ret.keyspace = utils.config_value_string(
        "key_generator.keyspace",
        "KEY_GENERATOR_KEYSPACE",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    )
    return setmetatable(ret, M)
end

return M
