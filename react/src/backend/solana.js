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
import * as borsh from 'borsh';
import { Keccak } from 'sha3';
import axios from 'axios';

const TE = new TextEncoder();
const TD = new TextDecoder();

const provider = new Promise ((resolve, reject) => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      resolve(provider);
    } else {
          window.open("https://phantom.app/", "_blank");
    }
  }
});

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
				this.name = TE.encode(data.name);
				this.description = TE.encode(data.description);
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
				this.request = TE.encode(data.request);
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
                        if (data.toBytes) {
                                this.bytes = data.toBytes();
                        } else if (data.bytes) {
                                this.bytes = data.bytes;
                        }
                }
        }

        toPubkey() {
                return new PublicKey(this.bytes);
        }
}

// on-chain structures
class PlayNFTData {
        numArtists = 0;

        constructor(data) {
                if (data) {
                        this.numArtists = data.numArtists;
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
				this.name = TE.encode(data.name);
				this.description = TE.encode(data.description);
			}
		}
	}

	getName() {
		return TD.decode(this.name);
	}
	getDescription() {
		return TD.decode(this.description);
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
			this.request = TE.encode(data.request);
		}
	}

	getRequest() {
		return TD.decode(this.request);
	}
}

const PlayNFTSchema = new Map([
        [PubkeyDTO, {kind: 'struct', fields: [['bytes', [32]]]}],
        [PlayNFTData, {kind: 'struct', fields: [['numArtists', 'u32']]}],
        [ArtistVal, {kind: 'struct', fields: [['address', PubkeyDTO]]}],
	[ArtistProfile, {kind: 'struct', fields: [['name', [64]], ['description', [512]], ['numArt', 'u16']]}],
	[Feature, {kind: 'struct', fields: [['startTime', 'i64'], ['endTime', 'i64'], ['numBids', 'u16']]}],
	[Art, {kind: 'struct', fields: [['finished', 'bool']]}],
	[Bid, {kind: 'struct', fields: [['address', PubkeyDTO], ['amount', 'u64'], ['request', [128]]]}],
        [AddArtist, {kind: 'struct', fields: [['address', PubkeyDTO]]}],
        [StartArt, {kind: 'struct', fields: [['endTime','i64']]}],
	[SetFee, {kind: 'struct', fields: [['fee','u64']]}],
	[ModifyArtistProfile, {kind: 'struct', fields: [['name', [64]], ['description', [512]]]}],
	[MakeBid, {kind: 'struct', fields: [['amount', 'u64'], ['request', [128]]]}],
	[NextFeature, {kind: 'struct', fields: [['artId', 'u16'], ['endTime', 'i64']]}],
	[FinishArt, {kind: 'struct', fields: [['artId', 'u16']]}],
	[ResolveBid, {kind: 'struct', fields: [['artId', 'u16'], ['featureId', 'u16'], ['bidId', 'u16']]}],
        [PlayNFTInstruction, {kind: 'enum', field: 'iType', values: [
                ['addArtist', AddArtist],
                ['startArt', StartArt],
		['setFee', SetFee],
		['modifyArtistProfile', ModifyArtistProfile],
		['makeBid', MakeBid],
		['nextFeature', Nextfeature],
		['finishArt', FinishArt],
		['resolveBid', ResolveBid],
        ]}],
]);

const PLAYNFT_DATA_SIZE = borsh.serialize(PlayNFTSchema, new PlayNFTData()).length;
const ARTISTVAL_DATA_SIZE = borsh.serialize(PlayNFTSchema, new ArtistVal()).length;
const ARTIST_PROFILE_DATA_SIZE = borsh.serialize(PlayNFTSchema, new ArtistProfile()).length;
const FEATURE_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Feature()).length;
const ART_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Art()).length;
const BID_DATA_SIZE = borsh.serialize(PlayNFTSchema, new Bid()).length;

const PLAYNFT_SEED = "playnft";
const url = "http://localhost:8899"
const connection = new Connection(url, 'confirmed');

