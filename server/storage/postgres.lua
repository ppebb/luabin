local base = require("server.storage.database")
local utils = require("server.utils")

local M = {}

--- @private
function M:verify_version()
    local output

    self:connection_ctx(function(conn)
        -- Hopefully should not error
        local cur, _ = conn:execute("SELECT version();")
        output = cur:fetch()
        cur:close()
    end)

    -- Some string like:
    -- PostgreSQL 13.14 (Debian 13.14-0+deb11u1) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
    local version_str = output:gmatch("PostgreSQL (%d*%.%d*)")()
    local version_split_str = utils.collect(version_str:gmatch("([^%.]+)"))
    local version_split = utils.transform(version_split_str, function(_, v) return tonumber(v) end)

    -- Minimum 9.1
    if version_split[1] < 9 or (version_split[1] == 9 and version_split[2] < 1) then
        utils.stderr_fmt("critical", "Postgres version %s is too low! Minimum version is 9.1.\n", version_str)
        os.exit(1, true)
    end
end

function M:connection_args() return self.sourcename, self.username, self.password, self.hostname, self.port end

function M.new()
    local ret = M

    ret.hostname = utils.config_value("storage.hostname", "", true)
    ret.port = utils.config_value("storage.port", 5432)

    return base.new(ret)
end

return M
