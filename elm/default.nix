# { nixpkgs ? <nixpkgs>
# , config ? {}
# }:

# with (import nixpkgs config);
{ pkgs, ... }:
let
  mkDerivation =
    { srcs ? ./elm-srcs.nix
    , src
    , name
    , srcdir ? "./src"
    , targets ? []
    , registryDat ? ./registry.dat
    , outputJavaScript ? false
    }:
    pkgs.stdenv.mkDerivation {
      inherit name src;

      buildInputs = [ pkgs.elmPackages.elm ]
        ++ pkgs.lib.optional outputJavaScript pkgs.nodePackages.uglify-js;

      buildPhase = pkgs.elmPackages.fetchElmDeps {
        elmPackages = import srcs;
        elmVersion = "0.19.1";
        inherit registryDat;
      };

      installPhase = let
        elmfile = module: "${srcdir}/${builtins.replaceStrings ["."] ["/"] module}.elm";
        extension = if outputJavaScript then "js" else "html";
      in ''
        mkdir -p $out/share/doc
        ${pkgs.lib.concatStrings (map (module: ''
          echo "compiling ${elmfile module}"
          elm make ${elmfile module} --output $out/${module}.${extension} --docs $out/share/doc/${module}.json
          cp index.html $out/index.html
          cp abi.js $out/abi.js
          cp constants.js $out/constants.js
          cp web3.min.js $out/web3.min.js
          cp custom.css $out/custom.css
          cp favicon.ico $out/favicon.ico
          ${pkgs.lib.optionalString outputJavaScript ''
            echo "minifying ${elmfile module}"
            uglifyjs $out/${module}.${extension} --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' \
                | uglifyjs --mangle --output $out/${module}.min.${extension}
          ''}
        '') targets)}
      '';
    };
in mkDerivation {
  name = "elm-app-0.1.0";
  srcs = ./elm-srcs.nix;
  src = ./.;
  targets = ["Main"];
  srcdir = "./src";
  outputJavaScript = true;
}

