local M = {}
M.__index = M

local utils = require("server.utils")

function M:expire_documents()
    local num_rows, err

    self:connection_ctx(function(conn)
        num_rows, err = conn:execute(string.format("DELETE FROM luabin_entries WHERE expiration < %s", os.time()))
    end)

    if err then
        utils.stderr_fmt("critical", 'Failed to delete expired documents from database, error: "%s"\n', err)
    else
        utils.stdout_fmt("info", "Successfully deleted %s documents from database\n", num_rows)
    end
end

--- @return boolean
function M:store(key, text, lang)
    local err

    self:connection_ctx(function(conn)
        _, err = conn:execute(
            string.format(
                [[INSERT INTO luabin_entries(key, value, lang, expiration) VALUES ('%s', '%s', '%s', %s);]],
                key,
                M.escape(conn, text),
                lang,
                os.time() + self.expire_seconds
            )
        )
    end)

    if err then
        utils.stderr_fmt("warning", 'failed to persist value to database, error: "%s"\n', err)
        return false
    end

    return true
end

--- @return string|nil, string|nil
function M:retrieve(key)
    local ret1, ret2
    self:connection_ctx(function(conn)
        local cur, err = conn:execute(
            string.format(
                [[SELECT id,value,lang,expiration FROM luabin_entries WHERE KEY = '%s' AND expiration > %s;]],
                key,
                os.time()
            )
        )

        if err then
            utils.stderr_fmt("critical", 'Unable to retrieve value from database, error: "%s"\n', err)
            ret1, ret2 = nil, nil
        else
            local row = cur:fetch({}, "a")

            -- Row may be nil, does not indicate an error, just that the
            -- document was not found
            if row then
                ret1 = row.value
                ret2 = row.lang
            end
        end
    end)

    return ret1, ret2
end

--- Executes `callback`, providing the connection as the first argument.
--- Returns true on success, false on failure
--- @return boolean
--- @protected
function M:connection_ctx(callback, exit_on_failure)
    local connection, err = self.env:connect(self:connection_args())

    if not connection then
        utils.stderr_fmt("critical", 'Unable to connect to postgres database, error: "%s"\n', err)

        if exit_on_failure then
            os.exit(1, true)
        end

        return false
    end

    callback(connection)

    return connection:close()
end

--- Returns the arguments necessary for connecting to the server. Overridden by
--- some servers with extra args
--- @protected
function M:connection_args() return self.sourcename, self.username, self.password end

--- @param str string
--- @return string
function M.escape(conn, str)
    if conn.escape then
        return conn:escape(str)
    end

    local a = str:gsub('"', '""')
    local b = a:gsub("'", "''")

    return b
end

--- @protected
function M:create_table()
    local err
    self:connection_ctx(function(conn)
        _, err = conn:execute([[
            CREATE TABLE IF NOT EXISTS luabin_entries (
                id serial primary key,
                key varchar(255) not null,
                value text not null,
                lang varchar(30) not null,
                expiration int,
                unique(key)
            );]])
    end, true)

    if err then
        utils.stderr_fmt("critical", 'Unable to create table in database, error: "%s"\n', err)
        os.exit(true, 1)
    else
        utils.stdout_fmt("info", "Successfully created table luabin_entries or it already exists!\n")
    end
end

-- TODO: Specify minimum versions of servers other than postgres in their inherited classes

--- @protected
function M.new(o)
    local ret = o or {}

    local driver_name = utils.config_value("storage.sql_db_type", "", true)
    ret.driver = utils.p_require(
        "luasql." .. (driver_name or ""),
        true,
        'Unknown storage type, or you forgot to install the correct driver. Current driver is: "%s"',
        driver_name
    )
    ret.env = ret.driver[driver_name]()
    ret.expire_seconds = utils.config_value("storage.expiry_seconds", 2592000)

    ret.sourcename = utils.config_value("storage.sourcename", "", true)
    ret.username = utils.config_value("storage.username", "", true)
    ret.password = utils.config_value("storage.password", "", true)

    -- Can't check for uname or pwd because some dbs may be configured to be open login...
    -- if they're missing it'll just error on connection, good enough
    if not ret.sourcename then
        utils.stderr_fmt("critical", "Missing config option for database sourcename!\n")
        os.exit(1, true)
    end

    ret = setmetatable(ret, M)
    ret:create_table()

    return ret
end

return M
