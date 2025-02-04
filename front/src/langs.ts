export const allowed_parsers:string[]=["ada","agda","angular","apex","arduino","asm","astro","authzed","bash","bass","beancount","bibtex","bicep","bitbake","blueprint","bp","c","c_sharp","cairo","capnp","chatito","clojure","cmake","comment","commonlisp","cooklang","corn","cpon","cpp","css","csv","cuda","cue","d","dart","devicetree","dhall","diff","disassembly","djot","dockerfile","dot","doxygen","dtd","earthfile","ebnf","eds","eex","elixir","elm","elsa","elvish","erlang","facility","faust","fennel","fidl","firrtl","fish","foam","forth","fortran","fsh","func","fusion","gdscript","gdshader","git_config","git_rebase","gitattributes","gitcommit","gitignore","gleam","glsl","gnuplot","go","gomod","gosum","gotmpl","gowork","gpg","graphql","groovy","gstlaunch","hare","haskell","haskell_persistent","hcl","heex","helm","hjson","hlsl","hlsplaylist","hocon","hoon","html","htmldjango","http","hurl","hyprlang","idl","ini","inko","ispc","janet_simple","java","javascript","jq","jsdoc","json","json5","jsonc","jsonnet","julia","just","kconfig","kdl","kotlin","koto","kusto","lalrpop","latex","ledger","leo","linkerscript","liquid","liquidsoap","llvm","lua","luadoc","luau","m68k","make","matlab","menhir","meson","mlir","muttrc","nasm","nim","nim_format_string","ninja","nix","norg","nqc","objc","objdump","ocaml","ocaml_interface","ocamllex","odin","pascal","passwd","pem","perl","php","php_only","phpdoc","pioasm","po","pod","pony","printf","prisma","promql","properties","proto","prql","psv","pug","puppet","purescript","PyPA manifest","python","ql","qmldir","qmljs","r","ralph","rasi","rbs","re2c","readline","regex","rego","rnoweb","robot","roc","ron","rst","ruby","rust","scala","scfg","scss","slang","slint","smali","smithy","solidity","soql","sosl","sourcepawn","sparql","sql","squirrel","ssh_config","starlark","strace","styled","supercollider","surface","svelte","swift","sxhkdrc","systemtap","t32","tablegen","tact","tcl","teal","templ","terraform","textproto","thrift","tiger","tlaplus","tmux","todotxt","toml","tsv","tsx","turtle","twig","typescript","typespec","typoscript","typst","udev","ungrammar","unison","usd","uxntal","v","vala","vento","verilog","vhs","vim","vimdoc","vue","wgsl","wgsl_bevy","wing","wit","xcompose","xml","yaml","yang","yuck","zathurarc","zig"];
interface Dictionary<T> { [key: string]: T; }
export const ext_to_parser_map:Dictionary<string>={".4dform":"json",".4dproject":"json",".4th":"forth","._js":"javascript",".a51":"assembly",".ada":"ada",".adb":"ada",".adml":"xml",".admx":"xml",".adp":"tcl",".ads":"ada",".agda":"agda",".al":"perl",".ant":"xml",".app":"erlang",".app.src":"erlang",".asd":"common_lisp",".asm":"assembly",".astro":"astro",".avsc":"json",".aw":"php",".axaml":"xml",".axml":"xml",".bash":"shell",".bats":"shell",".bb":"bitbake",".bbappend":"bitbake",".bbclass":"bitbake",".bib":"bibtex",".bibtex":"bibtex",".bicep":"bicep",".bicepparam":"bicep",".bones":"javascript",".boot":"clojure",".builder":"ruby",".builds":"xml",".bzl":"starlark",".c":"c",".c++":"c++",".cairo":"cairo",".cake":"c#",".capnp":"cap'n_proto",".cats":"c",".cc":"c++",".ccproj":"xml",".ccxml":"xml",".cfg":"ini",".cgi":"python",".cginc":"hlsl",".cjs":"javascript",".cl":"common_lisp",".cl2":"clojure",".clixml":"xml",".clj":"clojure",".cljc":"clojure",".cljs":"clojure",".cljs.hl":"clojure",".cljscm":"clojure",".cljx":"clojure",".cls":"apex",".cmake":"cmake",".cmake.in":"cmake",".cnf":"ini",".code-snippets":"json_with_comments",".code-workspace":"json_with_comments",".command":"shell",".cp":"c++",".cpp":"c++",".cppm":"c++",".cproject":"xml",".cql":"sql",".cs":"c#",".cs.pp":"c#",".cscfg":"xml",".csdef":"xml",".csl":"kusto",".csproj":"xml",".css":"css",".csv":"csv",".csx":"c#",".ct":"xml",".ctp":"php",".cts":"typescript",".cu":"cuda",".cue":"cue",".cuh":"cuda",".cxx":"c++",".d":"d",".dart":"dart",".ddl":"sql",".depproj":"xml",".dfm":"pascal",".dhall":"dhall",".di":"d",".diff":"diff",".dita":"xml",".ditamap":"xml",".ditaval":"xml",".dll.config":"xml",".dlm":"idl",".dockerfile":"dockerfile",".dof":"ini",".dotsettings":"xml",".dpr":"pascal",".dsp":"faust",".ebnf":"ebnf",".eex":"html+eex",".eliom":"ocaml",".eliomi":"ocaml",".elm":"elm",".elv":"elvish",".erl":"erlang",".es":"erlang",".es6":"javascript",".escript":"erlang",".ex":"elixir",".exs":"elixir",".eye":"ruby",".f":"forth",".f77":"fortran",".fcgi":"php",".filters":"xml",".fish":"fish",".fnl":"fennel",".for":"forth",".forth":"forth",".fp":"glsl",".fpp":"fortran",".fr":"forth",".frag":"javascript",".frg":"glsl",".frt":"forth",".fs":"forth",".fsh":"glsl",".fshader":"glsl",".fsproj":"xml",".fth":"forth",".fx":"hlsl",".fxh":"hlsl",".fxml":"xml",".gd":"gdscript",".gemspec":"ruby",".geo":"glsl",".geojson":"json",".geom":"glsl",".gitconfig":"git_config",".glade":"xml",".gleam":"gleam",".glsl":"glsl",".glslf":"glsl",".glslv":"glsl",".gltf":"json",".gml":"xml",".gmx":"xml",".gnu":"gnuplot",".gnuplot":"gnuplot",".go":"go",".god":"ruby",".gp":"gnuplot",".gql":"graphql",".graphql":"graphql",".graphqls":"graphql",".groovy":"groovy",".grt":"groovy",".grxml":"xml",".gs":"javascript",".gshader":"glsl",".gst":"xml",".gtpl":"groovy",".gvy":"groovy",".gyp":"python",".gypi":"python",".h":"objective-c",".h++":"c++",".har":"json",".hcl":"hcl",".hh":"c++",".hic":"clojure",".hjson":"hjson",".hlsl":"hlsl",".hlsli":"hlsl",".hocon":"hocon",".hoon":"hoon",".hpp":"c++",".hrl":"erlang",".hs":"haskell",".hs-boot":"haskell",".hsc":"haskell",".hta":"html",".htm":"html",".html":"html",".html.heex":"html+eex",".html.hl":"html",".html.leex":"html+eex",".http":"http",".hxx":"c++",".hzp":"xml",".i":"assembly",".ice":"json",".idc":"c",".iml":"xml",".inc":"assembly",".ini":"ini",".inl":"c++",".ino":"c++",".ipp":"c++",".ivy":"xml",".ixx":"c++",".jade":"pug",".jake":"javascript",".janet":"janet",".jav":"java",".java":"java",".javascript":"javascript",".jbuilder":"ruby",".jelly":"xml",".jl":"julia",".jq":"jq",".js":"javascript",".jsb":"javascript",".jscad":"javascript",".jsfl":"javascript",".jsh":"java",".jslib":"javascript",".jsm":"javascript",".json":"json",".json-tmlanguage":"json",".json5":"json5",".jsonc":"json_with_comments",".jsonl":"json",".jsonnet":"jsonnet",".jspre":"javascript",".jsproj":"xml",".jss":"javascript",".jsx":"javascript",".kml":"xml",".kojo":"scala",".kql":"kusto",".ksh":"shell",".kt":"kotlin",".ktm":"kotlin",".kts":"kotlin",".l":"common_lisp",".launch":"xml",".ld":"linker_script",".lds":"linker_script",".lektorproject":"ini",".libsonnet":"jsonnet",".linq":"c#",".liquid":"liquid",".lisp":"common_lisp",".ll":"llvm",".lmi":"python",".lpr":"pascal",".lsp":"common_lisp",".lua":"lua",".m":"objective-c",".mak":"makefile",".make":"makefile",".makefile":"makefile",".matlab":"matlab",".mcmeta":"json",".mdpolicy":"xml",".mir":"yaml",".mjml":"xml",".mjs":"javascript",".mk":"makefile",".mkfile":"makefile",".ml":"ocaml",".ml4":"ocaml",".mli":"ocaml",".mlir":"mlir",".mll":"ocaml",".mly":"ocaml",".mm":"xml",".mod":"xml",".mojo":"xml",".mspec":"ruby",".mts":"typescript",".mxml":"xml",".mysql":"sql",".nas":"assembly",".nasm":"assembly",".natvis":"xml",".ncl":"xml",".ndproj":"xml",".nim":"nim",".nim.cfg":"nim",".nimble":"nim",".nimrod":"nim",".nims":"nim",".ninja":"ninja",".nix":"nix",".njs":"javascript",".nomad":"hcl",".nproj":"xml",".nse":"lua",".nuspec":"xml",".nut":"squirrel",".ny":"common_lisp",".objdump":"objdump",".odd":"xml",".odin":"odin",".osm":"xml",".p":"gnuplot",".p8":"lua",".pac":"javascript",".pas":"pascal",".pascal":"pascal",".patch":"diff",".pbt":"protocol_buffer_text_format",".pbtxt":"protocol_buffer_text_format",".pd_lua":"lua",".perl":"perl",".ph":"perl",".php":"php",".php3":"php",".php4":"php",".php5":"php",".phps":"php",".phpt":"php",".pkgproj":"xml",".pl":"perl",".plot":"gnuplot",".plt":"gnuplot",".pluginspec":"ruby",".plx":"perl",".pm":"perl",".pod":"pod",".podsl":"common_lisp",".podspec":"ruby",".pony":"pony",".pp":"pascal",".prawn":"ruby",".prc":"sql",".prefs":"ini",".prisma":"prisma",".pro":"idl",".proj":"xml",".properties":"ini",".props":"xml",".proto":"protocol_buffer",".ps1xml":"xml",".psc1":"xml",".psgi":"perl",".pt":"xml",".pug":"pug",".purs":"purescript",".py":"python",".py3":"python",".pyde":"python",".pyi":"python",".pyp":"python",".pyt":"python",".pyw":"python",".qbs":"qml",".qhelp":"xml",".ql":"codeql",".qll":"codeql",".qml":"qml",".r":"r",".rabl":"ruby",".rake":"ruby",".rb":"ruby",".rbi":"ruby",".rbs":"rbs",".rbuild":"ruby",".rbw":"ruby",".rbx":"ruby",".rbxs":"lua",".rchit":"glsl",".rd":"r",".rdf":"xml",".re":"c++",".reek":"yaml",".regex":"regular_expression",".regexp":"regular_expression",".res":"xml",".rest":"restructuredtext",".rest.txt":"restructuredtext",".resx":"xml",".rmiss":"glsl",".robot":"robotframework",".roc":"roc",".rockspec":"lua",".rpy":"python",".rq":"sparql",".rs":"xml",".rs.in":"rust",".rss":"xml",".rst":"restructuredtext",".rst.txt":"restructuredtext",".rsx":"r",".ru":"ruby",".ruby":"ruby",".rviz":"yaml",".s":"motorola_68k_assembly",".sarif":"json",".sbt":"scala",".sc":"supercollider",".scala":"scala",".scd":"supercollider",".sch":"xml",".scss":"scss",".scxml":"xml",".sdc":"tcl",".sexp":"common_lisp",".sfproj":"xml",".sh":"shell",".sh.in":"shell",".shader":"glsl",".shproj":"xml",".sjs":"javascript",".slint":"slint",".smali":"smali",".smithy":"smithy",".sol":"solidity",".sp":"sourcepawn",".sparql":"sparql",".spec":"ruby",".sql":"sql",".srdf":"xml",".ssjs":"javascript",".star":"starlark",".storyboard":"xml",".sublime-build":"json_with_comments",".sublime-commands":"json_with_comments",".sublime-completions":"json_with_comments",".sublime-keymap":"json_with_comments",".sublime-macro":"json_with_comments",".sublime-menu":"json_with_comments",".sublime-mousemap":"json_with_comments",".sublime-project":"json_with_comments",".sublime-settings":"json_with_comments",".sublime-snippet":"xml",".sublime-syntax":"yaml",".sublime-theme":"json_with_comments",".sublime-workspace":"json_with_comments",".sublime_metrics":"json_with_comments",".sublime_session":"json_with_comments",".svelte":"svelte",".sw":"xml",".swift":"swift",".syntax":"yaml",".t":"perl",".tab":"sql",".tac":"python",".targets":"xml",".tcc":"c++",".tcl":"tcl",".tcl.in":"tcl",".tesc":"glsl",".tese":"glsl",".textproto":"protocol_buffer_text_format",".tf":"hcl",".tfstate":"json",".tfstate.backup":"json",".tfvars":"hcl",".thor":"ruby",".thrift":"thrift",".tla":"tla",".tm":"tcl",".tml":"xml",".tmux":"tmux",".toml":"toml",".tool":"shell",".topojson":"json",".tpp":"c++",".trigger":"apex",".ts":"typescript",".tsv":"tsv",".tsx":"xml",".ttl":"turtle",".twig":"twig",".txt":"vim_help_file",".txx":"c++",".typ":"xml",".udf":"sql",".ui":"xml",".urdf":"xml",".url":"ini",".ux":"xml",".v":"verilog",".vala":"vala",".vapi":"vala",".vba":"vim_script",".vbproj":"xml",".vcxproj":"xml",".veo":"verilog",".vert":"glsl",".vim":"vim_script",".vimrc":"vim_script",".viw":"sql",".vmb":"vim_script",".vrx":"glsl",".vs":"glsl",".vsh":"glsl",".vshader":"glsl",".vsixmanifest":"xml",".vssettings":"xml",".vstemplate":"xml",".vue":"vue",".vxml":"xml",".watchr":"ruby",".webapp":"json",".webmanifest":"json",".wgsl":"wgsl",".wit":"webassembly_interface_type",".wixproj":"xml",".wlua":"lua",".workflow":"xml",".wsdl":"xml",".wsf":"xml",".wsgi":"python",".wxi":"xml",".wxl":"xml",".wxs":"xml",".x":"linker_script",".x3d":"xml",".x68":"motorola_68k_assembly",".xacro":"xml",".xaml":"xml",".xdc":"tcl",".xht":"html",".xhtml":"html",".xib":"xml",".xlf":"xml",".xliff":"xml",".xmi":"xml",".xml":"xml",".xml.dist":"xml",".xmp":"xml",".xproj":"xml",".xpy":"python",".xrl":"erlang",".xsd":"xml",".xsjs":"javascript",".xsjslib":"javascript",".xspec":"xml",".xul":"xml",".yaml":"yaml",".yaml-tmlanguage":"yaml",".yaml.sed":"yaml",".yang":"yang",".yml":"yaml",".yml.mysql":"yaml",".yrl":"erlang",".yy":"json",".yyp":"json",".zcml":"xml",".zig":"zig",".zsh":"shell",".zsh-theme":"shell"};
