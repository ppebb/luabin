return {
    host = "localhost",
    port = 10003,

    keyLength = 10,

    maxLength = 400000,

    staticMaxAge = 86400,

    recompressStaticAssets = true,

    logging = {
        {
            level = "verbose",
            type = "Console",
            colorize = true,
        },
    },

    keyGenerator = {
        type = "phonetic",
    },

    rateLimits = {
        categories = {
            normal = {
                totalRequests = 500,
                every = 86400000,
            },
        },
    },
    storage = {
        type = "postgres",
        connectionUrl = "postgres://user:secret@localhost:port/dbname",
    },
    documents = {
        about = "./about.md",
    },
}
