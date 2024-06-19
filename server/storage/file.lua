local M = {}
M.__index = M

local lfs = require("lfs")
local utils = require("server.utils")

function M:expire_documents()
    for file in lfs.dir(self.storage_path) do
        if file ~= "." and file ~= ".." then
            local full_path = utils.path_combine(self.storage_path, file)
            local attr = lfs.attributes(full_path)

            if os.time() - attr.modification > self.expire_seconds then
                utils.stdout_fmt("info", 'Removed expired file "%s"\n', full_path)
                os.remove(full_path)
                os.remove(full_path .. "-lang")
            end
        end
    end
end

--- @return boolean
function M:store(key, text, lang)
    if not key or not text or not lang then
        return false
    end

    local path = utils.path_combine(self.storage_path, key)
    local lang_path = path .. "-lang"

    return utils.write_file(path, text) and utils.write_file(lang_path, lang)
end

--- @return string|nil, string|nil
function M:retrieve(key)
    if not key then
        return nil, nil
    end

    local path = utils.path_combine(self.storage_path, key)
    local lang_path = path .. "-lang"

    return utils.read_file(path), utils.read_file(lang_path)
end

function M.new()
    local ret = {}
    local storage_path = utils.config_value("storage.path", "./data")

    ret.storage_path = storage_path
    ret.expire_seconds = utils.config_value("storage.expiry_seconds", 2592000)

    lfs.mkdir(storage_path)

    return setmetatable(ret, M)
end

return M
