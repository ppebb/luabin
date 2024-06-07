local M = {}
M.__index = M

local VOWELS = "aeiou"
local CONSONANTS = "bcdfghjklmnpqrstvwxyz"

function M:gen_key()
    local function randChar(str)
        local idx = math.ceil(math.random() * #str)
        return str:sub(idx, idx)
    end

    local ret = ""
    local start = math.floor(math.random() + 0.5)

    for i = 1, self.len do
        ret = ret .. randChar((i % 2 == start) and VOWELS or CONSONANTS)
    end

    return ret
end

function M.new(config)
    local ret = {}
    ret.len = os.getenv("KEY_GENERATOR_LENGTH") or config.key_generator.length or 10
    return setmetatable(ret, M)
end

return M