const PROGRAM_ID_PUBKEY = new PublicKey("78tcnH5Hyqc1Tgm3tyNS14jYnZ6bTcjPCLzgT4R32gka");

const newTransaction = () => {
        return new Promise ((resolve, reject) => {
                userPubkey.then(uk => {
                        connection.getRecentBlockhash().then(r => {
                                const opts = { recentBlockhash: r.blockhash, feePayer: uk};
                                resolve(new Transaction(opts));
                        });
                });
        });
}

const signSendConfirm = transaction => {
        return new Promise ((resolve, reject) => {
                provider.then(p => {
                        const opts = {
                          preflightCommitment: "processed"
                        }
                        p.signAndSendTransaction(transaction, opts).then(r => {
                                connection.confirmTransaction(r.signature).then(_ => {
                                        resolve();
                                });
                        });
                });
        });
};

const userPubkey = new Promise((resolve, reject) => {
        provider.then(p => p.connect().then(resp => resolve(resp.publicKey)));
});

//TODO replace with hard-coded admin address
const adminAddress = new Promise((resolve, reject) => {
        userPubkey.then(pk => resolve(pk));
});

// section for address generation by seed
const getPnftAddress = new Promise((resolve, reject) => {
        adminAddress.then(aa => {
                PublicKey.createWithSeed(aa, PLAYNFT_SEED, PROGRAM_ID_PUBKEY).then(pntfa => {
			resolve({publicKey: pntfa, seed: PLAYNFT_SEED, size: PLAYNFT_DATA_SIZE, type: PlayNFTData
				, baseKey: aa});
		});
	});
});
const getArtistAddressAddress = function (artistId) {
        return new Promise ((resolve, reject) => {
                adminAddress.then(aa => {
                        const seed = "artists" + artistId;
                        PublicKey.createWithSeed(aa, seed, PROGRAM_ID_PUBKEY)
                        .then(aaa => resolve({publicKey: aaa, seed: seed, size: ARTISTVAL_DATA_SIZE, type: ArtistVal
				, baseKey: aa}));
                });
        });
};
const getArtistProfileAddress = function (artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "profile";
		PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
			.then(apa => resolve({publicKey: apa, seed: seed, size: ARTIST_PROFILE_DATA_SIZE
				, type: ArtistProfile, baseKey: artistKey}));
	});
};
const getArtAddress = function (art_id, artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "art" + art_id;
		PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
		.then(aa => resolve({publicKey: aa, seed: seed, size: ART_DATA_SIZE, type: Art, baseKey: artistkey}));
	});
};
const getFeatureAddress = function (feature_id, artKey) {
        return new Promise ((resolve, reject) => {
		const seed = "feature" + feature_id;
		PublicKey.createWithSeed(artKey, seed, PROGRAM_ID_PUBKEY)
		.then(fa => resolve({publicKey: fa, seed: seed, size: FEATURE_DATA_SIZE, type: Feature
			, baseKey: artKey}));
	});
};
const getBidAddress = function (bid_id, featureKey) {
        return new Promise ((resolve, reject) => {
		const seed = "bid" + bid_id;
		PublicKey.createWithSeed(featureKey, seed, PROGRAM_ID_PUBKEY)
		.then(ba => resolve({publicKey: ba, seed: seed, size: BID_DATA_SIZE, type: Bid, baseKey: featureKey}));
	});
};


