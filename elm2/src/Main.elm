module Main exposing (main)

import Date exposing (Date)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Browser.Navigation as Navigation
import Browser exposing (UrlRequest)
import Url exposing (Url)
import Url.Parser as UrlParser exposing ((</>), Parser, s, top)
import Bootstrap.Navbar as Navbar
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Card as Card
import Bootstrap.Form as Form
import Bootstrap.Card.Block as Block
import Bootstrap.Button as Button
import Bootstrap.ListGroup as Listgroup
import File exposing (File)
import File.Select as Select
import Task

type alias Flags =
  {}

type alias Model =
  { navKey : Navigation.Key
  , page : Page
  , navState : Navbar.State
  , artListings : List ArtListing
  , artistState : ArtistState
  }

type alias ArtistState =
  { loggedArtist : Maybe Artist
  , imagePreview : String -- empty string represents no image preview
  }

type Msg
  = UrlChange Url
  | ClickedLink UrlRequest
  | NavMsg Navbar.State
  | PickFile
  | GotSelectedFile File
  | GotPreview String

type alias ArtListing =
  { art : File
  , preview : String
  , title : String
  , biddingEnding : Date
  , biddingStart : Date
  , artist : Artist
  , petitions : List String
  }

type alias Artist =
  { name : String
  , wallet : String
  }

type Page
  = ArtListingsInterface
  | ArtistInterface
  | AdminInterface
  | NotFound

main : Program Flags Model Msg
main = Browser.application
  { init = init
  , view = view
  , update = update
  , subscriptions = subscriptions
  , onUrlRequest = ClickedLink
  , onUrlChange = UrlChange
  }

init : Flags -> Url -> Navigation.Key -> ( Model, Cmd Msg )
init flags url key =
  let ( navState, navCmd ) = Navbar.initialState NavMsg
      ( model, urlCmd ) = urlUpdate url
                            { navKey = key
                            , navState = navState
                            , page = ArtListingsInterface
                            , artListings = []
                            , artistState = { loggedArtist = Nothing, imagePreview = "" }
                            }
  in ( model, Cmd.batch [ urlCmd, navCmd ] )

subscriptions : Model -> Sub Msg
subscriptions model = Navbar.subscriptions model.navState NavMsg

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model = case msg of
  GotPreview url -> ( { model | artistState = { model.artistState | imagePreview = url } }
                    , Cmd.none
                    )
  GotSelectedFile file -> ( model
                          , Task.perform GotPreview <| File.toUrl file
                          )
  PickFile -> (model, Select.file ["image/*"] GotSelectedFile)
  ClickedLink req -> case req of
    Browser.Internal url ->
      ( model, Navigation.pushUrl model.navKey <| Url.toString url )
    Browser.External href ->
      ( model, Navigation.load href )
  UrlChange url -> urlUpdate url model
  NavMsg state ->
    ( { model | navState = state }
    , Cmd.none
    )

urlUpdate : Url -> Model -> ( Model, Cmd Msg )
urlUpdate url model = case decode url of
  Nothing -> ( { model | page = NotFound }, Cmd.none )
  Just route -> ( { model | page = route }, Cmd.none )

decode : Url -> Maybe Page
decode url = { url | path = Maybe.withDefault "" url.fragment, fragment = Nothing }
  |> UrlParser.parse routeParser

routeParser : Parser (Page -> a) a
routeParser = UrlParser.oneOf
  [ UrlParser.map ArtListingsInterface top
  , UrlParser.map ArtistInterface (UrlParser.s "artist")
  , UrlParser.map AdminInterface (UrlParser.s "admin")
  ]

view : Model -> Browser.Document Msg
view model =
  { title = "playNFT"
  , body =
      [ div []
          [ menu model
          , mainContent model
          ]
      ]
  }

menu : Model -> Html Msg
menu model = Navbar.config NavMsg
  |> Navbar.withAnimation
  |> Navbar.container
  |> Navbar.brand [ href "#" ] [ text "playNFT" ]
  |> Navbar.items
      [ Navbar.itemLink [ href "#artist" ] [ text "Artist Interface" ]
      , Navbar.itemLink [ href "#admin" ] [ text "Administrator Interface" ]
      ]
  |> Navbar.view model.navState

mainContent : Model -> Html Msg
mainContent model = Grid.container [] <|
  case model.page of
    ArtListingsInterface -> pageArtListingsInterface model
    ArtistInterface -> pageArtistInterface model
    AdminInterface -> pageAdminInterface model
    NotFound -> pageNotFound

pageArtListingsInterface : Model -> List (Html Msg)
pageArtListingsInterface model =
  [ h1 [] [ text "Art Listings" ]
  , Grid.row []
      [ Grid.col []
          [ Card.config [ Card.outlinePrimary ]
              |> Card.headerH4 [] [ text "Getting started" ]
              |> Card.block []
                  [ Block.text [] [ text "Getting started is real easy. Just click the start button." ]
                  , Block.custom <|
                      Button.linkButton
                          [ Button.primary, Button.attrs [ href "#getting-started" ] ]
                          [ text "Start" ]
                  ]
              |> Card.view
          ]
      ]
  ]

viewPreview : String -> Html msg
viewPreview url = div
  [ style "width" "60px"
  , style "height" "60px"
  , style "background-image" ("url('" ++ url ++ "')")
  , style "background-position" "center"
  , style "background-repeat" "no-repeat"
  , style "background-size" "contain"
  ]
  []

-- TODO
makeCardFromListing : ArtListing -> Html Msg
makeCardFromListing artListing =
  Card.config [ Card.outlinePrimary ]
    |> Card.headerH4 [] [ text artListing.title ]
    |> Card.imgTop [] []
    |> Card.block []
        [ Block.text [] [ text "Getting started is real easy. Just click the start button." ]
        , Block.custom <|
            Button.linkButton
                [ Button.primary, Button.attrs [ href "#getting-started" ] ]
                [ text "Start" ]
        ]
    |> Card.view

pageArtistInterface : Model -> List (Html Msg)
pageArtistInterface model =
  [ h2 [] [ text "Welcome, Artist!" ]
  , Form.group []
      [ Form.form []
          [ Form.label [] [ text "form label" ]
          , Button.button
              [ Button.success
              , Button.large
              , Button.block
              , Button.attrs [ onClick PickFile ]
              ]
              [ text "New Art" ]
          ]
      ]

  ]

pageAdminInterface : Model -> List (Html Msg)
pageAdminInterface model =
  [ h1 [] [ text "Administrator Interface" ]
  ]

pageNotFound : List (Html Msg)
pageNotFound =
  [ h1 [] [ text "Not found" ]
  , text "SOrry couldn't find that page"
  ]
