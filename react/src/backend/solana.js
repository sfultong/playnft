/*
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
*/
import * as solana from '@solana/web3.js';
import * as borsh from 'borsh';
import * as sha3 from 'sha3';
import axios from 'axios';
/*
const solana = require('@solana/web3.js');
const borsh = require('borsh');
const sha3 = require('sha3');
const axios = require('axios');
*/

const apiHost = process.env.REACT_APP_API_HOST;

const TE = new TextEncoder();
const TD = new TextDecoder();

// PlayNFT instructions
class AddArtist {
        address = new PubkeyDTO();

        constructor(data) {
                if (data) {
                        this.address = new PubkeyDTO(data);
                }
        }
}
class StartArt {
	endTime = 0;

	constructor(data) {
		if (data) {
			this.endTime = data.endTime;
		}
	}
}
class SetFee {
	fee = 0;

	constructor(data) {
		if (data) {
			this.fee = data.fee;
		}
	}
}
class ModifyArtistProfile {
	name = new Uint8Array(64);
	description = new Uint8Array(512);

	constructor(data) {
		if (data) {
			if (typeof(data.name) === 'string') {
				const tempName = TE.encode(data.name);
				const tempDesc = TE.encode(data.description);
				for (var i = 0; i < tempName.length; i++) {
					this.name[i] = tempName[i];
				}
				for (var i = 0; i < tempDesc.length; i++) {
					this.description[i] = tempDesc[i];
				}
			}
		}
	}
}
class MakeBid {
	amount = 0;
	request = new Uint8Array(128);

	constructor(data) {
		if (data) {
			if (typeof(data.request) === 'string') {
				this.amount = data.amount;
				const tempRequest = TE.encode(data.request);
				for (var i = 0; i < tempRequest.length; i++) {
					this.request[i] = tempRequest[i];
				}
			}
		}
	}
}
class NextFeature {
	artId = -1;
	endTime = 0;

	constructor(data) {
		if (data) {
			this.artId = data.artId;
			this.endTime = data.endTime;
		}
	}
}
class FinishArt {
	artId = -1;

	constructor(data) {
		if (data) {
			this.artId = data.artId;
		}
	}
}
class ResolveBid {
	artId = -1;
	featureId = -1;
	bidId = -1;

	constructor(data) {
		if (data) {
			this.artId = data.artId;
			this.featureId = data.featureId;
			this.bidId = data.bidId;
		}
	}
}

class PlayNFTInstruction {
        iType = 'setFee';
        initData = new SetFee();

        constructor(data) {
                if (data instanceof AddArtist) {
                        this.addArtist = data;
                        this.iType = 'addArtist';
                } else if (data instanceof StartArt) {
                        this.startArt = data;
                        this.iType = 'startArt';
                } else if (data instanceof SetFee) {
                        this.setFee = data;
                        this.iType = 'setFee';
                } else if (data instanceof ModifyArtistProfile) {
			this.modifyArtistProfile = data;
			this.iType = 'modifyArtistProfile';
		} else if (data instanceof MakeBid) {
			this.makeBid = data;
			this.iType = 'makeBid';
		} else if (data instanceof NextFeature) {
			this.nextFeature = data;
			this.iType = 'nextFeature';
		} else if (data instanceof FinishArt) {
			this.finishArt = data;
			this.iType = 'finishArt';
		} else if (data instanceof ResolveBid) {
			this.resolveBid = data;
			this.iType = 'resolveBid';
		}
        }
}

class PubkeyDTO {
        bytes = new Uint8Array(32);

        constructor(data) {
                if (data) {
			if (typeof data === 'string') {
				this.bytes = (new solana.PublicKey(data)).toBytes();
			} else if (data.toBytes) {
                                this.bytes = data.toBytes();
                        } else if (data.bytes) {
                                this.bytes = data.bytes;
                        }
                }
        }

        toPubkey() {
                return new solana.PublicKey(this.bytes);
        }
}

// on-chain structures
class PlayNFTData {
        numArtists = 0;
	fee = 0;

        constructor(data) {
                if (data) {
                        this.numArtists = data.numArtists;
			this.fee = data.fee;
                }
        }
}
class ArtistVal {
        address = new PubkeyDTO();

