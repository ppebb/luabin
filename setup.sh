#!/usr/bin/env bash

# Package list taken from list of supported parsers of https://github.com/nvim-treesitter/nvim-treesitter/blob/master/README.md
declare -A packages=(
    ["ada"]="https://github.com/briot/tree-sitter-ada"
    ["agda"]="https://github.com/tree-sitter/tree-sitter-agda"
    ["angular"]="https://github.com/dlvandenberg/tree-sitter-angular"
    ["apex"]="https://github.com/aheber/tree-sitter-sfapex"
    ["arduino"]="https://github.com/ObserverOfTime/tree-sitter-arduino"
    ["asm"]="https://github.com/RubixDev/tree-sitter-asm"
    ["astro"]="https://github.com/virchau13/tree-sitter-astro"
    ["authzed"]="https://github.com/mleonidas/tree-sitter-authzed"
    ["bash"]="https://github.com/tree-sitter/tree-sitter-bash"
    ["bass"]="https://github.com/vito/tree-sitter-bass"
    ["beancount"]="https://github.com/polarmutex/tree-sitter-beancount"
    ["bibtex"]="https://github.com/latex-lsp/tree-sitter-bibtex"
    ["bicep"]="https://github.com/amaanq/tree-sitter-bicep"
    ["bitbake"]="https://github.com/amaanq/tree-sitter-bitbake"
    ["blueprint"]="https://gitlab.com/gabmus/tree-sitter-blueprint.git"
    ["bp"]="https://github.com/ambroisie/tree-sitter-bp"
    ["c"]="https://github.com/tree-sitter/tree-sitter-c"
    ["c_sharp"]="https://github.com/tree-sitter/tree-sitter-c-sharp"
    ["cairo"]="https://github.com/amaanq/tree-sitter-cairo"
    ["capnp"]="https://github.com/amaanq/tree-sitter-capnp"
    ["chatito"]="https://github.com/ObserverOfTime/tree-sitter-chatito"
    ["clojure"]="https://github.com/sogaiu/tree-sitter-clojure"
    ["cmake"]="https://github.com/uyha/tree-sitter-cmake"
    ["comment"]="https://github.com/stsewd/tree-sitter-comment"
    ["commonlisp"]="https://github.com/theHamsta/tree-sitter-commonlisp"
    ["cooklang"]="https://github.com/addcninblue/tree-sitter-cooklang"
    ["corn"]="https://github.com/jakestanger/tree-sitter-corn"
    ["cpon"]="https://github.com/amaanq/tree-sitter-cpon"
    ["cpp"]="https://github.com/tree-sitter/tree-sitter-cpp"
    ["css"]="https://github.com/tree-sitter/tree-sitter-css"
    ["csv"]="https://github.com/amaanq/tree-sitter-csv"
    ["cuda"]="https://github.com/theHamsta/tree-sitter-cuda"
    ["cue"]="https://github.com/eonpatapon/tree-sitter-cue"
    ["d"]="https://github.com/gdamore/tree-sitter-d"
    ["dart"]="https://github.com/UserNobody14/tree-sitter-dart"
    ["devicetree"]="https://github.com/joelspadin/tree-sitter-devicetree"
    ["dhall"]="https://github.com/jbellerb/tree-sitter-dhall"
    ["diff"]="https://github.com/the-mikedavis/tree-sitter-diff"
    ["disassembly"]="https://github.com/ColinKennedy/tree-sitter-disassembly"
    ["djot"]="https://github.com/treeman/tree-sitter-djot"
    ["dockerfile"]="https://github.com/camdencheek/tree-sitter-dockerfile"
    ["dot"]="https://github.com/rydesun/tree-sitter-dot"
    ["doxygen"]="https://github.com/amaanq/tree-sitter-doxygen"
    ["dtd"]="https://github.com/tree-sitter-grammars/tree-sitter-xml"
    ["earthfile"]="https://github.com/glehmann/tree-sitter-earthfile"
    ["ebnf"]="https://github.com/RubixDev/ebnf"
    ["eds"]="https://github.com/uyha/tree-sitter-eds"
    ["eex"]="https://github.com/connorlay/tree-sitter-eex"
    ["elixir"]="https://github.com/elixir-lang/tree-sitter-elixir"
    ["elm"]="https://github.com/elm-tooling/tree-sitter-elm"
    ["elsa"]="https://github.com/glapa-grossklag/tree-sitter-elsa"
    ["elvish"]="https://github.com/elves/tree-sitter-elvish"
    ["erlang"]="https://github.com/WhatsApp/tree-sitter-erlang"
    ["facility"]="https://github.com/FacilityApi/tree-sitter-facility"
    ["faust"]="https://github.com/khiner/tree-sitter-faust"
    ["fennel"]="https://github.com/alexmozaidze/tree-sitter-fennel"
    ["fidl"]="https://github.com/google/tree-sitter-fidl"
    ["firrtl"]="https://github.com/amaanq/tree-sitter-firrtl"
    ["fish"]="https://github.com/ram02z/tree-sitter-fish"
    ["foam"]="https://github.com/FoamScience/tree-sitter-foam"
    ["forth"]="https://github.com/AlexanderBrevig/tree-sitter-forth"
    ["fortran"]="https://github.com/stadelmanma/tree-sitter-fortran"
    ["fsh"]="https://github.com/mgramigna/tree-sitter-fsh"
    ["func"]="https://github.com/amaanq/tree-sitter-func"
    ["fusion"]="https://gitlab.com/jirgn/tree-sitter-fusion.git"
    ["gdscript"]="https://github.com/PrestonKnopp/tree-sitter-gdscript"
    ["gdshader"]="https://github.com/GodOfAvacyn/tree-sitter-gdshader"
    ["git_config"]="https://github.com/the-mikedavis/tree-sitter-git-config"
    ["git_rebase"]="https://github.com/the-mikedavis/tree-sitter-git-rebase"
    ["gitattributes"]="https://github.com/ObserverOfTime/tree-sitter-gitattributes"
    # Cannot compile, fills my ram and swap completely and then locks up my computer
    # ["gitcommit"]="https://github.com/gbprod/tree-sitter-gitcommit"
    ["gitignore"]="https://github.com/shunsambongi/tree-sitter-gitignore"
    ["gleam"]="https://github.com/gleam-lang/tree-sitter-gleam"
    ["glsl"]="https://github.com/theHamsta/tree-sitter-glsl"
    # Cannot compile, fills my ram and swap completely and then locks up my computer
    # ["gnuplot"]="https://github.com/dpezto/tree-sitter-gnuplot"
    ["go"]="https://github.com/tree-sitter/tree-sitter-go"
    ["gomod"]="https://github.com/camdencheek/tree-sitter-go-mod"
    ["gosum"]="https://github.com/amaanq/tree-sitter-go-sum"
    ["gotmpl"]="https://github.com/ngalaiko/tree-sitter-go-template"
    ["gowork"]="https://github.com/omertuc/tree-sitter-go-work"
    ["gpg"]="https://github.com/ObserverOfTime/tree-sitter-gpg-config"
    ["graphql"]="https://github.com/bkegley/tree-sitter-graphql"
    ["groovy"]="https://github.com/murtaza64/tree-sitter-groovy"
    ["gstlaunch"]="https://github.com/theHamsta/tree-sitter-gstlaunch"
    ["hare"]="https://github.com/amaanq/tree-sitter-hare"
    ["haskell"]="https://github.com/tree-sitter/tree-sitter-haskell"
    ["haskell_persistent"]="https://github.com/MercuryTechnologies/tree-sitter-haskell-persistent"
    # Duplicate with terraform
    # ["hcl"]="https://github.com/MichaHoffmann/tree-sitter-hcl"
    ["heex"]="https://github.com/connorlay/tree-sitter-heex"
    # Duplicate with gotmpl
    # ["helm"]="https://github.com/ngalaiko/tree-sitter-go-template"
    ["hjson"]="https://github.com/winston0410/tree-sitter-hjson"
    ["hlsl"]="https://github.com/theHamsta/tree-sitter-hlsl"
    ["hlsplaylist"]="https://github.com/Freed-Wu/tree-sitter-hlsplaylist"
    ["hocon"]="https://github.com/antosha417/tree-sitter-hocon"
    ["hoon"]="https://github.com/urbit-pilled/tree-sitter-hoon"
    ["html"]="https://github.com/tree-sitter/tree-sitter-html"
    ["htmldjango"]="https://github.com/interdependence/tree-sitter-htmldjango"
    ["http"]="https://github.com/rest-nvim/tree-sitter-http"
    ["hurl"]="https://github.com/pfeiferj/tree-sitter-hurl"
    ["hyprlang"]="https://github.com/luckasRanarison/tree-sitter-hyprlang"
    ["idl"]="https://github.com/cathaysia/tree-sitter-idl"
    ["ini"]="https://github.com/justinmk/tree-sitter-ini"
    ["inko"]="https://github.com/inko-lang/tree-sitter-inko"
    ["ispc"]="https://github.com/fab4100/tree-sitter-ispc"
    ["janet_simple"]="https://github.com/sogaiu/tree-sitter-janet-simple"
    ["java"]="https://github.com/tree-sitter/tree-sitter-java"
    ["javascript"]="https://github.com/tree-sitter/tree-sitter-javascript"
    ["jq"]="https://github.com/flurie/tree-sitter-jq"
    ["jsdoc"]="https://github.com/tree-sitter/tree-sitter-jsdoc"
    ["json"]="https://github.com/tree-sitter/tree-sitter-json"
    ["json5"]="https://github.com/Joakker/tree-sitter-json5"
    ["jsonc"]="https://gitlab.com/WhyNotHugo/tree-sitter-jsonc.git"
    ["jsonnet"]="https://github.com/sourcegraph/tree-sitter-jsonnet"
    ["julia"]="https://github.com/tree-sitter/tree-sitter-julia"
    ["just"]="https://github.com/IndianBoy42/tree-sitter-just"
    ["kconfig"]="https://github.com/amaanq/tree-sitter-kconfig"
    ["kdl"]="https://github.com/amaanq/tree-sitter-kdl"
    ["kotlin"]="https://github.com/fwcd/tree-sitter-kotlin"
    ["koto"]="https://github.com/koto-lang/tree-sitter-koto"
    ["kusto"]="https://github.com/Willem-J-an/tree-sitter-kusto"
    ["lalrpop"]="https://github.com/traxys/tree-sitter-lalrpop"
    ["latex"]="https://github.com/latex-lsp/tree-sitter-latex"
    ["ledger"]="https://github.com/cbarrete/tree-sitter-ledger"
    ["leo"]="https://github.com/r001/tree-sitter-leo"
    ["linkerscript"]="https://github.com/amaanq/tree-sitter-linkerscript"
    ["liquid"]="https://github.com/hankthetank27/tree-sitter-liquid"
    ["liquidsoap"]="https://github.com/savonet/tree-sitter-liquidsoap"
    ["llvm"]="https://github.com/benwilliamgraham/tree-sitter-llvm"
    ["lua"]="https://github.com/MunifTanjim/tree-sitter-lua"
    ["luadoc"]="https://github.com/amaanq/tree-sitter-luadoc"
    ["luau"]="https://github.com/amaanq/tree-sitter-luau"
    ["m68k"]="https://github.com/grahambates/tree-sitter-m68k"
    ["make"]="https://github.com/alemuller/tree-sitter-make"
    ["matlab"]="https://github.com/acristoffers/tree-sitter-matlab"
    ["menhir"]="https://github.com/Kerl13/tree-sitter-menhir"
    ["meson"]="https://github.com/Decodetalkers/tree-sitter-meson"
    ["mlir"]="https://github.com/artagnon/tree-sitter-mlir"
    ["muttrc"]="https://github.com/neomutt/tree-sitter-muttrc"
    ["nasm"]="https://github.com/naclsn/tree-sitter-nasm"
    ["nim"]="https://github.com/alaviss/tree-sitter-nim"
    ["nim_format_string"]="https://github.com/aMOPel/tree-sitter-nim-format-string"
    ["ninja"]="https://github.com/alemuller/tree-sitter-ninja"
    ["nix"]="https://github.com/cstrahan/tree-sitter-nix"
    ["norg"]="https://github.com/nvim-neorg/tree-sitter-norg"
    ["nqc"]="https://github.com/amaanq/tree-sitter-nqc"
    ["objc"]="https://github.com/amaanq/tree-sitter-objc"
    ["objdump"]="https://github.com/ColinKennedy/tree-sitter-objdump"
    ["ocaml"]="https://github.com/tree-sitter/tree-sitter-ocaml"
    # Duplicate with ocaml
    # ["ocaml_interface"]="https://github.com/tree-sitter/tree-sitter-ocaml"
    ["ocamllex"]="https://github.com/atom-ocaml/tree-sitter-ocamllex"
    ["odin"]="https://github.com/amaanq/tree-sitter-odin"
    ["pascal"]="https://github.com/Isopod/tree-sitter-pascal.git"
    ["passwd"]="https://github.com/ath3/tree-sitter-passwd"
    ["pem"]="https://github.com/ObserverOfTime/tree-sitter-pem"
    # Cannot compile, fills my ram and swap completely and then locks up my computer
    # ["perl"]="https://github.com/tree-sitter-perl/tree-sitter-perl"
    ["php"]="https://github.com/tree-sitter/tree-sitter-php"
    # Duplicate with php
    # ["php_only"]="https://github.com/tree-sitter/tree-sitter-php"
    ["phpdoc"]="https://github.com/claytonrcarter/tree-sitter-phpdoc"
    ["pioasm"]="https://github.com/leo60228/tree-sitter-pioasm"
    ["po"]="https://github.com/erasin/tree-sitter-po"
    ["pod"]="https://github.com/tree-sitter-perl/tree-sitter-pod"
    ["pony"]="https://github.com/amaanq/tree-sitter-pony"
    ["printf"]="https://github.com/ObserverOfTime/tree-sitter-printf"
    ["prisma"]="https://github.com/victorhqc/tree-sitter-prisma"
    ["promql"]="https://github.com/MichaHoffmann/tree-sitter-promql"
    ["properties"]="https://github.com/tree-sitter-grammars/tree-sitter-properties"
    ["proto"]="https://github.com/treywood/tree-sitter-proto"
    ["prql"]="https://github.com/PRQL/tree-sitter-prql"
    # Duplicate with csv
    # ["psv"]="https://github.com/amaanq/tree-sitter-csv"
    ["pug"]="https://github.com/zealot128/tree-sitter-pug"
    ["puppet"]="https://github.com/amaanq/tree-sitter-puppet"
    ["purescript"]="https://github.com/postsolar/tree-sitter-purescript"
    ["pymanifest"]="https://github.com/ObserverOfTime/tree-sitter-pymanifest"
    ["python"]="https://github.com/tree-sitter/tree-sitter-python"
    ["ql"]="https://github.com/tree-sitter/tree-sitter-ql"
    ["qmldir"]="https://github.com/Decodetalkers/tree-sitter-qmldir"
    ["qmljs"]="https://github.com/yuja/tree-sitter-qmljs"
    ["r"]="https://github.com/r-lib/tree-sitter-r"
    ["ralph"]="https://github.com/alephium/tree-sitter-ralph"
    ["rasi"]="https://github.com/Fymyte/tree-sitter-rasi"
    ["rbs"]="https://github.com/joker1007/tree-sitter-rbs"
    ["re2c"]="https://github.com/amaanq/tree-sitter-re2c"
    ["readline"]="https://github.com/ribru17/tree-sitter-readline"
    ["regex"]="https://github.com/tree-sitter/tree-sitter-regex"
    ["rego"]="https://github.com/FallenAngel97/tree-sitter-rego"
    ["rnoweb"]="https://github.com/bamonroe/tree-sitter-rnoweb"
    ["robot"]="https://github.com/Hubro/tree-sitter-robot"
    ["roc"]="https://github.com/nat-418/tree-sitter-roc"
    ["ron"]="https://github.com/amaanq/tree-sitter-ron"
    ["rst"]="https://github.com/stsewd/tree-sitter-rst"
    ["ruby"]="https://github.com/tree-sitter/tree-sitter-ruby"
    ["rust"]="https://github.com/tree-sitter/tree-sitter-rust"
    ["scala"]="https://github.com/tree-sitter/tree-sitter-scala"
    ["scfg"]="https://git.sr.ht/~rockorager/tree-sitter-scfg"
    ["scss"]="https://github.com/serenadeai/tree-sitter-scss"
    ["slang"]="https://github.com/theHamsta/tree-sitter-slang"
    ["slint"]="https://github.com/slint-ui/tree-sitter-slint"
    ["smali"]="https://github.com/tree-sitter-grammars/tree-sitter-smali"
    ["smithy"]="https://github.com/indoorvivants/tree-sitter-smithy"
    ["solidity"]="https://github.com/JoranHonig/tree-sitter-solidity"
    # Duplicate with the apex entry
    # ["soql"]="https://github.com/aheber/tree-sitter-sfapex"
    # ["sosl"]="https://github.com/aheber/tree-sitter-sfapex"
    ["sourcepawn"]="https://github.com/nilshelmig/tree-sitter-sourcepawn"
    ["sparql"]="https://github.com/BonaBeavis/tree-sitter-sparql"
    ["sql"]="https://github.com/derekstride/tree-sitter-sql"
    ["squirrel"]="https://github.com/amaanq/tree-sitter-squirrel"
    ["ssh_config"]="https://github.com/ObserverOfTime/tree-sitter-ssh-config"
    ["starlark"]="https://github.com/amaanq/tree-sitter-starlark"
    ["strace"]="https://github.com/sigmaSd/tree-sitter-strace"
    ["styled"]="https://github.com/mskelton/tree-sitter-styled"
    ["supercollider"]="https://github.com/madskjeldgaard/tree-sitter-supercollider"
    ["surface"]="https://github.com/connorlay/tree-sitter-surface"
    ["svelte"]="https://github.com/tree-sitter-grammars/tree-sitter-svelte"
    ["swift"]="https://github.com/alex-pinkus/tree-sitter-swift"
    ["sxhkdrc"]="https://github.com/RaafatTurki/tree-sitter-sxhkdrc"
    ["systemtap"]="https://github.com/ok-ryoko/tree-sitter-systemtap"
    ["t32"]="https://gitlab.com/xasc/tree-sitter-t32.git"
    ["tablegen"]="https://github.com/amaanq/tree-sitter-tablegen"
    ["tact"]="https://github.com/tact-lang/tree-sitter-tact"
    ["tcl"]="https://github.com/tree-sitter-grammars/tree-sitter-tcl"
    ["teal"]="https://github.com/euclidianAce/tree-sitter-teal"
    ["templ"]="https://github.com/vrischmann/tree-sitter-templ"
    ["terraform"]="https://github.com/MichaHoffmann/tree-sitter-hcl"
    ["textproto"]="https://github.com/PorterAtGoogle/tree-sitter-textproto"
    ["thrift"]="https://github.com/duskmoon314/tree-sitter-thrift"
    ["tiger"]="https://github.com/ambroisie/tree-sitter-tiger"
    ["tlaplus"]="https://github.com/tlaplus-community/tree-sitter-tlaplus"
    ["tmux"]="https://github.com/Freed-Wu/tree-sitter-tmux"
    ["todotxt"]="https://github.com/arnarg/tree-sitter-todotxt.git"
    ["toml"]="https://github.com/tree-sitter-grammars/tree-sitter-toml"
    # Duplicate with csv
    # ["tsv"]="https://github.com/amaanq/tree-sitter-csv"
    # Duplicate with typescript
    # ["tsx"]="https://github.com/tree-sitter/tree-sitter-typescript"
    ["turtle"]="https://github.com/BonaBeavis/tree-sitter-turtle"
    ["twig"]="https://github.com/gbprod/tree-sitter-twig"
    ["typescript"]="https://github.com/tree-sitter/tree-sitter-typescript"
    ["typespec"]="https://github.com/happenslol/tree-sitter-typespec"
    ["typoscript"]="https://github.com/Teddytrombone/tree-sitter-typoscript"
    ["typst"]="https://github.com/uben0/tree-sitter-typst"
    ["udev"]="https://github.com/ObserverOfTime/tree-sitter-udev"
    ["ungrammar"]="https://github.com/Philipp-M/tree-sitter-ungrammar"
    ["unison"]="https://github.com/kylegoetz/tree-sitter-unison"
    ["usd"]="https://github.com/ColinKennedy/tree-sitter-usd"
    ["uxntal"]="https://github.com/amaanq/tree-sitter-uxntal"
    ["v"]="https://github.com/vlang/v-analyzer"
    ["vala"]="https://github.com/vala-lang/tree-sitter-vala"
    ["vento"]="https://github.com/ventojs/tree-sitter-vento"
    ["verilog"]="https://github.com/tree-sitter/tree-sitter-verilog"
    ["vhs"]="https://github.com/charmbracelet/tree-sitter-vhs"
    ["vim"]="https://github.com/neovim/tree-sitter-vim"
    ["vimdoc"]="https://github.com/neovim/tree-sitter-vimdoc"
    ["vue"]="https://github.com/tree-sitter-grammars/tree-sitter-vue"
    ["wgsl"]="https://github.com/szebniok/tree-sitter-wgsl"
    ["wgsl_bevy"]="https://github.com/theHamsta/tree-sitter-wgsl-bevy"
    ["wing"]="https://github.com/winglang/tree-sitter-wing"
    ["wit"]="https://github.com/liamwh/tree-sitter-wit"
    ["xcompose"]="https://github.com/ObserverOfTime/tree-sitter-xcompose"
    # Duplicate with dtd
    # ["xml"]="https://github.com/tree-sitter-grammars/tree-sitter-xml"
    ["yaml"]="https://github.com/tree-sitter-grammars/tree-sitter-yaml"
    ["yang"]="https://github.com/Hubro/tree-sitter-yang"
    ["yuck"]="https://github.com/Philipp-M/tree-sitter-yuck"
    ["zathurarc"]="https://github.com/Freed-Wu/tree-sitter-zathurarc"
    ["zig"]="https://github.com/maxxnino/tree-sitter-zig"
)

