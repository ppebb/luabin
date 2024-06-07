local M = {}
M.__index = M

function M:gen_key()
    local ret = ""

    for _ = 1, self.len do
        local idx = math.ceil(math.random() * #self.keyspace)
        ret = ret .. self.keyspace:sub(idx, idx)
    end

    return ret
end

function M.new(config)
    local ret = {}
    ret.len = os.getenv("KEY_GENERATOR_LENGTH") or config.key_generator.length or 10
    ret.keyspace = config.key_generator.keyspace or "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return setmetatable(ret, M)
end

return M