        constructor(data) {
                if (data) {
                        this.address = data.address;
                }
        }
}
class ArtistProfile {
	name = new Uint8Array(64);
	description = new Uint8Array(512);
	numArt = 0;

	constructor(data) {
		if (data) {
			if (typeof(data.name) === 'string') {
				const tempName = TE.encode(data.name);
				const tempDesc = TE.encode(data.description);
				for (var i = 0; i < tempName.length; i++) {
					this.name[i] = tempName[i];
				}
				for (var i = 0; i < tempDesc.length; i++) {
					this.description[i] = tempDesc[i];
				}
			} else if (data.name.byteLength) {
				for (var i = 0; i < data.name.length; i++) {
					this.name[i] = data.name[i];
				}
				for (var i = 0; i < data.description.length; i++) {
					this.description[i] = data.description[i];
				}
			}
		}
	}

	getName() {
		var subString = this.name;
		const zeroIndex = this.name.findIndex(x => ! x);
		if (zeroIndex !== -1) {
			subString = this.name.subarray(0, zeroIndex);
		}

		return TD.decode(subString);
	}
	getDescription() {
		var subString = this.description;
		const zeroIndex = this.description.findIndex(x => ! x);
		if (zeroIndex !== -1) {
			subString = this.description.subarray(0, zeroIndex);
		}

		return TD.decode(subString);
	}
}
class Feature {
	startTime = 0;
	endTime = 0;
	numBids = 0;

	constructor(data) {
		if (data) {
			this.startTime = data.startTime;
			this.endTime = data.endTime;
		}
	}
}
class Art {
	finished = false;
	numFeatures = 0;

	constructor(data) {
	}
}
class Bid {
	address = new PubkeyDTO();
	amount = 0;
	request = new Uint8Array(128);

	constructor(data) {
		if (data) {
			this.address = data.address;
			this.amount = data.amount;
			const tempRequest = TE.encode(data.request);
			for (var i = 0; i < tempRequest.length; i++) {
				this.request[i] = tempRequest[i];
			}
		}
	}

	getRequest() {
		return TD.decode(this.request);
	}
}

const PlayNFTSchema = new Map([
        [PubkeyDTO, {kind: 'struct', fields: [['bytes', [32]]]}],
        [PlayNFTData, {kind: 'struct', fields: [['numArtists', 'u32'], ['fee','u64']]}],
        [ArtistVal, {kind: 'struct', fields: [['address', PubkeyDTO]]}],
	[ArtistProfile, {kind: 'struct', fields: [['name', [64]], ['description', [512]], ['numArt', 'u16']]}],
	[Feature, {kind: 'struct', fields: [['startTime', 'u64'], ['endTime', 'u64'], ['numBids', 'u16']]}],
	[Art, {kind: 'struct', fields: [['finished', 'u8']]}],
	[Bid, {kind: 'struct', fields: [['address', PubkeyDTO], ['amount', 'u64'], ['request', [128]]]}],
        [AddArtist, {kind: 'struct', fields: [['address', PubkeyDTO]]}],
        [StartArt, {kind: 'struct', fields: [['endTime','u64']]}],
	[SetFee, {kind: 'struct', fields: [['fee','u64']]}],
	[ModifyArtistProfile, {kind: 'struct', fields: [['name', [64]], ['description', [512]]]}],
	[MakeBid, {kind: 'struct', fields: [['amount', 'u64'], ['request', [128]]]}],
	[NextFeature, {kind: 'struct', fields: [['artId', 'u16'], ['endTime', 'u64']]}],
	[FinishArt, {kind: 'struct', fields: [['artId', 'u16']]}],
	[ResolveBid, {kind: 'struct', fields: [['artId', 'u16'], ['featureId', 'u16'], ['bidId', 'u16']]}],
        [PlayNFTInstruction, {kind: 'enum', field: 'iType', values: [
                ['addArtist', AddArtist],
                ['startArt', StartArt],
		['setFee', SetFee],
		['modifyArtistProfile', ModifyArtistProfile],
		['makeBid', MakeBid],
		['nextFeature', NextFeature],
		['finishArt', FinishArt],
		['resolveBid', ResolveBid],
        ]}],
]);

