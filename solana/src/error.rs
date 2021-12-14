use thiserror::Error;

use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum PlaynftError {
    #[error("Invalid Instruction")]
    InvalidInstruction,
    #[error("Insufficient Amount")]
    InsufficientAmount,
    #[error("Auction Ended")]
    AuctionEnded,
    #[error("Wrong Number of Bids")]
    BadBidNumber,
    #[error("Can't settle bids for auction still running")]
    FeatureStillRunning,
}

impl From<PlaynftError> for ProgramError {
    fn from(e: PlaynftError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
