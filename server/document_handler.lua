local M = {}
M.__index = M

local cjson = require("cjson")
local enry = require("server.enry")
local http_headers = require("http.headers")
local languages = require("server.languages")
local utils = require("server.utils")

function M:retreive_document(path)
    local key = utils.get_last_segment(utils.sanitize(path))

    local document, lang = self.store:retrieve(key)

    if document then
        utils.stdout_fmt("info", 'Retrieved document "%s-%s"\n', key, lang)
    else
        utils.stderr_fmt("info", 'Document not found "%s"\n', key)
    end

    if document and not lang then
        utils.stderr_fmt("warn", 'Document "%s" missing lang info', key)
    end

    return key, document, lang
end

function M:raw_get(_, headers, stream)
    local req_method = headers:get(":method")

    local _, document, _ = self:retreive_document(headers:get(":path"))

    local res_headers = http_headers.new()

    if document then
        res_headers:append(":status", "200")
        res_headers:append("content-type", "text/plain; charset=UTF-8")
        assert(stream:write_headers(res_headers, req_method == "HEAD"))

        if req_method ~= "HEAD" then
            assert(stream:write_body_from_string(document))
        end
    else
        utils.respond_json(cjson.encode({ message = "Document not found." }), "404", stream, req_method == "HEAD")
    end
end

function M:get(_, headers, stream)
    local req_method = headers:get(":method")

    local key, document, lang = self:retreive_document(headers:get(":path"))

    if document then
        utils.respond_json(
            cjson.encode({ data = document, key = key, lang = lang }),
            "200",
            stream,
            req_method == "HEAD"
        )
    else
        utils.respond_json(cjson.encode({ message = "Document not found." }), "404", stream, req_method == "HEAD")
    end
end

-- lang should be a valid Enry language
--- @private
function M:handle_post(text, lang, stream)
    local lang_ts = languages.enry_to_ts(lang)

    local key = self.keygen:gen_key()

    if self.store:store(key, text, lang_ts) then
        utils.stdout_fmt("info", 'Added document "%s" with language "%s" and parser "%s"\n', key, lang, lang_ts)

        utils.respond_json(cjson.encode({ key = key, lang = lang_ts }), "200", stream, false)
    else
        utils.stderr_fmt("critical", 'Error adding document "%s"\n', key)

        utils.respond_json(cjson.encode({ message = "Error adding document." }), "500", stream, false)
    end
end

local function lang_from_text(text)
    -- TODO: If multiple languages are returned by the first two, then use those to restrict the classifier
    local lang, safe = enry.get_language_by_shebang(text)

    if not safe then
        lang, safe = enry.get_language_by_modeline(text)
    end

    if not safe then
        lang, safe = enry.get_language_by_classifier(text, languages.allowed_langs())
    end

    return lang, safe
end

function M:post(_, _, stream)
    local text = stream:get_body_as_string()

    if #text < 1 then
        utils.respond_json(cjson.encode({ message = "Document length zero." }), "400", stream, false)
        return
    end

    if #text > self.max_len then
        utils.respond_json("Document exceeds maximum length.", "400", stream, false)
        return
    end

    local lang, _ = lang_from_text(text)

    self:handle_post(text, lang, stream)
end

function M:post_json(_, _, stream)
    local req = cjson.decode(stream:get_body_as_string())
    local text = req.data

    if not text then
        utils.respond_json(
            cjson.encode({ message = "Malformed json request, missing data field" }),
            "400",
            stream,
            false
        )
    end

    if #text > self.max_len then
        utils.respond_json("Document exceeds maximum length.", "400", stream, false)
        return
    end

    if #text < 1 then
        utils.respond_json(cjson.encode({ message = "Document length zero." }), "400", stream, false)
        return
    end

    -- TODO: Length checks on fname, lang, ext, to ensure sending something overly long does not cause issues

    if req.lang then
        local lang = languages.resolve_lang(req.lang)

        if lang then
            self:handle_post(req.data, lang, stream)
            return
        end
    end

    if req.ext then
        local lang
        local langs, safe = languages.langs_from_ext(req.ext)

        if langs and safe then
            lang = langs[1]
        else
            lang, _ = enry.get_language_by_file(req.ext, text)
        end

        self:handle_post(req.data, lang, stream)
        return
    end

    if req.fname then
        local lang
        local langs, safe

        local ext = utils.get_ext(req.fname)
        if ext then
            langs, safe = languages.langs_from_ext(ext)
        end

        if langs and safe then
            lang = langs[1]
        else
            lang, _ = enry.get_language_by_file(req.fname, text)
        end

        self:handle_post(text, lang, stream)
        return
    end

    local lang, _ = lang_from_text(text)
    self:handle_post(text, lang, stream)
end

function M.new(keygen, store)
    local ret = {}
    ret.keygen = keygen
    ret.store = store
    ret.max_len = utils.config_value("max_length", 400000)
    return setmetatable(ret, M)
end

return M