// TODO could remove
const PLAYNFT_DATA_SIZE = borsh.serialize(PlayNFTSchema, new PlayNFTData()).length;
const ARTISTVAL_DATA_SIZE = borsh.serialize(PlayNFTSchema, new ArtistVal()).length;
const ARTIST_PROFILE_DATA_SIZE = borsh.serialize(PlayNFTSchema, new ArtistProfile()).length;
const FEATURE_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Feature()).length;
const ART_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Art()).length;
const BID_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Bid()).length;

const PLAYNFT_SEED = "playnft";
const url = "http://localhost:8899"
const connection = new solana.Connection(url, 'confirmed');

const PROGRAM_ID_PUBKEY = new solana.PublicKey("7LYdZDwexbkgEF49c7HxNjpdpGwEKFuxV3eRdqrm23by");
const ADMIN_PUBKEY = new solana.PublicKey("Vgf5sNqv6T4Heqb1xXNLPKpaWqvnDHvADkpDbq7eHUo");
var test_admin_address; 
var test_user_keys;

const pProvider = new Promise ((resolve, reject) => {
	try {
		window.onload = _ => {
		  if ("solana" in window) {
		    const provider = window.solana;
		    if (provider.isPhantom) {
		      resolve(provider);
		    } else {
			  window.open("https://phantom.app/", "_blank");
		    }
		  }
		};
	} catch (e) {
	}
});
const dProvider = new Promise ((resolve, reject) => {
	resolve({
		signAndSendTransaction: function (transaction, opts) {
			return new Promise ((resolve, reject) => {
				connection.sendTransaction(transaction, [test_user_keys], opts).then(r => {
					resolve({signature: r});
				});
			});
		},
		connect: function () {
			return new Promise ((resolve, reject) => {
				connection.requestAirdrop(test_user_keys.publicKey, solana.LAMPORTS_PER_SOL * 10)
					.then(s => connection.confirmTransaction(s).then(_ =>
						resolve({publicKey: test_user_keys.publicKey})));
			});

		}
	});
});
const getProvider = function () {

	if (test_admin_address) {
		return dProvider;
	} else {
		return pProvider;
	}
};

const newTransaction = () => {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
                        connection.getRecentBlockhash().then(r => {
                                const opts = { recentBlockhash: r.blockhash, feePayer: uk};
				console.log("resolving newTransaction");
                                resolve(new solana.Transaction(opts));
                        });
                });
        });
}

const signSendConfirm = transaction => {
        return new Promise ((resolve, reject) => {
                getProvider().then(p => {
                        const opts = {
                          preflightCommitment: "processed"
                        }
                        p.signAndSendTransaction(transaction, opts).then(r => {
                                connection.confirmTransaction(r.signature).then(_ => {
					console.log("resolving signSendConfirm");
                                        resolve();
                                });
                        });
                });
        });
};

const userPubkey = function () {
	return new Promise((resolve, reject) => {
		getProvider().then(p => p.connect().then(resp => resolve(resp.publicKey)));
	});
}

const adminAddress = function () {
	return new Promise((resolve, reject) => {
		if (test_admin_address) {
			console.log("resolving adminAddress (test)");
			resolve(test_admin_address);
		} else {
			console.log("resolving adminAddress");
			resolve(ADMIN_PUBKEY);
		}
	});
}

