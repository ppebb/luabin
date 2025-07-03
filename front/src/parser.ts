import { SparkMD5 } from "spark-md5";
import { showMessage } from "./main";

export interface Queries {
    highlights: string,
    injections: string,
    locals: string
}

// Cb will be called when/if the parser is resolved and downloaded
export async function getParserFromlang(lang: string, cb: (_: Queries, _1: Uint8Array) => void) {
    const url = `/tree-sitter-${lang}.wasm`;

    console.log("resolving parser for " + lang);

    const queries = await fetchQueries(lang);
    if (!queries)
        return;

    const cache = await caches.open("parser-cache");
    const cached = await cache.match(url);

    if (!cached) {
        showMessage(
            `${lang} parser not found in cache! Download?`, "info",
            async function() {
                const parser = await fetchParser(cache, lang, url);

                if (parser)
                    cb(queries, parser);
            }
        );

        return;
    }

    const arrayBuffer = await cached.arrayBuffer();
    const md5 = localStorage.getItem(url + ".md5sum");

    console.log(`${lang} parser retrieved from cache`);
    cb(queries, new Uint8Array(arrayBuffer));

    const response = await fetch(url + ".md5sum");

    if (!response.ok) {
        showMessage(`Unable to retrieve hash for cached ${lang} parser, parser may be out of date!`, "info", null);
        return;
    }

    const serverSum = (await response.text()).trimEnd();

    if (serverSum == md5)
        return;

    showMessage(
        `Checksum mismatch for cached ${lang} parser. Re-download?`, "info",
        async function() {
            const parser = await fetchParser(cache, lang, url);

            if (parser)
                cb(queries, parser);
        }
    );
}

async function fetchParser(cache: Cache, lang: string, url: string) {
    const response = await fetch(url);

    if (response.ok) {
        const clone = response.clone();

        const arrayBuffer = await response.arrayBuffer();
        const md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer, false);

        localStorage.setItem(url + ".md5sum", md5);
        cache.put(url, clone);

        return new Uint8Array(arrayBuffer);
    }
    else {
        showMessage(`Unable to get parser for ${lang}, request failed with status ${response.status}, message: ${(await response.json()).message}`, "error", null);
        return null;
    }
}

async function fetchQueries(lang: string): Promise<Queries | null> {
    console.log("retrieving queries for " + lang);

    const url = `/queries/${lang}`;
    const response = await fetch(url);

    if (response.ok)
        return await response.json();

    showMessage(`Unable to get queries for ${lang}, request failed with status ${response.status}, message: ${(await response.json()).message}`, "error", null);

    return null;
}
