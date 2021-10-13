module Main exposing (main)

import Date exposing (Date, day, month, weekday, year)
import DatePicker exposing (DateEvent(..), defaultSettings)
import Time exposing (Weekday(..))
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Browser.Navigation as Navigation
import Browser exposing (UrlRequest)
import Url exposing (Url)
import Url.Parser as UrlParser exposing ((</>), Parser, s, top)
import Bootstrap.Alert as Alert
import Bootstrap.Navbar as Navbar
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Grid.Row as Row
import Bootstrap.Card as Card
import Bootstrap.Form as Form
import Bootstrap.Card.Block as Block
import Bootstrap.Button as Button
import Bootstrap.ListGroup as Listgroup
import Bootstrap.Tab as Tab
import Bootstrap.Text as Text
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
  , today : Maybe Date
  , tabState : Tab.State
  }

type alias ArtistState =
  { loggedArtist : Maybe Artist
  , artFile : Maybe File
  , imagePreview : String -- empty string represents no image preview
  , selectedAuctionEndDate : Maybe Date
  , datePicker : DatePicker.DatePicker
  , newListingErrorVisibility : Alert.Visibility
  , title : String
  }

type Msg
  = UrlChange Url
  | ClickedLink UrlRequest
  | NavMsg Navbar.State
  | PickFile
  | GotSelectedFile File
  | GotPreview String
  | ToDatePicker DatePicker.Msg
  | PrepareListing Alert.Visibility
  | NewListing ArtListing
  | SetTitle String
  | SetArtist String
  | ReceiveDate Date
  | TabMsg Tab.State

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
  -- , wallet : String
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
  let ( datePicker, datePickerFx ) = DatePicker.init
      ( navState, navCmd ) = Navbar.initialState NavMsg
      ( model, urlCmd ) = urlUpdate url
                            { navKey = key
                            , navState = navState
                            , page = ArtListingsInterface
                            , artListings = []
                            , today = Nothing
                            , tabState = Tab.initialState
                            , artistState = { loggedArtist = Nothing
                                            , artFile = Nothing
                                            , imagePreview = ""
                                            , selectedAuctionEndDate = Nothing
                                            , datePicker = datePicker
                                            , newListingErrorVisibility = Alert.closed
                                            , title = ""
                                            }
                            }
  in ( model
     , Cmd.batch
         [ Date.today |> Task.perform ReceiveDate
         , urlCmd
         , navCmd
         , Cmd.map ToDatePicker datePickerFx ]
     )

subscriptions : Model -> Sub Msg
subscriptions model = Sub.batch [ Navbar.subscriptions model.navState NavMsg
                                , Tab.subscriptions model.tabState TabMsg
                                , Alert.subscriptions model.artistState.newListingErrorVisibility PrepareListing
                                ]

setImagePreview : String -> ArtistState -> ArtistState
setImagePreview url sart = { sart | imagePreview = url }

setArtistState : Model -> ArtistState -> Model
setArtistState model sart = { model | artistState = sart }

setDatePicker : ArtistState -> DatePicker.DatePicker -> ArtistState
setDatePicker sart dp = { sart | datePicker = dp }

setDate : ArtistState -> Maybe Date -> ArtistState
setDate sart date = { sart | selectedAuctionEndDate = date }

setPrepareListingErrorVisibility : ArtistState -> Alert.Visibility -> ArtistState
setPrepareListingErrorVisibility sart av = { sart | newListingErrorVisibility = av }

setTitle : ArtistState -> String -> ArtistState
setTitle sart str = { sart | title = str }

setArtist : ArtistState -> String -> ArtistState
setArtist sart str = if str == ""
                       then { sart | loggedArtist = Nothing }
                       else { sart | loggedArtist = Just { name = str } }

setArtFile : ArtistState -> File -> ArtistState
setArtFile sart file = { sart | artFile = Just file }

