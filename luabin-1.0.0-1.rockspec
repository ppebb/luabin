package = "luabin"
version = "1.0.0-1"

source = {
    url = "git+https://github.com/ppebb/luabin.git",
}

dependencies = {
    "lua >= 5.1",
    "http",
    "lua-zlib",
    "lua-cjson",
    "luafilesystem",
    "libmagic",
    "cffi-lua",
}

build = {
    type = "builtin",
    modules = {
        ["luabin"] = "server/init.lua",
    },
}
