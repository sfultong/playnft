module Main exposing (..)

import Browser
import Html exposing (Html, button, div, text, h1, input, h2, ul, li, a)
import Html.Events exposing (onClick, on)
import Html.Attributes exposing (type_, placeholder, value, class, classList)
import Json.Decode as D

type Tab
  = AdminInterface
  | ArtistInterface
  | ArtListingsInterface

-- MODEL
type alias Model =
  { currentTab : Tab
  }

-- UPDATE
type Msg = ChangeTab Tab

init : () -> ( Model, Cmd Msg )
init _ =
    ( Model ArtListingsInterface, Cmd.none )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ChangeTab tab ->
            ({ model | currentTab = tab }, Cmd.none)

view : Model -> Html Msg
view model =
    div []
        [ renderHeaders model.currentTab
        , renderTabContent model.currentTab
        ]

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
  -- messageReceiver Recv

renderHeaders : Tab -> Html Msg
renderHeaders currentTab =
    ul [ class "nav nav-tabs" ]
        [ li [ class "nav-item" ]
            [ a
                [ class "nav-link"
                , onClick (ChangeTab ArtListingsInterface)
                , classList [ ( "active", currentTab == ArtListingsInterface ) ]
                ]
                [ text "Art Listings" ]
            ]
        , li [ class "nav-item" ]
            [ a
                [ class "nav-link"
                , onClick (ChangeTab ArtistInterface)
                , classList [ ( "active", currentTab == ArtistInterface ) ]
                ]
                [ text "Artist Interface" ]
            ]
        , li [ class "nav-item" ]
            [ a
                [ class "nav-link"
                , onClick (ChangeTab AdminInterface)
                , classList [ ( "active", currentTab == AdminInterface ) ]
                ]
                [ text "Administrator Interface" ]
            ]
        ]

renderTabContent : Tab -> Html Msg
renderTabContent currentTab =
    case currentTab of
        AdminInterface ->
            div [] [ text "Content for tab1" ]

        ArtistInterface ->
            div [] [ text "Content for tab2" ]

        ArtListingsInterface ->
            div [] [ text "Content for tab3" ]

main = Browser.element
  { init = init
  , update = update
  , view = view
  , subscriptions = subscriptions
  }
