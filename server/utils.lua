local M = {}

local config = require("server.config")
local getenv = os.getenv

--- @param ... string
--- @return string
function M.path_combine(...)
    local args = { ... }
    local res = args[1]
    for i = 2, #args do
        local segment = args[i]
        local rew = M.ends_with(res, "/")
        local ssw = M.starts_with(segment, "/")

        if rew and ssw then
            segment = segment:sub(2)
        elseif not rew and not ssw then
            segment = "/" .. segment
        end

        res = res .. segment
    end

    return res
end

--- @param path string
--- @return boolean
function M.file_exists(path)
    local f = io.open(path, "rb")
    if f then
        f:close()
    end
    return f ~= nil
end

--- @param path string
--- @return string
function M.get_last_segment(path) return path:match("/(%w+)$") end

--- @param path string
--- @return string
function M.sanitize(path)
    -- Weak sanitizer, only checks for traversals and restricts input to alphanumerical characters, single dots, and dashes
    local no_traversal, _ = path:gsub("%.+", ".")
    local ret, _ = no_traversal:gsub("[^%w/%.-]", "")
    return ret
end

--- @param str string
--- @param start string
--- @return boolean
function M.starts_with(str, start) return str:sub(1, #start) == start end

--- @param str string
--- @param ending string
--- @return boolean
function M.ends_with(str, ending) return ending == "" or str:sub(-#ending) == ending end

--- @param str string
--- @return string|nil
function M.get_ext(str) return str:match("%.(%w+)$") end

--- @param str string
--- @param ... string
function M.stdout_fmt(severity, str, ...)
    if config.logging.levels[severity] or severity == "critical" then
        io.stdout:write(severity:upper() .. ": " .. string.format(str, ...))
    end
end

--- @param str string
--- @param ... string
function M.stderr_fmt(severity, str, ...)
    if config.logging.levels[severity] or severity == "critical" then
        io.stderr:write(severity:upper() .. ": " .. string.format(str, ...))
    end
end

--- @param name string
--- @return any
function M.config_from_string(name)
    local ret = config

    for segment in name:gmatch("([^%.]+)") do
        ret = ret[segment]
    end

    return ret
end

-- TODO: Find a way to combine all three of the following methods. Maybe some metatable stuff?

--- @param name string
--- @param env string
--- @param default number|nil
--- @return number|nil
function M.config_value_int(name, env, default)
    local env_res = getenv(env)

    if env_res then
        local num = tonumber(env_res)

        if num then
            M.stdout_fmt("debug", "Config option %s resolved from environment variable %s\n", name, env)
            return num
        end
    end

    local config_opt = M.config_from_string(name)
    if type(config_opt) == "number" then
        return config_opt
    end

    if default then
        M.stdout_fmt("warning", "Config option %s not found, defaulting to %s\n", name, default or "nil")
    end

    return default
end

--- @param name string
--- @param env string
--- @param default boolean
--- @return boolean
function M.config_value_bool(name, env, default)
    local env_res = getenv(env)

    if env_res then
        local bool = env_res:lower() == "true" or false

        M.stdout_fmt("debug", "Config option %s resolved from environment variable %s\n", name, env)
        return bool
    end

    local config_opt = M.config_from_string(name)
    if type(config_opt) == "boolean" then
        return config_opt
    end

    if default then
        M.stdout_fmt("warning", "Config option %s not found, defaulting to %s\n", name, default or "nil")
    end

    return default
end

--- @param name string
--- @param env string
--- @param default string|nil
--- @return string|nil
function M.config_value_string(name, env, default)
    local env_res = getenv(env)

    if env_res then
        M.stdout_fmt("debug", "Config option %s resolved from environment variable %s\n", name, env)
        return env_res
    end

    local config_opt = M.config_from_string(name)
    if type(config_opt) == "string" then
        return config_opt
    end

    if default then
        M.stdout_fmt("warning", "Config option %s not found, defaulting to %s\n", name, default or "nil")
    end

    return default
end

return M
