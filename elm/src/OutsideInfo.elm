port module OutsideInfo exposing (..)

-- import Entry exposing (Entry, encodeEntry, entryDecoder)
-- import Json.Decode exposing (decodeValue)
-- import Json.Encode


-- sendInfoOutside : InfoForOutside -> Cmd msg
-- sendInfoOutside info =
--     case info of
--         MessageGet ->
--             infoForOutside { tag = "MessageGet", data = Json.Encode.null }


-- getInfoFromOutside : (InfoForElm -> msg) -> (String -> msg) -> Sub msg
-- getInfoFromOutside tagger onError =
--     infoForElm
--         (\outsideInfo ->
--             case outsideInfo.tag of
--                 "MessageSend" ->
--                     case decodeValue Json.Decode.list outsideInfo.data of
--                         Ok ethMsg ->
--                             tagger <| MessageSend ethMsg
--                         Err e ->
--                             onError e
--                 _ ->
--                     onError <| "Unexpected info from outside: " ++ toString outsideInfo
--         )


-- type InfoForOutside
--     = MessageGet

-- type InfoForElm
--     = MessageSend String

-- type alias GenericOutsideData =
--     { tag : String, data : Json.Encode.Value }

-- port infoForOutside : GenericOutsideData -> Cmd msg
-- port infoForElm : (GenericOutsideData -> msg) -> Sub msg

-- port sendMessage : GenericOutsideData -> Cmd msg
-- port messageReceiver : (GenericOutsideData -> msg) -> Sub msg

port sendMessage : String -> Cmd msg
port messageReceiver : (String -> msg) -> Sub msg