// section for address generation by seed
// TODO size unnecessary now, can remove
const getPnftAddress = function () {
	return new Promise((resolve, reject) => {
		adminAddress().then(aa => {
			solana.PublicKey.createWithSeed(aa, PLAYNFT_SEED, PROGRAM_ID_PUBKEY).then(pntfa => {
				console.log("resolving getPnftAddress");
				resolve({publicKey: pntfa, seed: PLAYNFT_SEED, size: PLAYNFT_DATA_SIZE
					, type: PlayNFTData, baseKey: aa});
			});
		});
	});
};
const getArtistAddressAddress = function (artistId) {
        return new Promise ((resolve, reject) => {
                adminAddress().then(aa => {
                        const seed = "artists" + artistId;
                        solana.PublicKey.createWithSeed(aa, seed, PROGRAM_ID_PUBKEY)
                        .then(aaa => resolve({publicKey: aaa, seed: seed, size: ARTISTVAL_DATA_SIZE, type: ArtistVal
				, baseKey: aa}));
                });
        });
};
const getArtistProfileAddress = function (artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "profile";
		solana.PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
			.then(apa => resolve({publicKey: apa, seed: seed, size: ARTIST_PROFILE_DATA_SIZE
				, type: ArtistProfile, baseKey: artistKey}));
	});
};
const getArtAddress = function (art_id, artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "art" + art_id;
		solana.PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
		.then(aa => resolve({publicKey: aa, seed: seed, size: ART_DATA_SIZE, type: Art, baseKey: artistKey}));
	});
};
const getFeatureAddress = function (feature_id, artKey) {
        return new Promise ((resolve, reject) => {
		const seed = "feature" + feature_id;
		solana.PublicKey.createWithSeed(artKey, seed, PROGRAM_ID_PUBKEY)
		.then(fa => resolve({publicKey: fa, seed: seed, size: FEATURE_DATA_SIZE, type: Feature
			, baseKey: artKey}));
	});
};
const getBidAddress = function (bid_id, featureKey) {
        return new Promise ((resolve, reject) => {
		const seed = "bid" + bid_id;
		solana.PublicKey.createWithSeed(featureKey, seed, PROGRAM_ID_PUBKEY)
		.then(ba => resolve({publicKey: ba, seed: seed, size: BID_DATA_SIZE, type: Bid, baseKey: featureKey}));
	});
};


// also creates account, if it doesn't already exist (but you need to be admin!)
const playNFTDataAddress = function () {
	return new Promise((resolve, reject) => {
		adminAddress().then(aa => {
			getPnftAddress().then(pntfa => {
				connection.getAccountInfo(pntfa.publicKey, 'confirmed').then(ai => {
					if (! ai) {
						console.log("initializing playNFT data");
						newTransaction().then(t => {
							createAccount(pntfa).then(ix => {
								t.add(ix);
								signSendConfirm(t).then(_ => resolve(pntfa));
							});
						});
					} else {
						console.log("resolving playNFTDataAddress");
						resolve(pntfa);
					}
				});
			});
		});
	});
};

const createAccount = function (a) {
        return new Promise ((resolve, reject) => {
		userPubkey().then(uk => {
			const accountSize = borsh.serialize(PlayNFTSchema, new a.type()).length;
			connection.getMinimumBalanceForRentExemption(a.size).then(lamSize => 
				resolve(solana.SystemProgram.createAccountWithSeed({
					space: accountSize,
					lamports: lamSize,
					fromPubkey: uk,
					basePubkey: a.baseKey,
					seed: a.seed,
					newAccountPubkey: a.publicKey,
					programId: PROGRAM_ID_PUBKEY,
				}))
			);
		});
	});
}

const deserialize = function (a) {
        return new Promise ((resolve, reject) => {
		connection.getAccountInfo(a.publicKey).then(accountInfo => {
			if (accountInfo) {
				console.log("resolving deserialize");
				console.log(a.type);
				console.log(accountInfo.data);
				resolve(borsh.deserialize(PlayNFTSchema, a.type, accountInfo.data));
			} else {
				reject();
			}
		});
	});
};

const getArtistAddressById = function (artistId) {
        return new Promise ((resolve, reject) => {
                getArtistAddressAddress(artistId).then(aaa => {
			deserialize(aaa).then(aa => resolve(aa.address.toPubkey()));
                });
        });
};

const playnftInstruction = function (i, keys) {
	return new solana.TransactionInstruction({
		programId: PROGRAM_ID_PUBKEY,
		data: borsh.serialize(PlayNFTSchema, new PlayNFTInstruction(i)),
		keys: keys
	});
};

const addArtist = function (artistAddress) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
                        playNFTDataAddress().then(playNFTAddress => {
                                deserialize(playNFTAddress).then(pnftData => {
                                        getArtistAddressAddress(pnftData.numArtists).then(aaa => {
						newTransaction().then(t => {
							createAccount(aaa).then(ix => {
								const pnftIx = playnftInstruction(new AddArtist(artistAddress),
									[
										{pubkey: uk, isSigner: true
											, isWritable: false},
										{pubkey: playNFTAddress.publicKey
											, isSigner: false
											, isWritable: true},
										{pubkey: aaa.publicKey, isSigner: false
											, isWritable: true},
									],
								);
								t.add(ix, pnftIx);
                                                                signSendConfirm(t).then(_ => resolve(aaa));
							});
						});
                                        });
                                });
                        });
                });
        });
};