// also creates account, if it doesn't already exist (but you need to be admin!)
const playNFTDataAddress = new Promise((resolve, reject) => {
        adminAddress.then(aa => {
                getPnftAddress.then(pntfa => {
                        connection.getAccountInfo(pntfa, 'confirmed').then(ai => {
                                if (! ai) {
                                        console.log("initializing playNFT data");
					newTransaction().then(t => {
						createAccount(pntfa).then(ix => {
							t.add(ix);
							signSendConfirm(t).then(_ => resolve(pntfa));
						});
					});

					/*
                                        connection.getMinimumBalanceForRentExemption(PLAYNFT_DATA_SIZE)
                                                .then(lamSize => {
                                                const createAccountIx = SystemProgram.createAccountWithSeed({
                                                        space: PLAYNFT_DATA_SIZE,
                                                        lamports: lamSize,
                                                        fromPubkey: aa,
                                                        basePubkey: aa,
                                                        seed: PLAYNFT_SEED,
                                                        newAccountPubkey: pntfa,
                                                        programId: PROGRAM_ID_PUBKEY,
                                                });
                                                newTransaction().then(t => {
                                                        t.add(createAccountIx);
                                                        signSendConfirm(t).then(_ => resolve(pntfa));
                                                });
                                        });
					*/
                                } else {
                                        resolve(pntfa);
                                }
                        });
                });
        });
});

const createAccount = function (a) {
        return new Promise ((resolve, reject) => {
		userPubkey.then(uk = {
			connection.getMinimumBalanceForRentExemption(a.size).then(lamSize => 
				resolve(SystemProgram.createAccountWithSeed({
					space: a.size,
					lamports: lamSize,
					fromPubkey: uk,
					basePubkey: a.baseKey,
					seed: a.seed,
					newAccountPubkey: a.publicKey,
					programId: PROGRAM_ID_PUBKEY,
				}));
			);
		});

	});
}

const deserialize = function (a) {
        return new Promise ((resolve, reject) => {
		connection.getAccountInfo(a.publicKey).then(accountInfo => {
			resolve(borsh.deserialize(PlayNFTSchema, a.type, accountInfo.data));
		});
	});
};

/*
const getPlayNFTData = function () {
        return new Promise ((resolve, reject) => {
                playNFTDataAddress.then(pnfta => {
                        connection.getAccountInfo(pnfta.publicKey).then(accountInfo => {
                                resolve(borsh.deserialize(PlayNFTSchema, pntfa.type, accountInfo.data));
                        });
                });
        });
};
const getArtistAddress = function (artistId) {
        return new Promise ((resolve, reject) => {
                getArtistAddressAddress(artistId).then(aaa => {
                        connection.getAccountInfo(aaa.publicKey).then(accountInfo => {
                                const aaVal = borsh.deserialize(PlayNFTSchema, ArtistVal, accountInfo.data);
                                resolve(aaVal.address.toPubkey());
                        });
                });
        });
};
const getArtistProfile = function (artistKey) {
        return new Promise ((resolve, reject) => {
		getArtistProfileAddress(artistKey).then(apa => {
			connection.getAccountInfo(apa.publicKey).then(ai => {
				resolve(borsh.deserialize(PlayNFTSchema, ArtistProfile, ai.data));
			});
		});
	});
};
*/

const playnftInstruction = function (i, keys) {
	return new TransactionInstruction({
		programId: PROGRAM_ID_PUBKEY,
		data: borsh.serialize(PlayNFTSchema, new PlayNFTInstruction(i)),
		keys: keys
	});
};

const addArtist = function (artistAddress) {
        return new Promise ((resolve, reject) => {
                userPubkey.then(uk => {
                        playNFTDataAddress.then(playNFTAddress => {
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
						/*
                                                connection.getMinimumBalanceForRentExemption(ARTISTVAL_DATA_SIZE)
                                                .then(lamSize => {
                                                        const createAccountIx = SystemProgram.createAccountWithSeed({
                                                                space: ARTISTVAL_DATA_SIZE,
                                                                lamports: lamSize,
                                                                fromPubkey: uk,
                                                                basePubkey: uk,
                                                                seed: aaa.seed,
                                                                newAccountPubkey: aaa.publicKey,
                                                                programId: PROGRAM_ID_PUBKEY,
                                                        });
                                                        const instr = new PlayNFTInstruction(new AddArtist(
                                                                artistAddress));
                                                        const iData = borsh.serialize(PlayNFTSchema, instr);
                                                        const pnftIx = new TransactionInstruction({
                                                                programId: PROGRAM_ID_PUBKEY,
                                                                data: iData,
                                                                keys: [
                                                                        {pubkey: uk, isSigner: true
                                                                                , isWritable: false},
                                                                        {pubkey: playNFTAddress, isSigner: false
                                                                                , isWritable: true},
                                                                        {pubkey: aaa.publicKey, isSigner: false
                                                                                , isWritable: true},
                                                                ],


                                                        });
                                                        newTransaction().then(t => {
                                                                t.add(createAccountIx, pnftIx);
                                                                signSendConfirm(t).then(_ => resolve(aaa));
                                                        });
                                                });
						*/
                                        });
                                });
                        });
                });
        });
};

