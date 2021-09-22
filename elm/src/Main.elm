module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, h1, input, h2)
import Html.Events exposing (onClick, on)
import Html.Attributes exposing (type_, placeholder, value)
import OutsideInfo exposing (..)
import Json.Decode as D

-- MAIN
main =
  Browser.element { init = init
                  , update = update
                  , view = view
                  , subscriptions = subscriptions
                  }

-- MODEL
-- type alias Model = Int
type alias Model =
    { input : String
    , message : String
    }

init : () -> ( Model, Cmd Msg )
init _ =
    ( Model "initial input" "initial message", Cmd.none )

-- UPDATE
type Msg
  = Send
  | Recv String

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Send -> (model, sendMessage model.input)
    Recv incoming ->
            ({ model | message = incoming }, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ =
  messageReceiver Recv

-- VIEW
view : Model -> Html Msg
view model =
  div []
    [ h1 [] [ text "¡Hola, mundo!"]
    , h2 [] [ text model.message ]
    , input
        [ type_ "text"
        , placeholder "my place holder"
        , on "keydown" (ifIsEnter Send)
        , value model.input
        ]
        []
    , button [ onClick Send ] [ text "Send" ]
    ]

ifIsEnter : msg -> D.Decoder msg
ifIsEnter msg =
  D.field "key" D.string
    |> D.andThen (\key -> if key == "Enter" then D.succeed msg else D.fail "some other key")
