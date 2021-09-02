{
  description = "playNFT flake";
  nixConfig.bash-prompt-suffix = "\\033[1;33m(playNFT)\\033[0m ";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    # nixops.url  = "github:lukebfox/nixops-plugged";
    nixops.url = "github:NixOS/nixops";
    utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };

  outputs = { self, nixpkgs, nixops, utils, flake-compat, ... }:
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
      };

      nixopsConfigurations.default = {
        inherit nixpkgs;
        network.description = domain;
        defaults.nixpkgs.pkgs = pkgsFor "x86_64-linux";
        defaults._module.args = {
          inherit domain;
        };
        webserver = import ./machine;
      };

    } // utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let pkgs = pkgsFor system;
      in {
        defaultPackage = pkgs.eth_contracts;

        devShell = pkgs.mkShell {
          # nativeBuildInputs = [ nixops.defaultPackage.${system} ];
          buildInputs = [
            pkgs.yarn
            pkgs.yarn2nix
            pkgs.nixopsUnstable
            # nixops.packages.nixops-gce
            # nixops.defaultPackage.${system}
          ];
        };
      });
}
