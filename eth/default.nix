{ pkgs, ... }:
pkgs.mkYarnPackage rec {
    name = "playnft-eth";
    src = ./.;
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
}
