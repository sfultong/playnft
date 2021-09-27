module Main where

import Prelude

import Effect (Effect)
import Effect.Console (log)

import App.CountForm (CountFormProps, countFormClass)
import App.MaterialUI (muiThemeProviderClass)
import Control.Monad.Eff (Eff)
import Control.Monad.Except (runExcept)
import DOM (DOM)
import DOM.HTML (window)
import DOM.HTML.Types (htmlDocumentToDocument)
import DOM.HTML.Window (document)
import DOM.Node.NonElementParentNode (getElementById)
import DOM.Node.Types (Element, ElementId(..), documentToNonElementParentNode)
import Data.Either (hush)
import Data.Foldable (for_)
import Data.Foreign (Foreign, readString)
import Data.Maybe (Maybe(..))
import Network.Ethereum.Web3 (Address, mkAddress, mkHexString)
import Partial.Unsafe (unsafeCrashWith)
import React as R
import ReactDOM (render)
import Network.Ethereum.Uport (UPORT)
import Control.Monad.Eff.Exception (EXCEPTION)

main :: Effect Unit
main = do
  log "🍝"