set -e

while [[ $# -gt 0 ]]; do
    case "$1" in
    --tree-sitter)
        treesitter=true
        ;;
    --wasm-clone)
        wasmclone=true
        ;;
    --wasm-build)
        wasmbuild=true
        ;;
    --wasm-check)
        wasmcheck=true
        ;;
    --enry)
        enry=true
        ;;
    --js)
        js=true
        ;;
    --silence-skips)
        silenceskips=true
        ;;
    *)
        echo "bad option $1"
        ;;
    esac
    shift
done

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
TREE_SITTER="$SCRIPT_DIR/build/tree-sitter-linux-x64"
CLONE_DIR="$SCRIPT_DIR/build/clone"
WASM_DIR="$SCRIPT_DIR/build/wasm"
ENRY_PATH="$SCRIPT_DIR/build/go-enry"

if ! [[ -e "$TREE_SITTER" ]] || [[ -v treesitter ]]; then
    echo "Downloading latest tree-sitter binary"

    cd "$SCRIPT_DIR/build"
    wget --quiet "https://github.com/tree-sitter/tree-sitter/releases/latest/download/tree-sitter-linux-x64.gz"

    echo "Unzipping tree-sitter-linux-x64.gz"
    gunzip tree-sitter-linux-x64.gz

    chmod u+x tree-sitter-linux-x64
