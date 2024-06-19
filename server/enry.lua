local ffi = require("cffi")
local utils = require("server.utils")

local enry = ffi.load("./build/go-enry/.shared/linux-x86-64/libenry.so")

ffi.cdef([[
typedef struct { const char *p; ptrdiff_t n; } _GoString_;
typedef _GoString_ GoString;

typedef signed char GoInt8;
typedef unsigned char GoUint8;
typedef short GoInt16;
typedef unsigned short GoUint16;
typedef int GoInt32;
typedef unsigned int GoUint32;
typedef long long GoInt64;
typedef unsigned long long GoUint64;
typedef GoInt64 GoInt;
typedef GoUint64 GoUint;
typedef size_t GoUintptr;
typedef float GoFloat32;
typedef double GoFloat64;

typedef char _check_for_64_bit_pointer_matching_GoInt[sizeof(void*)==64/8 ? 1:-1];

typedef void *GoMap;
typedef void *GoChan;
typedef struct { void *t; void *v; } GoInterface;
typedef struct { void *data; GoInt len; GoInt cap; } GoSlice;

extern GoString GetLanguage(GoString filename, GoSlice content);

/* Return type for GetLanguageByContent */
struct GetLanguageByContent_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByContent_return GetLanguageByContent(GoString filename, GoSlice content);

/* Return type for GetLanguageByEmacsModeline */
struct GetLanguageByEmacsModeline_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByEmacsModeline_return GetLanguageByEmacsModeline(GoSlice content);

/* Return type for GetLanguageByExtension */
struct GetLanguageByExtension_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByExtension_return GetLanguageByExtension(GoString filename);

/* Return type for GetLanguageByFilename */
struct GetLanguageByFilename_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByFilename_return GetLanguageByFilename(GoString filename);

/* Return type for GetLanguageByModeline */
struct GetLanguageByModeline_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByModeline_return GetLanguageByModeline(GoSlice content);

/* Return type for GetLanguageByShebang */
struct GetLanguageByShebang_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByShebang_return GetLanguageByShebang(GoSlice content);

/* Return type for GetLanguageByVimModeline */
struct GetLanguageByVimModeline_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByVimModeline_return GetLanguageByVimModeline(GoSlice content);

/* Return type for GetLanguageByClassifier */
struct GetLanguageByClassifier_return {
    GoString r0; /* language */
    GoUint8 r1; /* safe */
};
extern struct GetLanguageByClassifier_return GetLanguageByClassifier(GoSlice content, GoSlice candidates);

// TODO: Seemingly unable to process a GoSlice* from Lua. May need a c intermediary to reformat the data into something consumable from Lua.
extern void GetLanguageExtensions(GoString language, GoSlice* result);
extern void GetLanguages(GoString filename, GoSlice content, GoSlice* result);
extern void GetLanguagesByContent(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByEmacsModeline(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByExtension(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByFilename(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByModeline(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByShebang(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern void GetLanguagesByVimModeline(GoString filename, GoSlice content, GoSlice candidates, GoSlice* result);
extern GoString GetMimeType(GoString path, GoString language);
extern GoUint8 IsBinary(GoSlice data);
extern GoUint8 IsConfiguration(GoString path);
extern GoUint8 IsDocumentation(GoString path);
extern GoUint8 IsDotFile(GoString path);
extern GoUint8 IsImage(GoString path);
extern GoUint8 IsVendor(GoString path);
extern GoUint8 IsGenerated(GoString path, GoSlice content);
extern GoString GetColor(GoString language);
extern GoUint8 IsTest(GoString path);
extern GoString GetLanguageType(GoString language);
]])

local M = {}

local type_gslice = ffi.metatype("GoSlice", {})
local type_gstring = ffi.metatype("GoString", {})

local function array_to_gslice(tbl, type)
    local len = #tbl
    local arr = ffi.new(type .. "[" .. len .. "]", tbl)
    local ptr = ffi.new("void *", arr)

    return type_gslice(ptr, len, len)
end

local function string_to_gstring(str) return type_gstring(str, #str) end

local function gstring_to_string(struct) return ffi.string(struct.p, struct.n) end

local function split_return_struct(struct) return struct.r0, struct.r1 end

local function string_arr_to_gstring_arr(tbl)
    local ret = {}
    for _, str in ipairs(tbl) do
        table.insert(ret, string_to_gstring(str))
    end

    return ret
end

local function get_language_by_text(method, contents)
    local slice = array_to_gslice(utils.string_to_bytes(contents), "char")

    local lang, safe = split_return_struct(enry["GetLanguageBy" .. method](slice))

    return gstring_to_string(lang), tonumber(safe) == 1
end

function M.get_language_by_shebang(contents) return get_language_by_text("Shebang", contents) end

function M.get_language_by_modeline(contents) return get_language_by_text("Modeline", contents) end

function M.get_language_by_classifier(contents, candidates)
    local contents_slice = array_to_gslice(utils.string_to_bytes(contents), "char")
    local candidates_slice = array_to_gslice(string_arr_to_gstring_arr(candidates), "GoString")

    local lang, safe = split_return_struct(enry.GetLanguageByClassifier(contents_slice, candidates_slice))

    return gstring_to_string(lang), tonumber(safe) == 1
end

function M.get_language_by_file(fname, contents)
    local fname_gstring = string_to_gstring(fname)
    local contents_slice = array_to_gslice(utils.string_to_bytes(contents), "char")

    return gstring_to_string(enry.GetLanguage(fname_gstring, contents_slice))
end

function M.get_language_by_extension(ext)
    local lang, safe = split_return_struct(enry.GetLanguageByExtension(string_to_gstring(ext)))

    return gstring_to_string(lang), tonumber(safe) == 1
end

function M.get_language_by_filename(fname)
    local lang, safe = split_return_struct(enry.GetLanguageByFilename(string_to_gstring(fname)))

    return gstring_to_string(lang), tonumber(safe) == 1
end

return M
