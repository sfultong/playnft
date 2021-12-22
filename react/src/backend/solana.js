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
			resolve({publicKey: pntfa, seed: PLAYNFT_SEED, size: PLAYNFT_DATA_SIZE, type: PlayNFTData});
		});
	});
});
const getArtistAddressAddress = function (artistId) {
        return new Promise ((resolve, reject) => {
                adminAddress.then(aa => {
                        const seed = "artists" + artistId;
                        PublicKey.createWithSeed(aa, seed, PROGRAM_ID_PUBKEY)
                        .then(aaa => resolve({publicKey: aaa, seed: seed, size: ARTISTVAL_DATA_SIZE, type: ArtistVal}));
                });
        });
};
const getArtistProfileAddress = function (artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "profile";
		PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
			.then(apa => resolve({publicKey: apa, seed: seed, size: ARTIST_PROFILE_DATA_SIZE
				, type: ArtistProfile}));
	});
};
const getArtAddress = function (art_id, artistKey) {
        return new Promise ((resolve, reject) => {
		const seed = "art" + art_id;
		PublicKey.createWithSeed(artistKey, seed, PROGRAM_ID_PUBKEY)
		.then(aa => resolve({publicKey: aa, seed: seed, size: ART_DATA_SIZE, type: Art}));
	});
};
const getFeatureAddress = function (feature_id, artKey) {
        return new Promise ((resolve, reject) => {
		const seed = "feature" + feature_id;
		PublicKey.createWithSeed(artKey, seed, PROGRAM_ID_PUBKEY)
		.then(fa => resolve({publicKey: fa, seed: seed, size: FEATURE_DATA_SIZE, type: Feature}));
	});
};
const getBidAddress = function (bid_id, featureKey) {
        return new Promise ((resolve, reject) => {
		const seed = "bid" + bid_id;
		PublicKey.createWithSeed(featureKey, seed, PROGRAM_ID_PUBKEY)
		.then(ba => resolve({publicKey: ba, seed: seed, size: BID_DATA_SIZE, type: Bid}));
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
						createAccount(aa, aa, pntfa).then(ix => {
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

const createAccount = function (uk, bk, a) {
        return new Promise ((resolve, reject) => {
		connection.getMinimumBalanceForRentExemption(a.size).then(lamSize => 
			resolve(SystemProgram.createAccountWithSeed({
				space: a.size,
				lamports: lamSize,
				fromPubkey: uk,
				basePubkey: bk,
				seed: a.seed,
				newAccountPubkey: a.publicKey,
				programId: PROGRAM_ID_PUBKEY,
			}));
		);
	});
}

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

const addArtist = function (artistAddress) {
        return new Promise ((resolve, reject) => {
                userPubkey.then(uk => {
                        playNFTDataAddress.then(playNFTAddress => {
                                getPlayNFTData().then(pnftData => {
                                        getArtistAddressAddress(pnftData.numArtists).then(aaa => {
						newTransaction().then(t => {
							createAccount(uk, uk, aaa).then(ix => {
								const pnftIx = new TransactionInstruction({
									programId: PROGRAM_ID_PUBKEY,
									data: borsh.serialize(PlayNFTSchema, 
										new PlayNFTInstruction(new AddArtist(
											artistAddress))),
									keys: [
										{pubkey: uk, isSigner: true
											, isWritable: false},
										{pubkey: playNFTAddress.publicKey
											, isSigner: false
											, isWritable: true},
										{pubkey: aaa.publicKey, isSigner: false
											, isWritable: true},
									],

								});
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
						ixs.push(new TransactionInstruction({
							programId: PROGRAM_ID_PUBKEY,
							data: borsh.serialize(PlayNFTSchema, instr),
							keys: [
								{pubkey: uk, isSigner: true, isWritable: false},
								{pubkey: apa.publicKey, isSigner: false
									, isWritable: true},
							],
						}));
						newTransaction().then(t => {
							ixs.forEach(i => t.add(i));
							signSendConfirm(t).then(_ => resolve());
						});
					};
					if (! accountInfo) {
						createAccount(uk, uk, apa).then(ix => {
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
				getArtistProfile(ap => {
					getArtAddress(ap.numArt, uk).then(aa => {
						getFeatureAddress(0, aa.publicKey).then(faa => {
							getFeatureAddress(1, aa.publicKey).then(fab => {
								Promise.all(
									createAccount(uk, uk, aa),
									createAccount(uk, aa.publicKey, faa),
									createAccount(uk, aa.publicKey, fab),
								).then(ixs => {
									ixs.push(new TransactionInstruction({
										programId: PROGRAM_ID_PUBKEY,
										data: borsh.serialize(PlayNFTSchema,
											new PlayNFTInstruction(
												new StartArt(endTime))),
										keys: [
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
									}));
									newTransactiion().then(t => {
										ixs.forEach(i => t.add(i));
										signSendConfirm(t).then(_ => 
											resolve(aa));
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

// const startFeature = function (artId, endTime) {
// const makeBid = function (artId, request, amount) {
// const nextFeature = function (artId, endTime) {
// const finishArt = function (artId) {
// const signFeatureImage = function (featureId, imageHash) {
// const controlCompleteFeature = function (artId, featureId, completeArtwork, featureEndTime, imageData) {
// const controlStartArtWithFeature = function (featureEndTime, imageData) {
// // returns {artistName, imgUrl, timeText, bidAmount, featureRequest, artId, featureId}
// const getArtDisplay = function (i) { // i is the artId