fi

if [[ -v wasmclone ]]; then
    echo "Recompiling parser wasm"

    cd "$SCRIPT_DIR"

    mkdir -p "$CLONE_DIR"
    for package in "${!packages[@]}"; do
        cd "$CLONE_DIR"
        if ! [ -e "tree-sitter-$package" ]; then
            echo "Cloning $package"
            git clone "${packages[$package]}" --depth 1 "tree-sitter-$package"
        else
            echo "Checking tree-sitter-$package for updates"
            cd "$CLONE_DIR/tree-sitter-$package"
            git restore .
            git pull
        fi
    done
fi

if [[ -v wasmbuild ]]; then
    EMSDK_QUIET=1 source emsdk_env.sh

    # if [ -e "$WASM_PATH" ]; then
    #     rm -r "$WASM_PATH"
    # fi

    mkdir -p "$WASM_DIR"
    mkdir -p "$WASM_DIR"
    cd "$WASM_DIR"

    set +e
    for package in "${!packages[@]}"; do
        parser_dir="$CLONE_DIR/tree-sitter-$package"
        cd "$parser_dir"
        find . -name "grammar.js" -print0 | while read -d $'\0' grammar; do
            grammar_dir=$(dirname "$(realpath -s "$grammar")")
            cd "$grammar_dir"

            last_chunk=${grammar_dir##*\/}

            if [ "$last_chunk" = "core" ]; then
                last_chunk="core_schema"
            fi

            last_chunk_dashes=${last_chunk//_/-}
            # echo "last_chunk $last_chunk"
            for file in "$WASM_DIR"/*; do
                if [[ "$file" = *"$last_chunk.wasm"* ]] || [[ "$file" = *"$last_chunk_dashes.wasm"* ]]; then
                    if ! [[ -v silenceskips ]]; then
                        echo "Skipping $last_chunk, matches $file"
                    fi
                    cd "$parser_dir"
                    continue 2
                fi
            done

            if ! [ -e "$grammar_dir/src/parser.c" ]; then
                echo "tree-sitter-linux-x64 generate for $grammar_dir"
                "$TREE_SITTER" generate
            fi

            cd "$WASM_DIR"
            echo "tree-sitter-linux-x64 tree-sitter build --wasm $grammar_dir"
            "$TREE_SITTER" build --wasm "$grammar_dir"
            cd "$parser_dir"
        done
    done
    set -e

    cd "$WASM_DIR"

    if [ -e "tree-sitter.wasm" ]; then
        rm tree-sitter.wasm
    fi

    echo "Downloading tree-sitter.wasm"
    wget --quiet "https://github.com/tree-sitter/tree-sitter/releases/latest/download/tree-sitter.wasm"

    for blob in ./*.wasm; do
        md5sum "$blob" | cut -d' ' -f1 >"$blob.md5sum"
    done

    echo "Creating wasm.tar.gz archive"
    "cd $SCRIPT_DIR"
    tar czf ./wasm.tar.gz ./build/wasm
fi

if [[ -v wasmcheck ]]; then
    cd "$SCRIPT_DIR/build/clone"

    for package in "${!packages[@]}"; do
        parser_dir="$CLONE_DIR/tree-sitter-$package"
        cd "$parser_dir"
        find . -name "grammar.js" -print0 | while read -d $'\0' grammar; do
            grammar_dir=$(dirname "$(realpath -s "$grammar")")

            match=false
            last_chunk=${grammar_dir##*\/}

            if [ "$last_chunk" = "core" ]; then
                last_chunk="core_schema"
            fi

            last_chunk_dashes=${last_chunk//_/-}

            for file in "$WASM_DIR"/*; do
                if [[ "$file" = *"$last_chunk.wasm"* ]] || [[ "$file" = *"$last_chunk_dashes.wasm"* ]]; then
                    match=true
                    break
                fi
            done

            if ! $match; then
                echo "tree-sitter parser for $last_chunk ($grammar_dir) not found"
            fi

            cd "$parser_dir"
        done
    done
fi

if [[ -v js ]]; then
    cd "$SCRIPT_DIR"

    if [ -e js ]; then
        rm -r js
    fi

    mkdir -p js
    cd js

    echo "Downloading tree-sitter.js"
    wget --quiet "https://github.com/tree-sitter/tree-sitter/releases/latest/download/tree-sitter.js"

    echo "Downloading spark-md5.min.js"
    wget --quiet "https://raw.githubusercontent.com/satazor/js-spark-md5/master/spark-md5.min.js"

    cd "$SCRIPT_DIR"
    echo "Generating langs.js"
    lua setup.lua >./js/langs.js
fi

if [[ -v enry ]]; then
    if ! [ -e "$ENRY_PATH" ]; then
        echo "Cloning go-enry"
        git clone "https://github.com/go-enry/go-enry.git" --depth 1
    else
        echo "Checking for enry updates"
        cd "$ENRY_PATH"
        git restore .
        git pull
    fi

    echo -e """
//export GetLanguageByClassifier
func GetLanguageByClassifier(content []byte, candidates []string) (language string, safe bool) {
    return enry.GetLanguageByClassifier(content, candidates)
}
""" >>"$ENRY_PATH/shared/enry.go"

    echo "Running make clean"
    make clean

    echo "Running make linux-shared"
    make linux-shared
fi
