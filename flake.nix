{
  description = "playNFT flake";
  nixConfig.bash-prompt-suffix = "\\033[1;33m(playNFT)\\033[0m ";

  inputs = {
    # easy-purescript-nix = {
    #   url = "github:justinwoo/easy-purescript-nix";
    #   flake = false;
    # };
    # nixpkgs.url = "nixpkgs/nixos-20.09";
    nixpkgs.url = "nixpkgs/nixos-21.05";
    # nixpkgs.url = "nixpkgs/nixos-21.11";
    # nixpkgs.url = "nixpkgs/nixos-unstable";
    # nixops.url  = "github:NixOS/nixops";
    # nixops.url = "github:lukebfox/nixops-plugged";
    nixops.url = "github:input-output-hk/nixops-flake";
    utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { self
            , nixpkgs
            , nixops
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
        react-frontend = prev.callPackage ./react {};
	      eth-contracts = prev.callPackage ./eth {};
        elm-frontend = prev.callPackage ./elm {};
        js-backend =  prev.callPackage ./eth {};
      };

      # nixopsConfigurations.default = {
      #   inherit nixpkgs;
      #   network.description = domain;
      #   network.storage.legacy = {
      #     databasefile = "~/.nixops/deployments.nixops";
      #   };
      #   defaults.nixpkgs.pkgs = pkgsFor "x86_64-linux";
      #   defaults._module.args = {
      #     inherit domain;
      #   };
      #   webserver = import ./machine;
      # };

    } // utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let pkgs = pkgsFor system;
          # easy-ps = import easy-purescript-nix { inherit pkgs; };
      in {
        defaultPackage = pkgs.eth-contracts;
        packages.playNFT-frontend = pkgs.elm-frontend;
        packages.playNFT-backend = pkgs.js-backend;

        devShell = pkgs.mkShell {
          # nativeBuildInputs = [ nixops.packages.${system}."nixops_1_8-nixos-unstable" ];
          # nativeBuildInputs = [ nixops.packages.${system}."nixops_2_0-2021-01-unstable" ];
          # nativeBuildInputs = [ nixops.defaultPackage.${system} ];
          # nativeBuildInputs = [ pkgs.nixopsUnstable ];
          # nativeBuildInputs = [ pkgs.nixops ];

          buildInputs = [
            # nixops.packages.${system}."nixops_1_8-nixos-unstable"
            pkgs.nixops
            # nixops.packages.${system}."nixops_2_0-2021-01-unstable"
            pkgs.elmPackages.elm
            pkgs.elmPackages.elm-live
            pkgs.elmPackages.create-elm-app
            pkgs.elm2nix
            # pkgs.elmPackages # doesn't evaluate correctly
            pkgs.yarn
            pkgs.yarn2nix

            # pkgs.nixopsUnstable

            # easy-ps.purs-0_14_4
            # easy-ps.psc-package
            # easy-ps.spago
            pkgs.nodejs
            # pkgs.ghc

            # pkgs.stack
            # nixops.packages.nixops-gce
            # nixops.defaultPackage.${system}
          ];
        };
      });
}
