-- All options specified here are default values and not required EXCEPT for host, port, and storage
-- Options may be provided as environment variables, formatted as all uppercase, with fields being separated by underscores
-- As an example, logging.level = "debug" would be LOGGING_LEVEL="debug"

return {
    host = "localhost",
    port = 10003,

    -- Maximum document length in characters
    max_length = 400000,

    -- Maximum document age
    static_max_age = 86400,

    -- Should static files be cached. Disable when developing the frontend if you don't want to restart the server every time
    cache_static_files = false,

    logging = {
        levels = {
            -- Set any of these to false to disable their associated output
            debug = false,
            info = true,
            warning = true,
        },

        -- Options: console, file (stored in ./log by default)
        type = "console",
        -- Uncomment to determine where the log file goes if logging to a file
        -- path = "./log"

        -- Should the log have colors
        colorize = true,
    },

    key_generator = {
        -- Options:
        -- phonetic: pwgen style, alternating consonants and vowels
        -- random: random mix of letters and numbers
        -- dictionary: to be implemented
        type = "random",

        -- Key length
        length = 10,

        -- Uncomment to determine the string sampled from when using random, defaults to all letters uppercase and lowercase and numbers
        -- keyspace = "whatever_you_want"
    },

    -- to be implemented
    rate_limits = {
        categories = {
            normal = {
                total_requests = 500,
                every = 86400000,
            },
        },
    },

    -- WARNING: A VALID STORAGE CONFIGURATION IS REQUIRED
    storage = {
        -- Options: file
        type = "file",

        -- Uncomment to set the storage path when using file storage
        -- path = "./data"
    },

    documents = {
        about = "./about.md",
    },
}
