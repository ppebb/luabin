local M = {}

local languages = require("server.languages")

function M.gen_allowed_parsers()
    local allowed_parsers = languages.allowed_parsers()

    local js = "export const allowed_parsers:string[]=["

    for i, parser in ipairs(allowed_parsers) do
        js = js .. string.format('"%s"%s', parser, (i ~= #allowed_parsers and "," or ""))
    end

    js = js .. "];"

    print(js)
end

function M.gen_ext_to_parser_map()
    local allowed_parsers = languages.allowed_parsers()

    local filtered_ext_map = {}
    local ordered_keys = {}

    -- Filter down so only one extension maps to a given language. Avoid
    -- conflicts because we can't resolve them client-side and this is good
    -- enough...
    for _, parser in ipairs(allowed_parsers) do
        local enry_lang = languages.ts_to_enry(parser)
        local exts = languages.exts_from_lang(enry_lang)

        if exts then
            for _, ext in ipairs(exts) do
                local enry_langs = languages.langs_from_ext(ext)

                ---@diagnostic disable: param-type-mismatch
                for _, lang in ipairs(enry_langs) do
                    if not filtered_ext_map[ext] then
                        filtered_ext_map[ext] = languages.enry_to_ts(lang)
                    end
                end
            end
        end
    end

    for key, _ in pairs(filtered_ext_map) do
        table.insert(ordered_keys, key)
    end

    table.sort(ordered_keys, function(a, b) return a < b end)

    local js = [[interface Dictionary<T> { [key: string]: T; }
export const ext_to_parser_map:Dictionary<string>={]]

    for i, key in pairs(ordered_keys) do
        js = js .. string.format('"%s":"%s"%s', key, filtered_ext_map[key], (i ~= #ordered_keys and "," or ""))
    end

    js = js .. "};"
    print(js)
end

M.gen_allowed_parsers()
M.gen_ext_to_parser_map()

return M
