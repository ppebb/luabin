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
    local ret = path:gsub("[^%w/]", "")
    return ret
end

function M.starts_with(str, start) return string.sub(str, 1, #start) == start end

function M.ends_with(str, ending) return ending == "" or string.sub(str, -#ending) == ending end

function M.stdout_fmt(str, ...) io.stdout:write(string.format(str, ...)) end

function M.stderr_fmt(str, ...) io.stderr:write(string.format(str, ...)) end

return M
