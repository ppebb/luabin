-- All options specified here are default values and not required EXCEPT for
-- host, port, and storage

-- Options may be provided as environment variables, formatted as all
-- uppercase, with fields being separated by underscores

-- As an example, logging.levels.debug = true would be LOGGING_LEVELS_DEBUG=true

return {
    host = "localhost",
    port = 10003,

    -- Maximum document length in characters
    max_length = 400000,

    -- Should static files be cached. Disable when developing the frontend if
    -- you don't want to restart the server every time you make a change
    cache_static_files = true,

    logging = {
        -- Set any of these to false to disable their associated output
        levels = {
            debug = true,
            info = true,
            warning = true,
        },

        -- Options: console, file (stored in ./log by default)
        type = "console",

        -- Uncomment to determine where the log file goes if logging to a file
        -- path = "./log"

        -- Should the console log have colors
        colorize = true,
    },

    -- NOTE: Keys should not contain dots or colons. Anything containing a dot
    -- or colon will be parsed by the frontend incorrectly
    key_generator = {
        -- Options:
        -- phonetic: pwgen style, alternating consonants and vowels
        -- random: random mix of letters and numbers
        -- dictionary: to be implemented
        type = "random",

        -- Key length
        length = 10,

        -- Uncomment to determine the string sampled from when using random,
        -- defaults to all letters uppercase and lowercase and numbers
        -- keyspace = "whatever_you_want",
    },

    -- WARNING: A VALID STORAGE CONFIGURATION IS REQUIRED
    storage = {
        -- Options: file, sql_db
        type = "sql_db",
        -- global options -------------------------------------------------------------------------

        -- Uncomment to set the time until deletion for a document.
        -- expiry_seconds = 2592000, -- 30 Days

        -- NOTE: Checking the entire document storage for expired files may be
        -- expensive; please ensure you run it at a *reasonable* interval

        -- How often checks are performed for expired documents in seconds.
        -- expiry_check_interval = 86400, -- One day

        -- file options ---------------------------------------------------------------------------

        -- Uncomment to set the storage path
        -- path = "./data",

        -- sql_db options -------------------------------------------------------------------------

        -- For more comprehensive information about each driver's connection parameters, see:
        -- https://lunarmodules.github.io/luasql/manual.html#env_connect

        -- Options: postgres, ... more coming soon
        sql_db_type = "postgres",

        -- Each database expects slightly different login parameters, here are
        -- the universal three:
        sourcename = "dbname", -- Might not be a database name depending on your driver, see above
        username = "dbuser", -- Optional depending on db configuration
        password = "password133", -- Optional depending on db configuration

        -- Postgres also allows for a hostname and a port
        -- hostname = "",
        -- port = 5432,
    },

    documents = {
        about = "./about.md",
    },
}
