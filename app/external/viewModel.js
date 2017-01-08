
function AppViewModel() {
    
    var self = this;
    
    self.address = ko.observable('Bengaluru');
    self.query = ko.observable('Burger');
    self.input = ko.observable('Burger');
    self.arrmarker = [];
    self.locationArray = ko.observableArray();
    self.mainArray = ko.observableArray();
    self.index= ko.observable();
    self.loader=ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.isSet = ko.observable(false);
    self.category = ko.observable();
    self.map = null;
    self.data=ko.observable(true);

    var track;

    // ********************************************************************************************//

    // Call to find lat and lng from place name using Geo-coding API Google
    // Called whenever neighbourhood place is changed or self.address() is changed

    this.getUrl = ko.computed(function(address){

        if(self.address().length > 0) {
            // Runs when user changes the address!!
            var endpoint = self.address();
            var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + endpoint +
                "&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";

            fetch(url).then(function(res) {
                // res instanceof Response == true.
                if (res.ok) {
                    res.json().then(function(res) {
                        var data = res.results[0].geometry.location;
                        self.lat (parseFloat(data.lat)); // setting geo-coordinates of chosen neighbourhood
                        self.lng (parseFloat(data.lng));
                        self.isSet(true);
                    });
                } else {
                    alert("Looks like the response wasn't perfect, got status", res.status);
                }

            }).catch(function(err) {
                alert("Fetch failed! ! Error" + err);
            });
        }

    });


    // ********************************************************************************************//

    // Check which location is clicked in List view , when li is clicked

    this.clickedPlace = function (item,data) {
        var map = self.map; // Get the map
        self.index(item) ; // set the id of li item clicked globally && this will help ind() function
        var posMark = {lat: data.lat, lng: data.lng};
        map.setCenter(posMark);
        google.maps.event.trigger(self.arrmarker[item].marker,"click");

    };


    // ********************************************************************************************//

    // POST request to own server with lat, lng and query
    // Server made the final request to FourSquare API and provide back the data.


    // ********************************************************************************************//

    this.initMap= function(locationArray) {

        // Setting InfoWindow
        var infoWindow = new google.maps.InfoWindow();
       // Setting map
        setMap(locationArray);

        // ********************************************************************************************//

        function setMap(locationArray) {
            //console.log("callback getmap called");
            function getMap(callback) {
                console.log("callback getmap called");
                if(locationArray[0].lat !== undefined ){
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 13,
                        center: {lat: locationArray[0].lat, lng: locationArray[0].lng}
                    });
                }
                else {
                    alert("Enter a valid search");
                }
                callback(map);

            }

            // Trying show filtered maps
            getMap(function(map) {
                self.map = map; // setting map globally to viewmodel
                setMarker(map); // calling to setMarkers on map
                console.log("callback called");
            });

            // ********************************************************************************************//

            function setMarker(map) {

                self.arrmarker = [];
                for(var i=0;i<locationArray.length;i++) {
                   // console.log(i + "called outside");
                    // ******* Passing i in Closure as markers are asynchronous ******** //
                    (function locationArr(i) {

                        var posMark = {lat: locationArray[i].lat, lng: locationArray[i].lng};
                         //console.log(i + "called");
                        //console.log("length is :"+ locationArray.length);
                        // ********************************************************************************************//
                        function getMarker(callback) {
                            var marker = new google.maps.Marker({
                                position: posMark,
                                map: map,
                                title: locationArray[i].title

                            });

                            callback({
                                marker : marker,
                                id: i});

                        }

                        // ********************************************************************************************//

                        getMarker(function(mark){

                            // Pushing Markers in arrmark() array
                            self.arrmarker.push(mark);   // Maintaining Array of markers
                            addInfowindow(mark.marker);  //Create Infowindows along with each marker object

                        });

                        // ********************************************************************************************//

                        function addInfowindow(marker) {

                            // Setting InfoWindow Content
                            var loc = locationArray[i].locat === undefined  ? ''  : locationArray[i].locat ;
                            var fb = locationArray[i].contact.facebook !== undefined ? locationArray[i].contact.facebook : "No data" ;
                            var twitter = locationArray[i].contact.twitter !== undefined ? locationArray[i].contact.twitter: "No data";
                            var phone = locationArray[i].contact.phone !== undefined ? locationArray[i].contact.phone : "No data";
                            var content = "<div>" + locationArray[i].title + "</div> " +
                                "<div>" + loc + "</div>"+  "</br>" +
                                "<div>" + "Facebook : " + fb + "</div>"  +
                                "<div>" + "Twitter : " + twitter + "</div>" +
                                "<div>" + "Phone : " + phone + "</div>"  ;

                            google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
                                prev_infowindow = infowindow;

                                return function() {
                                    infowindow.setContent(content);
                                    infowindow.open(map,marker);
                                    marker.setAnimation(google.maps.Animation.BOUNCE);
                                    setTimeout(function() {
                                        marker.setAnimation(null)
                                    }, 1000);
                                };
                            })(marker,content,infoWindow));

                        }

                        // ********************************************************************************************//

                    })(i);

                    // ********************************************************************************************//

                }

            }


        }

    };

    // ********************************************************************************************//

    // ********************************************************************************************//

    // POST request to own server with lat, lng and query
    // Server made the final request to FourSquare API and provide back the data.

    this.ajaxCall = ko.computed(function () {
        self.isSet();
      if(self.isSet() == true ) {
          var coordinate = {
              "latitude" : parseFloat(self.lat()).toFixed(4),
              "longitude" :  parseFloat(self.lng()).toFixed(4),
              "query": self.query()
          };

          if(coordinate.latitude !== undefined||'' && coordinate.longitude !== undefined||'') {
              $.ajax({
                  type: "POST",
                  url:"http://localhost:3000/", // will be updated in production mode
                  data: JSON.stringify(coordinate),
                  contentType: 'application/json',
                  success: function(data){

                      var locationData = JSON.parse(data);
                      var locationVenues = locationData.response.venues;

                      for(var i=0; i<locationVenues.length ;i++) {

                          var locat = locationVenues[i].location.crossStreet !== undefined && locationVenues[i].location.address !== undefined ?
                          locationVenues[i].location.address + " "+ locationVenues[i].location.crossStreet :
                              locationVenues[i].location.city !== undefined && locationVenues[i].location.crossStreet !== undefined &&  locationVenues[i].location.address ?
                              locationVenues[i].location.address  + " " +locationVenues[i].location.crossStreet + " " + locationVenues[i].location.city :
                                  locationVenues[i].location.address !== undefined ? locationVenues[i].location.address  : '' ;

                          var contact = {
                              facebook: locationVenues[i].contact.facebookName,
                              twitter: locationVenues[i].contact.twitter,
                              phone: locationVenues[i].contact.phone
                          };


                          self.locationArray.push({'lat': locationVenues[i].location.lat,
                              'lng':locationVenues[i].location.lng,
                              'title':locationVenues[i].name + locat,
                              'crossStreet':locationVenues[i].location.crossStreet,
                              'locat':locat,
                              'id': i,
                              'contact': contact
                          });

                      }

                      self.initMap(self.locationArray());
                      self.data(false);
                  },
                  error: function(textstatus, errorThrown) {
                      alert('App Crashed: Please check your Internet');
                  }
              });
              console.log("init getmap called");

          }



      }

    });

    // Check index clicked and change the style color to black by returning true

    this.ind = function(item){
       return item===self.index(); // return true for item clicked
    };

    // ********************************************************************************************//

   // To set the user's query like coffee , beer etc. Set the query observable to clicked item
    this.myFunction = function(item){

        self.index(item.toLowerCase()); // Setting index to update style for ind() function
        self.input(' ');  // Making search box blank to reset filter
        self.query(item); // Setting query
        self.locationArray([]);
        self.mainArray([]);

    };

    // ********************************************************************************************//

    // Function to filter Array
    this.filteredMarkers = ko.computed(function () {

        self.mainArray([]);
        var filter = self.input().replace(/ /g,'').toLowerCase();
        if (!filter) {
            self.mainArray(self.locationArray());

        } else {

            //Filter items according to search text and hide markers for non-existing items
            ko.utils.arrayFilter(self.locationArray(), function (item) {
               if( item.title.replace(/ /g,'').toLowerCase().indexOf(filter) !== -1) {
                   self.mainArray.push(item);
                   if(self.arrmarker[item.id] !== undefined) {
                       self.arrmarker[item.id].marker.setVisible(true);
                   }

               }
               else{
                   if(self.arrmarker[item.id] !== undefined) {
                       self.arrmarker[item.id].marker.setVisible(false);
                   }
               }
            });

        }

    });




 }


