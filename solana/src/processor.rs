use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    msg,
    pubkey::Pubkey,
    program_pack::{Pack, IsInitialized},
    sysvar::{rent::Rent, Sysvar},
    program::{invoke, invoke_signed},
    clock::Clock,
};
use borsh::{BorshDeserialize, BorshSerialize};

use crate::instruction::{PlaynftInstruction, PlayNFTData, ArtistVal, ArtistProfile, Feature, Art, Bid};
use crate::error::PlaynftError;

pub struct Processor;
impl Processor {

    const ARTISTS: &'static [u8] = b"Artists";

    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
        let instruction = PlaynftInstruction::try_from_slice(instruction_data)?;
        msg!("instruction: {:?}", instruction);

        // make sure first account is signer
        if ! accounts[0].is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // make sure all accounts (other than the first signing account) are owned by PlayNFT
        if ! accounts[1..].iter().all(|a| a.owner == program_id) {
            return Err(ProgramError::IncorrectProgramId);
        }

        match instruction {
            PlaynftInstruction::AddArtist { address } => {
                //msg!("Instruction: AddArtist");
                Self::add_artist(accounts, program_id, &address)
            },
            PlaynftInstruction::StartArt { end_time } => {
                //msg!("Instruction: StartArt");
                Self::start_art(accounts, program_id, end_time)
            },
            PlaynftInstruction::SetFee { new_fee } => {
                Self::set_fee(accounts, program_id, new_fee)
            },
            PlaynftInstruction::ModifyArtistProfile { name, description } => {
                Self::modify_artist_profile(accounts, program_id, name, description)
            },
            PlaynftInstruction::MakeBid { amount, request } => {
                Self::make_bid(accounts, program_id, amount, request)
            },
            PlaynftInstruction::ResolveBid { art_id, feature_id, bid_id } => {
                Self::resolve_bid(accounts, program_id, art_id, feature_id, bid_id)
            },
            PlaynftInstruction::NextFeature { art_id, end_time } => {
                Self::next_feature(accounts, program_id, art_id, end_time)
            },
            PlaynftInstruction::FinishArt { art_id } => {
                Self::finish_art(accounts, program_id, art_id)
            },
            //_ => { Err(ProgramError::IncorrectProgramId) }, //TODO
        }
    }

    fn set_fee(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        new_fee: u64,
    ) -> ProgramResult {
        match accounts {
            [admin_account, playnft_account] => {
                let mut playnft_data = PlayNFTData::try_from_slice(&playnft_account.data.borrow())?;

                // validate account addresses
                let test_playnft_address = Pubkey::create_with_seed(admin_account.key, "playNFT", program_id)?;
                if &test_playnft_address != playnft_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }

                playnft_data.fee = new_fee;
                playnft_data.serialize(&mut &mut playnft_account.data.borrow_mut()[..])?;

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }
        
    fn add_artist(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        artist_address: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let admin = next_account_info(account_info_iter)?;
        let playnft_account = next_account_info(account_info_iter)?;
        let artist_storage = next_account_info(account_info_iter)?;
        let mut playnft_data = PlayNFTData::try_from_slice(&playnft_account.data.borrow())?;

        // validate account addresses
        let test_playnft_address = Pubkey::create_with_seed(admin.key, "playNFT", program_id)?;
        if &test_playnft_address != playnft_account.key {
            return Err(ProgramError::InvalidAccountData);
        }
        let artist_seed = &["artists", &playnft_data.num_artists.to_string()].join("");
        let test_artist_address = Pubkey::create_with_seed(admin.key, artist_seed, program_id)?;
        if &test_artist_address != artist_storage.key {
            return Err(ProgramError::InvalidAccountData);
        }


        playnft_data.num_artists += 1;
        playnft_data.serialize(&mut &mut playnft_account.data.borrow_mut()[..])?;

        let artist_data = ArtistVal { address: *artist_address };
        artist_data.serialize(&mut &mut artist_storage.data.borrow_mut()[..])?;
        
        //let (pda, bump_seed) = Pubkey::find_program_address(&[ARTISTS], program_id);
        Ok(())
    }

    fn modify_artist_profile(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        name: [u8; 64],
        description: [u8; 512],
    ) -> ProgramResult {
        match accounts {
            [artist_account, profile_account] => {
                let mut profile = ArtistProfile::try_from_slice(&profile_account.data.borrow())?;

                // validate account addresses
                let test_profile_address = Pubkey::create_with_seed(artist_account.key, "profile", program_id)?;
                if &test_profile_address != profile_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }

                profile.name = name;
                profile.description = description;
                profile.serialize(&mut &mut profile_account.data.borrow_mut()[..])?;

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }

    fn start_art(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        end_time: i64,
    ) -> ProgramResult {
        /*
        let account_info_iter = &mut accounts.iter();
        let artist_account = next_account_info(account_info_iter)?;
        let artist_profile_account = next_account_info(account_info_iter)?;
        let art_account = next_account_info(account_info_iter)?;
        let first_feature_account = next_account_info(account_info_iter)?;
        let second_feature_account = next_account_info(account_info_iter)?;
        */
        match accounts {
            [artist_account, artist_profile_account, art_account, feature_account_a, feature_account_b] => {
                let mut artist_profile_data = ArtistProfile::try_from_slice(&artist_profile_account.data.borrow())?;
                let mut art_data = Art::try_from_slice(&art_account.data.borrow())?;
                let mut first_feature_data = Feature::try_from_slice(&feature_account_a.data.borrow())?;
                let mut second_feature_data = Feature::try_from_slice(&feature_account_b.data.borrow())?;
                let art_id = artist_profile_data.num_art;
                
                // validate account addresses
                let test_profile_address = Pubkey::create_with_seed(artist_account.key, "profile", program_id)?;
                if &test_profile_address != artist_profile_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let art_seed = &["art", &art_id.to_string()].join("");
                let test_art_address = Pubkey::create_with_seed(artist_account.key, art_seed, program_id)?;
                if &test_art_address != art_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let feature_seed_a = &["feature", "0"].join("");
                let test_feature_a_address = Pubkey::create_with_seed(art_account.key, feature_seed_a, program_id)?;
                if &test_feature_a_address != feature_account_a.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let feature_seed_b = &["feature", "1"].join("");
                let test_feature_b_address = Pubkey::create_with_seed(art_account.key, feature_seed_b, program_id)?;
                if &test_feature_b_address != feature_account_b.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                

                let now = (Clock::get()?).unix_timestamp;
                first_feature_data.start_time = now;
                first_feature_data.end_time = now;
                first_feature_data.serialize(&mut &mut feature_account_a.data.borrow_mut()[..])?;

                second_feature_data.start_time = now;
                second_feature_data.end_time = end_time;
                second_feature_data.serialize(&mut &mut feature_account_b.data.borrow_mut()[..])?;

                art_data.num_features = 2;
                art_data.serialize(&mut &mut art_account.data.borrow_mut()[..])?;

                artist_profile_data.num_art += 1;
                artist_profile_data.serialize(&mut &mut artist_profile_account.data.borrow_mut()[..])?;

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }

    fn make_bid(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        amount: u64,
        request: [u8; 128],
    ) -> ProgramResult {
        match accounts {
            [bidder_account, playnft_account, feature_account, new_bid_account, other_accounts @ ..] => {
                let playnft_data = PlayNFTData::try_from_slice(&playnft_account.data.borrow())?;
                let mut feature_data = Feature::try_from_slice(&feature_account.data.borrow())?;
                let mut new_bid = Bid::try_from_slice(&new_bid_account.data.borrow())?;

                //TODO validate feature account?
                // validate new bid account
                let new_bid_seed = &["bid", &feature_data.num_bids.to_string()].join("");
                let test_new_bid_address = Pubkey::create_with_seed(feature_account.key, new_bid_seed, program_id)?;
                if &test_new_bid_address != new_bid_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
 
                if amount < playnft_data.fee {
                    return Err(PlaynftError::InsufficientAmount.into());
                }

                match other_accounts {
                    [old_bid_account] => {
                        let mut old_bid = Bid::try_from_slice(&old_bid_account.data.borrow())?;
                        
                        // validate account addresses
                        let old_bid_seed = &["bid", &(feature_data.num_bids - 1).to_string()].join("");
                        let test_old_bid_address = 
                            Pubkey::create_with_seed(feature_account.key, old_bid_seed, program_id)?;
                        if &test_old_bid_address != old_bid_account.key {
                            return Err(ProgramError::InvalidAccountData);
                        }

                        if amount <= old_bid.amount {
                            return Err(PlaynftError::InsufficientAmount.into());
                        }
                    },
                    _ => {
                        if feature_data.num_bids != 0 {
                            return Err(ProgramError::InvalidAccountData);
                        }
                    }
                }

                let now = (Clock::get()?).unix_timestamp;
                if now > feature_data.end_time {
                    return Err(PlaynftError::AuctionEnded.into());
                }

                **bidder_account.lamports.borrow_mut() -= amount;
                **new_bid_account.lamports.borrow_mut() += amount;

                new_bid.address = *bidder_account.key;
                new_bid.amount = amount;
                new_bid.request = request;
                new_bid.serialize(&mut &mut new_bid_account.data.borrow_mut()[..])?;

                feature_data.num_bids += 1;
                feature_data.serialize(&mut &mut feature_account.data.borrow_mut()[..])?;

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }

    /*
    fn resolve_bids(
        accounts: &[AccountInfo],
        playnft_account: &AccountInfo,
        artist_account: &AccountInfo,
        //feature_account: &AccountInfo,
        program_id: &Pubkey,
        feature_key: &Pubkey,
        num_bids: u16,
    ) -> ProgramResult {
        let pnft_data = PlayNFTData::try_from_slice(&pnft_account.data.borrow())?;
        //let mut feature_data = Feature::try_from_slice(&feature_account.data.borrow())?;

        if num_bids != accounts.size() {
            return Err(BadBidNumber.into());
        }

        // validate account addresses
        let test_adddress = |(i,a)| {
            let bid_seed = &["bid", &i.to_string()].join("");
            let addr = Pubkey::create_with_seed(feature_key, bid_seed, program_id);
            return addr == a.key;
        };
        if ! accounts.iter().enumerate().all(test_address) {
            return Err(ProgramError::InvalidAccountData);
        }

        // collect fees
        **playnft_account.lamports.borrow_mut() += pnft_data.fee * accounts.size();

        match accounts {
            [losing_accounts @ .., winning_account] => {
                // refund losers
                for a in losing_accounts {
                    **a.lamports.borrow_mut() += 
                }

            },
            [] => {
                // no one bid!
                Ok(())
            }
        }


        
    }
    */
    fn resolve_bid(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        art_id: u16,
        feature_id: u16,
        bid_id: u16,
    ) -> ProgramResult {
        match accounts {
            [artist_account, pnft_account, art_account, feature_account, bid_account, bidder_account] => {
                let pnft_data = PlayNFTData::try_from_slice(&pnft_account.data.borrow())?;
                let art_data = Art::try_from_slice(&art_account.data.borrow())?;
                let feature_data = Feature::try_from_slice(&feature_account.data.borrow())?;
                let bid_data = Bid::try_from_slice(&bid_account.data.borrow())?;

                // validate account addresses
                let art_seed = &["art", &art_id.to_string()].join("");
                let test_art_address = Pubkey::create_with_seed(artist_account.key, art_seed, program_id)?;
                if &test_art_address != art_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let feature_seed = &["feature", &feature_id.to_string()].join("");
                let test_feature_address = Pubkey::create_with_seed(art_account.key, feature_seed, program_id)?;
                if &test_feature_address != feature_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let bid_seed = &["bid", &bid_id.to_string()].join("");
                let test_new_bid_address = Pubkey::create_with_seed(feature_account.key, bid_seed, program_id)?;
                if &test_new_bid_address != bid_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                if bid_data.address != *bidder_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }

                // if this is the latest feature on unfinished art, cannot resolve bid
                if feature_id >= art_data.num_features - 1 && ! art_data.finished {
                    return Err(PlaynftError::FeatureStillRunning.into());
                }

                if bid_data.amount >= pnft_data.fee {
                    // collect fee
                    **pnft_account.lamports.borrow_mut() += pnft_data.fee;

                    **bid_account.lamports.borrow_mut() = 0;

                    // if this is the winning bid, send to artist
                    if bid_id == feature_data.num_bids - 1 {
                        **artist_account.lamports.borrow_mut() += bid_data.amount - pnft_data.fee;
                    } else { // refund
                        **bidder_account.lamports.borrow_mut() += bid_data.amount - pnft_data.fee;
                    }
                }

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }

    fn next_feature(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        art_id: u16,
        end_time: i64,
    ) -> ProgramResult {
        match accounts {
            [artist_account, art_account, feature_account] => {
                let mut art_data = Art::try_from_slice(&art_account.data.borrow())?;
                let mut new_feature_data = Feature::try_from_slice(&feature_account.data.borrow())?;

                // validate account addresses
                let art_seed = &["art", &art_id.to_string()].join("");
                let test_art_address = Pubkey::create_with_seed(artist_account.key, art_seed, program_id)?;
                if &test_art_address != art_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }
                let feature_seed = &["feature", &art_data.num_features.to_string()].join("");
                let test_feature_address = Pubkey::create_with_seed(art_account.key, feature_seed, program_id)?;
                if &test_feature_address != feature_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }

                let now = (Clock::get()?).unix_timestamp;
                new_feature_data.start_time = now;
                new_feature_data.end_time = end_time;
                new_feature_data.serialize(&mut &mut feature_account.data.borrow_mut()[..])?;

                art_data.num_features += 1;
                art_data.serialize(&mut &mut art_account.data.borrow_mut()[..])?;

                //resolve_bids(bids, program_id, feature_account_a.key, old_feature_data.num_bids)
                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }

    fn finish_art(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
        art_id: u16,
    ) -> ProgramResult {
        match accounts {
            [artist_account, art_account] => {
                let mut art_data = Art::try_from_slice(&art_account.data.borrow())?;

                // validate account addresses
                let art_seed = &["art", &art_id.to_string()].join("");
                let test_art_address = Pubkey::create_with_seed(artist_account.key, art_seed, program_id)?;
                if &test_art_address != art_account.key {
                    return Err(ProgramError::InvalidAccountData);
                }

                art_data.finished = true;
                art_data.serialize(&mut &mut art_account.data.borrow_mut()[..])?;

                Ok(())
            },
            _ => { return Err(ProgramError::InvalidAccountData); },
        }
    }
}

