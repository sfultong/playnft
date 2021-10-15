port module OutsideInfo exposing (..)

port sendMessage : String -> Cmd msg
port messageReceiver : (String -> msg) -> Sub msg
