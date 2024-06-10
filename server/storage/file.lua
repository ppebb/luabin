local M = {}
M.__index = M

local lfs = require("lfs")
local md5 = require("md5")
local utils = require("server.utils")

--- @return boolean
function M:store(key, text)
    local hash = md5.sumhexa(key)
    local path = utils.path_combine(self.storage_path, hash)

    if utils.file_exists(path) then
        utils.stderr_fmt('Unable to store to file "%s", file already exists\n', path)
        return false
    end

    local fd, err = io.open(path, "w")
    if not fd then
        utils.stderr_fmt('Unable to store to file "%s", error: %s\n', path, err)
        return false
    end

    assert(fd:write(text))
    fd:close()

    return true
end

--- @return string|nil
function M:retrieve(key)
    local hash = md5.sumhexa(key)
    local path = utils.path_combine(self.storage_path, hash)

    local fd, err = io.open(path, "r")
    if fd then
        local ret = fd:read("*a")
        fd:close()

        return ret
    else
        utils.stderr_fmt('Unable to read file "%s", error: "%s"\n', path, err)
        return nil
    end
end

function M.new(config)
    local ret = {}
    local storage_path = os.getenv("STORAGE_PATH") or config.storage.path
    if not storage_path then
        utils.stderr_fmt('Missing config option storage.path, defaulting to "./data"\n')
        storage_path = "data"
    end

    ret.storage_path = storage_path

    lfs.mkdir(storage_path)

    return setmetatable(ret, M)
end

return M
