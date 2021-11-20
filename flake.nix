{
  description = "playNFT flake";
  nixConfig.bash-prompt-suffix = "\\033[1;33m(playNFT)\\033[0m ";

  inputs = {
    # easy-purescript-nix = {
    #   url = "github:justinwoo/easy-purescript-nix";
    #   flake = false;
    # };
    # nixpkgs.url = "nixpkgs/nixos-20.09";
    nixpkgs.url = "nixpkgs/nixos-unstable";
    # nixops.url  = "github:lukebfox/nixops-plugged";
    # nixops.url = "github:lukebfox/nixops-plugged";
    # nixops.url = "github:NixOS/nixops";
    utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { self
            , nixpkgs
            # , nixops
            , utils
            , flake-compat
            , ...
            } :
    let
      domain = "playnft.hhefesto.com";
      pkgsFor = system: import nixpkgs {
        inherit system;
        overlays = [self.overlay];
      };

    in {
      overlay = final: prev: {
        react_frontend = prev.callPackage ./react {};
	      eth_contracts = prev.callPackage ./eth {};
        elm_frontend = prev.callPackage ./elm {};
      };

      nixopsConfigurations.default = {
        inherit nixpkgs;
        network.description = domain;
        network.storage.legacy = {
          databasefile = "~/.nixops/deployments.nixops";
        };
        defaults.nixpkgs.pkgs = pkgsFor "x86_64-linux";
        defaults._module.args = {
          inherit domain;
        };
        webserver = import ./machine;
      };

    } // utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let pkgs = pkgsFor system;
          # easy-ps = import easy-purescript-nix { inherit pkgs; };
      in {
        defaultPackage = pkgs.eth_contracts;

        devShell = pkgs.mkShell {
          # nativeBuildInputs = [ nixops.defaultPackage.${system} ];
          buildInputs = [
            pkgs.elmPackages.elm
            pkgs.elmPackages.elm-live
            pkgs.elmPackages.create-elm-app
            pkgs.elm2nix
            # pkgs.elmPackages # doesn't evaluate correctly
            pkgs.yarn
            pkgs.yarn2nix

            pkgs.nixopsUnstable

            # easy-ps.purs-0_14_4
            # easy-ps.psc-package
            # easy-ps.spago
            pkgs.nodejs
            pkgs.ghc

            # pkgs.stack
            # nixops.packages.nixops-gce
            # nixops.defaultPackage.${system}
          ];
        };
      });
}