-- TODO: something cleaner
fromJust : Maybe a -> a
fromJust mx = case mx of
  (Just x) -> x
  Nothing -> Debug.todo "error: fromJust Nothing"

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model = case msg of
  TabMsg state ->
    ( { model | tabState = state }
    , Cmd.none
    )
  NewListing l -> ( { model | artListings = model.artListings ++ [l] }, Cmd.none )
  ReceiveDate date -> ( { model | today = Just date }, Cmd.none)
  SetArtist str -> ( setArtistState model <| setArtist model.artistState str, Cmd.none )
  SetTitle str -> ( setArtistState model <| setTitle model.artistState str, Cmd.none )
  PrepareListing av -> if model.artistState.imagePreview == ""
                       || model.artistState.artFile == Nothing
                       || model.artistState.title == ""
                       || model.artistState.selectedAuctionEndDate == Nothing
                       || model.artistState.loggedArtist == Nothing
                       || model.today == Nothing
                       then ( setArtistState model <| setPrepareListingErrorVisibility model.artistState Alert.shown
                            , Cmd.none
                            )
                       else ( setArtistState model <| setPrepareListingErrorVisibility model.artistState av
                            , Task.perform NewListing <| Task.succeed
                                { art = fromJust model.artistState.artFile
                                , preview = model.artistState.imagePreview
                                , title = model.artistState.title
                                , biddingEnding = fromJust model.artistState.selectedAuctionEndDate
                                , biddingStart = fromJust model.today
                                , artist = fromJust model.artistState.loggedArtist
                                , petitions = []
                                }
                            )
  ToDatePicker subMsg ->
    let ( newDatePicker, event ) = DatePicker.update settings subMsg model.artistState.datePicker
    in ( case event of
           Picked date -> setArtistState model <| setDatePicker (setDate model.artistState <| Just date) newDatePicker
           _ -> setArtistState model <| setDatePicker model.artistState newDatePicker
       , Cmd.none
       )
  GotPreview url -> ( setArtistState model <| setImagePreview url model.artistState -- { model | artistState = { model.artistState | imagePreview = url } }
                    , Cmd.none
                    )
  GotSelectedFile file -> ( setArtistState model <| setArtFile model.artistState file
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

settings : DatePicker.Settings
settings =
  { defaultSettings
      | isDisabled = \x -> False
      , inputClassList = [ ( "form-control", True ) ]
      , inputName = Just "date"
      , inputId = Just "date-field"
  }

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
view model = let _ = Debug.log "model!!!!!!!!!!!!!!!!!!!!!!!!!!!!1" model in
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
  -- |> Navbar.attrs [ class "navbar navbar-expand-lg navbar-dark navbar-custom fixed-top" ]
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
  [ Grid.row []
      [ Grid.col [ Col.textAlign Text.alignXsCenter ]
          [ br [] []
          , h1 [] [ text "Art Listings" ]
          , br [] []
          ]
      ]
  , Grid.row []
      [ Grid.col [] <| List.map makeCardFromListing model.artListings
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

makeCardFromListing : ArtListing -> Html Msg
makeCardFromListing artListing =
  Card.config [ Card.outlinePrimary ]
    |> Card.headerH4 [] [ text artListing.title ]
    |> Card.imgTop [] [ viewPreview artListing.preview ]
    |> Card.block []
        [ Block.text [] [ text <| "Artist: " ++ artListing.artist.name ]
        , Block.text [] [ text <| "Bidding ending at" ++ Date.toIsoString artListing.biddingEnding ]
        ]
    |> Card.view

pageArtistInterface : Model -> List (Html Msg)
pageArtistInterface model =
  [ Grid.row []
      [ Grid.col [ Col.textAlign Text.alignXsCenter ]
          [ br [] []
          , h1 [] [ text "Artist Interface" ]
          , br [] []
          ]
      ]
  , Grid.row []
      [ Grid.col []
          [ Tab.config TabMsg
              |> Tab.withAnimation
              -- |> Tab.fill
              |> Tab.items
                   [ Tab.item
                       { id = "artistListingsTab"
                       , link = Tab.link [] [ text "My Listings" ]
                       , pane = Tab.pane [] <| artistListingsTab model
                       }
                   , Tab.item
                       { id = "newArtListingTab"
                       , link = Tab.link [] [ text "New Art Listing" ]
                       , pane = Tab.pane [] <| artistNewArtListingTab model
                       }
                   , Tab.item
                       { id = "artistProfileTab"
                       , link = Tab.link [] [ text "Profile" ]
                       , pane = Tab.pane [] <| artistProfileTab model
                       }
                   ]
              |> Tab.view model.tabState
          ]
      ]
  ]

artistListingsTab : Model -> List (Html Msg)
artistListingsTab model =
  [ text "Artist's listings from function"
  ]

artistProfileTab : Model -> List (Html Msg)
artistProfileTab model =
  [ h2 [] [ text <| case model.artistState.loggedArtist of
                      Just artist -> "Welcome, " ++ artist.name ++ "!"
                      Nothing -> "Hello, stranger! Specify your artist name to log in."
          ]
  , input [ placeholder "Artist's name", onInput SetArtist ] []
  ]

artistNewArtListingTab : Model -> List (Html Msg)
artistNewArtListingTab model =
  [ h2 [] [ text model.artistState.title ]
  , input [ placeholder "your art's tile", onInput SetTitle ] []
  , viewPreview model.artistState.imagePreview
  , Button.button
      [ Button.secondary
      , Button.large
      , Button.block
      , Button.attrs [ onClick PickFile ]
      ]
      [ text "Select File" ]
  , label [] [ text "Pick a date:" ]
  , DatePicker.view model.artistState.selectedAuctionEndDate settings model.artistState.datePicker
      |> Html.map ToDatePicker
  , Button.button
      [ Button.primary
      , Button.large
      , Button.block
      , Button.attrs [ onClick <| PrepareListing Alert.closed ]
      ]
      [ text "New Art Listing" ]
  , Alert.config
      -- |> Alert.dismissable PrepareListing
      |> Alert.warning
      |> Alert.children
          [ Alert.h4 [] [ text "Not a complete art listing" ]
          , text "You must select a file and an auction date end."
          ]
      |> Alert.view model.artistState.newListingErrorVisibility
  ]

pageAdminInterface : Model -> List (Html Msg)
pageAdminInterface model =
  [ Grid.row []
      [ Grid.col [ Col.textAlign Text.alignXsCenter ]
          [ br [] []
          , h1 [] [ text "Administrator Interface" ]
          , br [] []
          ]
      ]
  , Grid.row []
      [ Grid.col [ Col.md2 ] [ h4 [] [ text "Artist adress:" ] ]
      , Grid.col [] [ input [ placeholder "your art's tile"
                            , size 30
                            , style "margin" "10px"
                            ]
                        []
                    , Button.button [] [ text "Submit" ]
                    ]
      ]
  ]

pageNotFound : List (Html Msg)
pageNotFound =
  [ h1 [] [ text "Not found" ]
  , text "SOrry couldn't find that page"
  ]
