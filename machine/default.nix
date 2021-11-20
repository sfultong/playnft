{ pkgs, config, lib, domain, ... }: #1
let
  inherit (lib) fileContents; #2
in
{
  deployment = {
    targetEnv = "gce";
    gce = {
      project = "playnft";
      serviceAccount = "playnft@playnft.iam.gserviceaccount.com";
      accessKey = "~/.ssh/playnft-ff466b4265ae.json";
      region = "us-east1-b";
      instanceType = "g1-small";
      scheduling.automaticRestart = true;
      scheduling.onHostMaintenance = "MIGRATE";
      tags = [ "public-http" ];

      rootDiskSize = 30;
    };
  };
  # systemd.services.playNFTfrontend =
  #     { description = "playNFT's frontend";
  #       enable = true;
  #       wantedBy = [ "multi-user.target" "nginx.service" ];
  #       after = [ "network.service" "local-fs.target" ];
  #       serviceConfig = {
  #         Type = "simple";
  #         User = "root";
  #         ExecStart = ''${pkgs.playNFTfrontend}/bin/muellshack'';
  #         ExecStop = "";
  #         Restart = "always";
  #       };
  #     };

  # systemd.services.muellshack =
  #     { description = "muellshack";
  #       enable = true;
  #       wantedBy = [ "multi-user.target" "nginx.service" ];
  #       after = [ "network.service" "local-fs.target" ];
  #       serviceConfig = {
  #         Type = "simple";
  #         User = "root";
  #         ExecStart = ''${pkgs.muellshack}/bin/muellshack'';
  #         ExecStop = "";
  #         Restart = "always";
  #       };
  #     };

  networking.firewall.allowedTCPPorts = [ 80 443 ]; #5

  security.acme.acceptTerms = true;
  security.acme.email = "hhefesto@rdataa.com";

  services.nginx = {
    enable = true;

    virtualHosts."playnft.hhefesto.com" = {
      enableACME = true;
      forceSSL = true;
      root = ''${pkgs.elm_frontend}'';
      # locations = {
      #   "/" = {
      #     proxyPass = "http://localhost:8081";
      #   };
      # };
    };
  };

  environment.systemPackages = with pkgs; [
      git
      msmtp
      vim
      emacs
      zip
  ];

  users.extraUsers.hhefesto = {
      createHome = true;
      isNormalUser = true;
      home = "/home/hhefesto";
      description = "Daniel Herrera";
      extraGroups = [ "wheel" "networkmanager" "docker" ];
      hashedPassword = "$6$/RvS0Se.iCx$A0eA/8PzgMj.Ms9ohNamfu53c9S.zdG30hEmUHLjmWP0CaXTPVA6QxGIZ6fy.abkjSOTJMAq7fFL6LUBGs4BU0";
      # shell = pkgs.zsh; #"/run/current-system/sw/bin/bash";
    };

}
