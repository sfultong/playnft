{ fetchurl, fetchgit, linkFarm, runCommand, gnutar }: rec {
  offline_cache = linkFarm "offline" packages;
  packages = [
    {
      name = "ws___ws_8.2.2.tgz";
      path = fetchurl {
        name = "ws___ws_8.2.2.tgz";
        url  = "https://registry.yarnpkg.com/ws/-/ws-8.2.2.tgz";
        sha1 = "ca684330c6dd6076a737250ed81ac1606cb0a63e";
      };
    }
  ];
}
