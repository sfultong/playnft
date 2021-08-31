let
  credentials = {
    project = "playNFT";
    serviceAccount = "playnft@playnft.iam.gserviceaccount.como";
    accessKey = "~/.ssh/playnft-ff466b4265ae.json";
  };
  gce = { resources, ...}:  {
    networking.firewall.allowedTCPPorts = [ 80 ];
    deployment.targetEnv = "gce";
    deployment.gce = credentials // {
      region = "us-west2-b";
      instanceType = "g1-small";
      scheduling.automaticRestart = true;
      scheduling.onHostMaintenance = "MIGRATE";
      tags = [ "public-http" ];
      network = resources.gceNetworks.lb-net;

      rootDiskSize = 30;
    };
  };
in {
  resources.gceNetworks.lb-net = credentials // {
    description = "a descprition";
    addressRange = "192.168.4.0/24";
    firewall = {
      allow-http = {
        targetTags = [ "public-http" ];
        allowed.tcp = [ 80 ];
      };
      allow-ping.allowed.icmp = null;
    };
  };

  # by default, health check pings port 80, so we don't have to set anything
  resources.gceHTTPHealthChecks.plain-hc = credentials;

  server = gce;
}
