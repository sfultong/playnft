{ pkgs, ... }:
pkgs.mkYarnPackage rec {
    name = "playnft-frontend";
    src = ./.;
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
}
