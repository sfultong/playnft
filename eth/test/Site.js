const Site = artifacts.require("Site");
require("dotenv").config();

contract("Site", accounts => {

    // only works if you start ganache with the correct mnemonic
    it("should allow admin to add artist", () =>
        Site.deployed()
            .then(instance => instance.addArtist('0xd08db5CB6e56D715c52634b5ADCa237C648539e6'))

    );
});