const modifyArtistProfile = function (name, description) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
			getArtistProfileAddress(uk).then(apa => {
				connection.getAccountInfo(apa.publicKey).then(accountInfo => {
					var ixs = [];
					const sendTx = function () {
						const iData = {name: name, description: description};
						const instr = new ModifyArtistProfile(iData);
						ixs.push(playnftInstruction(instr,
							[
								{pubkey: uk, isSigner: true, isWritable: false},
								{pubkey: apa.publicKey, isSigner: false
									, isWritable: true},
							],
						));
						newTransaction().then(t => {
							ixs.forEach(i => t.add(i));
							signSendConfirm(t).then(_ => resolve());
						});
					};
					if (! accountInfo) {
						createAccount(apa).then(ix => {
							ixs.push(ix);
							sendTx();
						});
					} else {
						sendTx();
					}
				});
			});
		});
	});
};

const startArtWithFeature = function (endTime) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
			getArtistProfileAddress(uk).then(apa => {
				deserialize(apa).then(ap => {
					getArtAddress(ap.numArt, uk).then(aa => {
						getFeatureAddress(0, aa.publicKey).then(faa => {
							getFeatureAddress(1, aa.publicKey).then(fab => {
								Promise.all([
									createAccount(aa),
									createAccount(faa),
									createAccount(fab),
								]).then(ixs => {
									ixs.push(playnftInstruction(new StartArt(endTime),
										[
											{pubkey: uk, isSigner: true,
												isWritable: false},
											{pubkey: apa.publicKey,
												isSigner: false,
												isWritable: true},
											{pubkey: aa.publicKey,
												isSigner: false,
												isWritable: true},
											{pubkey: faa.publicKey,
												isSigner: false,
												isWritable: true},
											{pubkey: fab.publicKey,
												isSigner: false,
												isWritable: true},
										],
									));
									newTransaction().then(t => {
										ixs.forEach(i => t.add(i));
										signSendConfirm(t).then(_ => 
											resolve({
												artAddress: aa,
												artId: ap.numArt,
											}));
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

const nextFeature = function (artId, endTime) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
			getArtAddress(artId, uk).then(aa => {
				deserialize(aa).then(art => {
					getFeatureAddress(art.numFeatures, aa).then(fa => {
						createAccount(fa).then(ix => {
							newTransaction().then(t => {
								t.add(ix);
								t.add(playnftInstruction(
									new NextFeature(artId, endTime),
									[
										{pubkey: uk, isSigner: true
											, isWritable: false},
										{pubkey: aa.publicKey, isSigner: false
											, isWritable: true},
										{pubkey: fa.publicKey, isSigner: false
											, isWritable: true}
									]
								));
								signSendConfirm(t).then(_ => resolve(fa));
							});
						});
					});
				});
			});
		});
	});
};

const makeBid = function (artistAddress, artId, request, amount) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
                        playNFTDataAddress().then(playNFTAddress => {
				getArtAddress(artId, artistAddress).then(aa => {
					deserialize(aa).then(art => {
						getFeatureAddress(art.numFeatures - 1, aa).then(fa => {
							deserialize(fa).then(feature => {
								const addOldBid = function (oks) {
									new Promise ((resolve, reject) => {
										// if not the first bid, requires old bid
										if (feature.numBids) {
											getBidAddress(feature.numBids - 1, fa)
											.then(ba => {
												resolve(oks.concat([
													{ pubkey: ba.pub
													, isSigner: false
													, isWritable: false
													}
												]));
											});
										} else {
											resolve(oks);
										}
									});
								};
								getBidAddress(feature.numBids, fa).then(ba => {
									const ka = [
										{pubkey: uk, isSigner: true,
											isWritable: false
										},
										{pubkey: playNFTAddress,
											isSigner: false,
											isWritable: false},
										{pubkey: fa.publicKey,
											isSigner: false,
											isWritable: true},
										{pubkey: ba.publicKey,
											isSigner: false,
											isWritable: true},
									];
									newTransaction().then(t => {
										addOldBid(ka).then(keys => {
											t.add(playnftInstruction(
												new MakeBid(amount,
													request),
												keys));
											signSendConfirm(t).then(_ =>
												resolve(ba));
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

const finishArt = function (artId) {
        return new Promise ((resolve, reject) => {
                userPubkey().then(uk => {
			getArtAddress(artId, uk).then(aa => {
				newTransaction().then(t => {
					t.add(playnftInstruction(
						new FinishArt(artId),
						[
							{pubkey: uk, isSigner: true, isWritable: false},
							{pubkey: aa, isSigner: false, isWritable: true},
						]
					));
				});
			});
		});
	});
};

const signFeatureImage = function (featureId, imageHash) {
        return new Promise ((resolve, reject) => {
		const message = {message:{featureId:featureId, imageHash:imageHash}};
		window.solana.signMessage(TE.encode(JSON.stringify(message)), "utf8").then(sm => 
			resolve({message: message, signature: sm})
		);
	});
};

const controlCompleteFeature = function (artId, featureId, completeArtwork, featureEndTime, imageData) {
        return new Promise ((resolve, reject) => {
		const hash = new sha3.Keccak(256);
		hash.update(imageData);
		const imageHash = hash.digest('hex');

                userPubkey().then(uk => {
			signFeatureImage(featureId, imageHash).then(signResult => {
				const formData = new FormData();
				formData.append("imageData", imageData);
				formData.append("signedData", signResult.message);
				formData.append("signature", signResult.signature);
				formData.append("artistAddress", uk);
				formData.append("artId", artId);
				formData.append("feature", featureId);

				axios.post(apiHost + "/upload-image", formData).then ((res) => {
				    if (res.data.status) {

					if (completeArtwork) {
					    finishArt(artId).then(_ => {
						resolve();
					    });

					} else {
					    nextFeature(artId, featureEndTime).then((featureReceipt) => {
						resolve(featureReceipt);
					    });
					}
				    } else {
					reject({error: "error uploading image", result:res});
				    }
				}).catch ((err) => {
				    reject({error: "problem signing/posting image", result:err});
				});
			});
		});
	});
};

const controlStartArtWithFeature = function (featureEndTime, imageData) {
        return new Promise ((resolve, reject) => {
		startArtWithFeature().then(receipt => {
			const artId = receipt.artId;
			const featureId = 0;
			controlCompleteFeature(artId, featureId, false, featureEndTime, imageData).then(r => 
				resolve(r)).catch(err => reject(err));
		});
	});
};

//const makeBid = function (artistAddress, artId, request, amount) {
const getArtDisplay = function (artistAddress, artId) {
        return new Promise ((resolve, reject) => {
		getArtistProfileAddress(artistAddress).then(apa => {
			deserialize(apa).then(ap => {
				getArtAddress(artId, artistAddress).then(aa => {
					deserialize(aa).then(art => {
						const displayFeature = art.finished ? art.numFeatures - 1
							: art.numfeatures - 2;
						const imgUrl = apiHost + "/" + artistAddress + "/" + artId + "_" 
							+ displayFeature;
						const makeBid_ = function (req, amount) {
							return makeBid (artistAddress, artId, req, amount);
						};
						const completeFeat = function (comp, endTime, img) {
							return controlCompleteFeature(artId, art.numFeatures - 1
								, comp, endTime, img);
						};

						getFeatureAddress(displayFeature, aa).then(fa => {
							deserialize(fa).then(feature => {
								getBidAddress(feature.numBids - 1, fa).then(ba => {
									deserialize(ba).then(bid => {
										console.log("resolving getArtDisplay");

										resolve({
											artistName: ap.name,
											imgUrl: imgUrl,
											timeText: feature.endTime,
											bidAmount: bid.amount,
											featureRequest: bid.request,
											makeBid: makeBid_,
											completeFeature: completeFeat,
											/*
											artId: artId,
											featureId: displayFeature,
											*/
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

const getArtList = function (artId) {
	const getAllArt = function (artistId) {
		return new Promise ((resolve, reject) => {
			getArtistAddressById(artistId).then(aa => {
				console.log("getAllArt got artist address");
				getArtistProfileAddress(aa).then(apa => {
					console.log("getAllArt got artist profile address");
					console.log(apa);
					connection.getAccountInfo(apa.publicKey).then(accountInfo => {
						if (accountInfo) {
							deserialize(apa).then(ap => {
								var artP = [];
								for (var i = 0; i < ap.numArt; i++) {
									artP.push(getArtDisplay(aa, i));
								}
								console.log("getAllArt all promises assembled");
								console.log(artP);
								Promise.all(artP).then(al => {
									resolve(al);
									console.log("getAllArt resolved all promises");
								});
							});
						} else {
							resolve([]);
						}
					});
				});
			});
		});
	};
	return new Promise ((resolve, reject) => {
		playNFTDataAddress().then(playNFTAddress => {
			console.log("getArtList got playNFTAddress");
			deserialize(playNFTAddress).then(pnftData => {
				console.log("getArtList got playNFT data");
				var artistP = [];
				for (var i = 0; i < pnftData.numArtists; i++) {
					artistP.push(getAllArt(i));
				}
				console.log("getArtList got all art data");
				Promise.all(artistP).then(aal => resolve(aal.flat()));
			});
		});
	});
};

const makeWeb3LoginControls = function () {
	const installState = 0;
	const loginState = 1;
	const activeState = 2;

	var state = installState;

	const login = function (successCallback) {
		userPubkey().then(_ => successCallback());
	};

	const handleClick = function (successCallback) {
		if (state === installState) {
			window.open("https://phantom.app/", "_blank");
		} else if (state === loginState) {
			login(successCallback);
		} else {
			alert("web3Login-handleClick: shouldn't be here");
		}
	};

	const getDisplay = function () {
		return state === installState ? "Install Phantom"
		: state === loginState ? "Login with Phantom"
		: "This message should be hidden";
	};

	const initComponent = function (successCallback) {
		successCallback();
	}

	const shouldHide = function () {
		return state === activeState;
	};

	return {login: login, handleClick: handleClick, getDisplay: getDisplay, initComponent: initComponent
                , shouldHide: shouldHide };

};

const makeAdminControls = function () {

	const initComponent = function (setArtists) {
		playNFTDataAddress().then(playNFTAddress => {
			deserialize(playNFTAddress).then(pnftData => {
				setArtists(pnftData.numArtists);
			});
		});
	};

	const handleSubmit = function (address, callback) {
		addArtist(address).then(x => callback(x));
	}

	return {initComponent: initComponent, handleSubmit: handleSubmit };
};

const makeArtistControls = function () {
	
	const initComponent = function (callback) {
                userPubkey().then(uk => {
			console.log("mac: upk got");
			getArtistProfileAddress(uk).then(apa => {
				console.log("mac: apa got");
				deserialize(apa).then(ap => {
					callback({artistName: ap.getName(), artistDescription: ap.getDescription()});
				}).catch(_ => {
					console.log("artist controls: no artist profile");
				});
			});
		});
	};

	const profileSubmit = function (artistName, artistDescription, callback) {
		modifyArtistProfile(artistName, artistDescription).then(x => callback(x));
	};

	return { initComponent: initComponent, profileSubmit: profileSubmit };
};

const userAccount = function () {
	return new Promise ((resolve, reject) => {
		//userPubkey().then(upk => resolve(upk.toBase58()));
		userPubkey().then(upk => {
			console.log("user pubkey in useraccount:");
			console.log(upk);
			resolve(upk.toBase58());
			console.log("user pubkey in useraccount finished");
		});
	});
};

//TODO
const registerArtCreatedListener = function (callback) {};
const registerFeatureCreatedListener = function (callback) {};

const makeAPI = function (ta, tuk) {
	//test_admin_address = new solana.PublicKey(ta);
	test_admin_address = ta;
	test_user_keys = tuk;

	return {
		addArtist: addArtist,
		getArtList: getArtList,
		userAccount: userAccount,
		controlStartArtWithFeature: controlStartArtWithFeature,
		makeWeb3LoginControls: makeWeb3LoginControls,
		makeAdminControls: makeAdminControls,
		makeArtistControls: makeArtistControls,
		getArtDisplay: getArtDisplay,
		registerArtCreatedListener: registerArtCreatedListener,
		registerFeatureCreatedListener: registerFeatureCreatedListener,
		getArtistAddressAddress: getArtistAddressAddress,
	};
};
/*
module.exports = {makeAPI:makeAPI, newKeys: function () { return new solana.Keypair(); }};
console.log(module);
*/
export const api_ = {
	makeAPI: makeAPI,
};
