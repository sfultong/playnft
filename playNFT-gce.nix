{
  playnft-webserver = {
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
  };
}
