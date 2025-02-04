local M = {}

local config = require("server.config")
local http_headers = require("http.headers")
local getenv = os.getenv

local log_method
local log_path

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
--- @param text string
--- @return boolean
function M.write_file(path, text)
    if M.file_exists(path) then
        M.stderr_fmt("critical", 'Unable to write to file "%s", file already exists\n', path)
        return false
    end

    local fd, err = io.open(path, "w")
    if not fd then
        M.stderr_fmt("critical", 'Unable to store to file "%s", error: %s\n', path, err)
        return false
    end

    assert(fd:write(text))
    fd:close()

    return true
end

--- @param path string
--- @return string|nil
function M.read_file(path)
    local fd, err = io.open(path, "r")
    if not fd then
        M.stderr_fmt("critical", 'Unable to read file "%s", error: "%s"\n', path, err)
        return nil
    end

    local ret = fd:read("*a")
    fd:close()

    return ret
end

--- @param path string
--- @return string
function M.get_last_segment(path) return path:match("/(%w+)$") end

--- @param path string
--- @return string
function M.sanitize(path)
    -- Weak sanitizer, only checks for traversals and restricts input to alphanumerical characters, . - and _
    local no_traversal, _ = path:gsub("%.+", ".")
    local ret, _ = no_traversal:gsub("[^%w/%.-_]", "")
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

--- @param name string
--- @return any
local function config_from_string(name)
    local ret = config

    for segment in name:gmatch("([^%.]+)") do
        ---@diagnostic disable-next-line: cast-local-type
        ret = ret[segment]
    end

    return ret
end

--- @param name string
--- @param forced boolean|nil
function M.config_value(name, default, forced)
    local env_sub, _ = name:gsub("%.", "_")
    local env = env_sub:upper()
    local env_res = getenv(env)

    if env_res then
        local res = (type(default) == "number" and tonumber(env_res))
            or (type(default) == "boolean" and env_res:lower() == "true")
            or type(default) == "string" and env_res

        if res then
            M.stdout_fmt("debug", "Config option %s resolved from environment variable %s\n", name, env)
            return res
        end
    end

    local config_opt = config_from_string(name)
    if type(config_opt) == type(default) then
        return config_opt
    end

    if not forced then
        M.stdout_fmt("warning", "Config option %s not found, defaulting to %s\n", name, default)
        return default
    end

    return nil
end

--- @param str string
--- @return number[]
function M.string_to_bytes(str) return { str:byte(1, -1) } end

--- @param json string
--- @param code string
--- @param head boolean
function M.respond_json(json, code, stream, head)
    local res_headers = http_headers.new()

    res_headers:append(":status", code)
    res_headers:append("content-type", "application/json")
    assert(stream:write_headers(res_headers, head))

    if not head then
        assert(stream:write_body_from_string(json))
    end
end

--- @param tbl table
--- @param value any
--- @return boolean
function M.tbl_contains(tbl, value)
    for _, v in pairs(tbl) do
        if v == value then
            return true
        end
    end

    return false
end

--- @param iter function
--- @return table
function M.collect(iter)
    local ret = {}

    for key, value in iter do
        if value then
            ret[key] = value
        else
            table.insert(ret, key)
        end
    end

    return ret
end

--- Applies `func` to each key-value pair in the table, providing the key and
--- value as arguments
--- @param tbl table
--- @param func function
--- @return table
function M.transform(tbl, func)
    local ret = {}

    for k, v in pairs(tbl) do
        ret[k] = func(k, v)
    end

    return ret
end

--- @param path string
--- @param exit_on_failure boolean|nil
--- @param str string|nil Used for stderr_fmt's str arg
--- @param ... any Used for stderr_fmt's ... arg
--- @return any|nil
function M.p_require(path, exit_on_failure, str, ...)
    local ok, module = pcall(require, path)

    if ok then
        return module
    else
        if str then
            M.stderr_fmt("critical", str, ...)
        end

        if exit_on_failure then
            os.exit(1, true)
        end

        return nil
    end
end

--- @param str string
--- @param ... any
function M.stdout_fmt(severity, str, ...)
    if config.logging.levels[severity] or severity == "critical" then
        ---@diagnostic disable-next-line: need-check-nil
        log_method(severity, string.format("%s: %s", severity:upper(), string.format(str, ...)), io.stdout)
    end
end

--- @param str string
--- @param ... any
function M.stderr_fmt(severity, str, ...)
    if config.logging.levels[severity] or severity == "critical" then
        ---@diagnostic disable-next-line: need-check-nil
        log_method(severity, string.format("%s: %s", severity:upper(), string.format(str, ...)), io.stderr)
    end
end

local function log_console_color(severity, str, handle)
    local severity_to_color = {
        ["critical"] = "31",
        ["warning"] = "33",
        ["info"] = "39",
        ["debug"] = "36",
    }

    handle:write(string.format("\27[%sm%s\27[0m", severity_to_color[severity], str))
end

local function log_console_no_color(_, str, handle) handle:write(str) end

local fd = nil
local function log_file(_, str, _)
    if not fd then
        ---@diagnostic disable-next-line: param-type-mismatch
        local err
        fd, err = io.open(log_path, "a+")

        if not fd then
            M.stderr_fmt("critical", 'Unable to open file "%s", error: "%s"\n', log_path, err)
            os.exit(1, true)
        end
    end

    fd:write(str)
end

function M.init()
    local log_type = M.config_value("logging.type", "console")

    if log_type == "console" then
        if M.config_value("logging.colorize", true) then
            log_method = log_console_color
        else
            log_method = log_console_no_color
        end
    elseif log_type == "file" then
        log_method = log_file
        log_path = M.config_value("logging.path", "./log")
    end
end

return M
