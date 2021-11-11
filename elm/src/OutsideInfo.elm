port module OutsideInfo exposing (..)

import Dict exposing (..)
import Json.Decode exposing (..)

port sendMessage : String -> Cmd msg
port messageReceiver : (String -> msg) -> Sub msg

port getArtDisplaySend : Int -> Cmd msg
port getArtDisplayReceiver : (Value -> msg) -> Sub msg

port addArtistSend : String -> Cmd msg
port addArtistReceiver : (Bool -> msg) -> Sub msg

port getArtistSend : String -> Cmd msg
port getArtistReceiver : (Value -> msg) -> Sub msg
port getArtistErrorReceiver : (Value -> msg) -> Sub msg
