const Site = artifacts.require("Site");
require("dotenv").config();

contract("Site", accounts => {

    const addr1 = "0xa4ca4a65D595ab224BEAb4E935242C764ec96aEF";
    const addr2 = "0xf757442ab8FD6ea913615069d754506440e0Fe13";
    const addr3 = "0xc045781fc7D52FF3e6198Bed26294ec71bF1849C";
    const addr4 = "0x88B07284566C19F7E89c30C8bD14Bd5b4e53b9C6";
    const addr5 = "0xaFd18D583902491B9d8F2ed6AA8366dfF5523A03";
    const addr6 = "0x95D33b45223D9a19F4EcecEE3ae0d1839321d3cf";
    const addr7 = "0x312F5377f74158A7ccde0F29EdEF6021A7eFd7de";
    const addr8 = "0xa218718F486BeE40787b240441C957415B8df8D3";
    const addr9 = "0x52902A1eEB3DCeF59C724c96Fd44fD4D5ff2dFaa";

    // only works if you start ganache with the correct mnemonic
    it("should allow admin to add artist", () =>
        Site.deployed()
            .then(instance => instance.addArtist('0xd08db5CB6e56D715c52634b5ADCa237C648539e6'))
            .then(dummy => { assert.ok(true); })

    );

    // only works if you start ganache with the correct mnemonic
    it("should fail to start art for non artist", () =>
        Site.deployed()
            .then(instance => {
                instance.addArtist(addr1);
                instance.startArt();
            })
            .then(dummy => assert.ok(true))
    );

    /* TODO make sure bidding works, with refunding
    it("one bid gets sent to artist" , () =>
        Site.deployed()
            .then(instance => {
                instance.events.ArtCreated().on('data', event => {
                    console.log("art created, id");
                });
                const fee = 1000000;
                instance.setFee(fee);
                instance.addArtist(addr1);
                instance.startArtWithFeature();
            })
            .then(() => assert.ok(true))
    );
    */
});
