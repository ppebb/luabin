local M = {}

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
function M.stdout_fmt(str, ...) io.stdout:write(string.format(str, ...)) end

--- @param str string
--- @param ... string
function M.stderr_fmt(str, ...) io.stderr:write(string.format(str, ...)) end

return M
