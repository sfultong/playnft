{ packageOverrides = pkgs: {
    playNFT-frontend = (import ./default.nix).packages.x86_64-linux.playNFT-frontend;
    playNFT-backend = (import ./default.nix).packages.x86_64-linux.playNFT-backend;
  };
}
