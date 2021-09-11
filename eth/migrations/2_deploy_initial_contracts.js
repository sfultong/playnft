const Site = artifacts.require("Site");
require("dotenv").config();

module.exports = function (deployer) {
	  deployer.deploy(Site, process.env.ADMIN_ADDRESS);
}
