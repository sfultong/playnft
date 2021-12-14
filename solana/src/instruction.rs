use std::convert::TryInto;
use solana_program::{ program_error::ProgramError, pubkey::Pubkey};

use borsh::{BorshDeserialize, BorshSerialize};

use crate::error::PlaynftError::InvalidInstruction;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PlayNFTData {
    pub num_artists: u32,
    pub fee: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ArtistVal {
    pub address: Pubkey,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ArtistProfile {
    pub name: [u8; 64],
    pub description: [u8; 512],
    pub num_art: u16,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Feature {
    pub start_time: i64,
    pub end_time: i64,
    pub num_bids: u16,
    //pub accepted: bool, // do we need this? maybe an enum on Art would be better to indicate state
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Art {
    pub finished: bool,
    pub num_features: u16,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Bid {
    pub address: Pubkey,
    pub amount: u64, // probably unnecessary, actually...
    pub request: [u8; 128],
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum PlaynftInstruction {
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The account of the admin
    /// 1. `[writable]` playnft data
    /// 2. `[writable]` The artist address storage
    AddArtist {
        address: Pubkey,
    },

    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The artist account
    /// 1. `[writable]` artist profile data
    /// 2. `[writable]` art
    /// 3. `[writable]` first feature, which should be completed
    /// 4. `[writable]` second feature, which should be biddable
    StartArt {
        end_time: i64,
    },

    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The admin account
    /// 1. `[writable]` playnft data
    SetFee {
        new_fee: u64,
    },

    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The artist account
    /// 1. `[writable]` artist profile data
    ModifyArtistProfile {
        name: [u8; 64],
        description: [u8; 512],
    },

    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The bidder account
    /// 0. `[]` playnft data
    /// 1. `[writable]` feature
    /// 2. `[writable]` new bid
    /// 3. `[]` old bid (if not first bid)
    MakeBid {
        amount: u64,
        request: [u8; 128],
    },
    
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The artist account
    /// 1. `[writable]` art
    /// 2. `[writable]` new feature
    NextFeature {
        art_id: u16,
        end_time: i64,
    },
    
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The artist account
    /// 1. `[writable]` art
    FinishArt {
        art_id: u16,
    },

    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer, writable]` The artist account
    /// 1. `[writable]` playnft data
    /// 2. `[]` art
    /// 3. `[]` feature
    /// 4. `[]` bid
    /// 5. `[writable]` bidder
    ResolveBid {
        art_id: u16,
        feature_id: u16,
        bid_id: u16,
    },
}
