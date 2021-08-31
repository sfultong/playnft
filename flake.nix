{
  description = "playNFT flake";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    # nixops.url  = "github:lukebfox/nixops-plugged";
    nixops.url = "github:NixOS/nixops";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, nixops, utils, ... }:
    let
      domain = "playnft.hhefesto.com";
      pkgsFor = system: import nixpkgs {
        inherit system;
        overlays = [self.overlay];
      };

    in {
      overlay = final: prev: {
        muellshack = prev.callPackage ./muellshack {};
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
        defaultPackage = pkgs.muellshack;

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
