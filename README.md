# Watround

## About
#### 'Watround' is derived from "What" and "surrounding". It help you to search any thing related to travel, type of food, coffee shops, beer shops, ATM, Hospitals, Banks, Malls, Parks etc at any place of the World.

## Working
#### The change neighbourhood search box allows to add the place you want to explore. The hamburger icon on left allow you to search your items. By Clicking on any searched item in the list , you can find more information by clicking the infowindow of marker on map.  

## How to run ?
- `git clone https://github.com/aayusharora/Watround.git`
-  Generate your clientid and clientsecret for Foursquare policies.
-  Update your clientid and clientsecret information in `request.js` under the variables ` 
   var CLIENT_ID = "//update here";
   var CLIENT_SECRET = "//update here"; 
   by using [Foursquare API]("https://developer.foursquare.com/docs/")
-  Run `npm install` in the respective directory.
-  Run `node request.js` to run the server on `http://localhost:3000`.

## Technology used

- Backend : NodeJS and ExpressJS 
- Frontend : HTML5, CSS3, KnockoutJS, jQuery
- API : FourSquare API and Google Maps API

## Structure

The client made a call of location which is geocoded using Google MAP Geocoding API and passed to the local server, the server made the request to the FourSquare API with geolocation parameters which provides data back to the local server and after filtering data is provided back to Google Map API to place markers on client side. 