const modifyArtistProfile = function (name, description) {
        return new Promise ((resolve, reject) => {
                userPubkey.then(uk => {
			getArtistProfileAddress(uk).then(apa => {
				connection.getAccountInfo(apa.publicKey).then(accountInfo => {
					var ixs = [];
					const sendTx = function () {
						const iData = {name: name, description: description};
						const instr = new PlayNFTInstruction(new ModifyArtistProfile(iData));
						ixs.push(playnftInstruction(instr,
							[
								{pubkey: uk, isSigner: true, isWritable: false},
								{pubkey: apa.publicKey, isSigner: false
									, isWritable: true},
							],
						);
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

						/*
						connection.getMinimumBalanceForRentExemption(ARTIST_PROFILE_DATA_SIZE)
							.then(lamSize => {
							const createAccountIx = SystemProgram.createAccountWithSeed({
								space: ARTIST_PROFILE_DATA_SIZE,
								lamports: lamSize,
								fromPubkey: uk,
								basePubkey: uk,
								seed: apa.seed,
								newAccountPubkey: apa.publicKey,
								programId: PROGRAM_ID_PUBKEY,
							});
							ixs.push(createAccountIx);
						});
						*/
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
                userPubkey.then(uk => {
			getArtistProfileAddress(uk).then(apa => {
				deserialize(apa).then(ap => {
					getArtAddress(ap.numArt, uk).then(aa => {
						getFeatureAddress(0, aa.publicKey).then(faa => {
							getFeatureAddress(1, aa.publicKey).then(fab => {
								Promise.all(
									createAccount(aa),
									createAccount(faa),
									createAccount(fab),
								).then(ixs => {
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
                userPubkey.then(uk => {
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

const makeBid = function (artId, request, amount) {
        return new Promise ((resolve, reject) => {
                userPubkey.then(uk => {
                        playNFTDataAddress.then(playNFTAddress => {
				getArtAddress(artId, uk).then(aa => {
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
                userPubkey.then(uk => {
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
		const hash = new Keccak(256);
		hash.update(imageData);
		const imageHash = hash.digest('hex');

                userPubkey.then(uk => {
			signfeatureImage(featureId, imageHash).then(signResult => {
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

const getArtDisplay = function (artistAddress, artId) {
        return new Promise ((resolve, reject) => {
		getArtistProfileAddress(artistAddress).then(apa => {
			deserialize(apa).then(ap => {
				getArtAddress(artId, artistAddress).then(aa => {
					deserialize(aa).then(art => {
						const displayFeature = art.finished ? art.numFeatures - 1
							: art.numfeatures - 2;
						const imgUrl = apiHost + "/" + artistAddress + "/" + artId + "_" 
							+ displayfeature;

						getFeatureAddress(displayFeature, aa).then(fa => {
							deserialize(fa).then(feature => {
								getBidAddress(feature.numBids - 1, fa).then(ba => {
									deserialize(ba).then(bid => {
										resolve({
											artistName: ap.name,
											imgUrl: imgurl,
											timeText: feature.endTime,
											bidAmount: bid.amount,
											featureRequest: bid.request,
											artId: artId,
											featureId: displayFeature,
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

// const startFeature = function (artId, endTime) { // don't need this if we have nextFeature
// // returns {artistName, imgUrl, timeText, bidAmount, featureRequest, artId, featureId}
// const getArtDisplay = function (i) { // i is the artId

