return {
    host = "localhost",
    port = 10003,

    key_length = 10,

    max_length = 400000,

    static_max_age = 86400,

    recompress_static_assets = true,

    logging = {
        {
            level = "verbose",
            type = "Console",
            colorize = true,
        },
    },

    key_generator = {
        type = "phonetic",
    },

    rate_limits = {
        categories = {
            normal = {
                total_requests = 500,
                every = 86400000,
            },
        },
    },

    storage = {
        type = "file",
    },

    documents = {
        about = "./about.md",
    },
}
