pragma solidity >=0.5.8 <0.7.0;

contract Admin {
         address adminAddress;

         constructor () internal {
         }

         function isAdmin () public view returns (bool) {
           return adminAddress == msg.sender; 
         }

         modifier admin {
           //require (isAdmin(), "user is not admin");
           require (adminAddress == msg.sender, "user is not admin");
           _;
         }
}

contract Site is Admin {

  struct Artist {
    string name;
    string description;
    bool enabled;
    // address payable addr;
  }

  struct Feature {
    uint startTime;
    uint endTime;
    int64 lastFeatureId; // -1 if none
    int64 currentBidId; // -1 if none
    bool accepted; // artist has approved the top bid for this feature
  }

  struct Art {
    // uint32 id;
    //uint16 artistId;
    address artistAddress;
    bool finished;
    int64 currentFeatureId; // -1 if none
  }

  struct Bid {
    // uint32 id;
    int64 lowerBidId; // if this outbids an older bid, otherwise -1
    address payable addr;
    uint amount;
    string request;
  }

  // Artist[] artists;
  mapping (address => Artist) artists;
  address[] artistAddresses;
  Art[] art;
  Feature[] features;
  Bid[] bids;

  string testMessage;

  event FeatureCreated (uint64 featureId);
  event ArtCreated (uint64 artId);

  function isArtist () public view returns (bool) {
     return artists[msg.sender].enabled;
  }

  // probably isn't useful. We want to know if msg.sender matches specific artist generally
  modifier artist {
    // require (isArtist(), "user is not an artist");  // does not work
    require (artists[msg.sender].enabled, "user is not an artist");
    _;
  }

  // change when struct definition changes
  function getArt (uint i) public view returns (address, bool, int64) {
    return (art[i].artistAddress, art[i].finished, art[i].currentFeatureId);
  }

  function getNumArt () public view returns (uint) {
    return art.length;
  }

  function getNumArtist () public view returns (uint) {
    return artistAddresses.length;
  }

  function getArtist (address artistAddress) public view returns (string memory, string memory, address payable) {
    Artist memory a = artists[artistAddress];
    address payable p = address(uint160(artistAddress));

    return (a.name, a.description, p);
  }

  function getDisplayFeature (uint16 artId) public view returns (int64) {
    Art memory thisArt = art[artId];
    int64 latestFeature = thisArt.currentFeatureId;
    if (latestFeature > -1) {
      if (thisArt.finished) {
        return latestFeature;
      } else {
        return features[uint(latestFeature)].lastFeatureId;
      }
    } else {
      return -1;
    }
  }

  function getFeature (uint64 featureId) public view returns (uint, uint, int64, int64, bool) {
    Feature memory f = features[uint(featureId)];
    return (f.startTime,f.endTime,f.lastFeatureId,f.currentBidId,f.accepted);
  }

  //TODO add admin back when fixed
  function addArtist (address payable _addr) public {
    // require (adminAddress == msg.sender, "user is not admin");
    bool _isAdmin = adminAddress == msg.sender;
    artists[_addr] = Artist("", "", true);
    artistAddresses.push(_addr);
  }

  function modifyArtistProfile (string memory _name, string memory _description) public {
    Artist storage artist = artists[msg.sender];
    artist.name = _name;
    artist.description = _description;
  }

  //TODO add back artist modifier when fixed
  function startArt () public {
     bool isArtistA = isArtist();
     bool isArtistB = artists[msg.sender].enabled;
     art.push(Art(msg.sender, false, -1));
  }

  //TODO add back artist modifier when fixed
  function startFeature (uint64 artId, uint _endTime) public {
    Art storage thisArt = art[artId];
    //require (thisArt.artistAddress == msg.sender, "can't start a feature for art you don't own!");

    Feature memory thisFeature = Feature (now, _endTime, thisArt.currentFeatureId, -1, false);
    features.push(thisFeature);
    thisArt.currentFeatureId = int64(features.length - 1);
  }

  // starts art with an initial feature already filled in by the artist
  function startArtWithFeature () public {
    Feature memory startFeature = Feature (now, now, -1, -1, true);
    features.push(startFeature);
    int64 featureId = int64(features.length - 1);
    emit FeatureCreated(uint64(featureId));

    art.push(Art(msg.sender, false, featureId));
    emit ArtCreated(uint64(art.length - 1));
  }

  function getBid (uint64 bidId) public view returns (int64, address payable, uint, string memory) {
    Bid memory b = bids[bidId];
    return (b.lowerBidId, b.addr, b.amount, b.request);
  }

  // TODO make sure you can't bid on feature auctions that have ended
  function makeBid (uint64 artId, string memory _request) public payable returns (bool, string memory) {
    Art memory thisArt = art[artId];
    if (thisArt.currentFeatureId > -1) {
      Feature storage thisFeature = features[uint(thisArt.currentFeatureId)];

      if (thisFeature.currentBidId > -1) {
        Bid memory oldBid = bids[uint(thisFeature.currentBidId)];

        if (msg.value > oldBid.amount) {
          Bid memory newBid = Bid (thisFeature.currentBidId, msg.sender, msg.value, _request);
          bids.push(newBid);
          thisFeature.currentBidId = int64(bids.length - 1);
          return (true, "You're now the top bidder!");

        } else { // insufficient bid
          return (false, "Your bid must be higher than the current maximum bid");
        }

      } else { // very first bid
        Bid memory newBid = Bid (-1, msg.sender, msg.value, _request);
        bids.push(newBid);
        thisFeature.currentBidId = int64(bids.length - 1);
        return (true, "You've made the very first bid!");
      }

    } else {
      return (false, "This art isn't open for bidding yet");
    }
  }

  // TODO make function for artist to cancel bid if they hate the request

  // TODO make this callable only by artist who owns artwork?
  function endBidding (uint64 artId) public {
    Art memory thisArt = art[artId];
    // require (thisArt.currentFeatureId > -1, "can't end bidding when there is no current feature");
    Feature storage thisFeature = features[uint(thisArt.currentFeatureId)];
    // require (now > thisFeature.endTime, "Can't end auction prematurely");

    if (thisFeature.currentBidId > -1) {
      Bid memory winningBid = bids[uint(thisFeature.currentBidId)];

      if (winningBid.lowerBidId > -1) {
         // refund losing bids
         Bid memory currentBid = winningBid; // assignment should be overwritten immediately
         for (currentBid = bids[uint(winningBid.lowerBidId)]; currentBid.lowerBidId != -1; currentBid = bids[uint(currentBid.lowerBidId)]) {
             currentBid.addr.transfer(currentBid.amount);
         }
         currentBid.addr.transfer(currentBid.amount); // need one last call for last bid
      }

      address payable aa = address(uint160(thisArt.artistAddress));
      aa.transfer(winningBid.amount); 

    } else { // there are no bids!
      
    }

    thisFeature.accepted = true;
  }

  function nextFeature (uint64 artId, uint endTime) public {
    endBidding(artId);
    startFeature(artId, endTime);
  }

  function getTestMessage() public view returns (string memory) {
    return testMessage;
  }

  constructor (address _admin) public {
    adminAddress =_admin;
    testMessage = "A test has passed";
  }

  function finishArt (uint64 artId) public {
    endBidding(artId);
    Art storage thisArt = art[artId];
    thisArt.finished = true;
  }
}
