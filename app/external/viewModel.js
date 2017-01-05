
function AppViewModel() {
    
    var self = this;
    
    self.address = ko.observable('Bengaluru');
    self.query = ko.observable('Burger');
    self.input = ko.observable('Burger');
    self.arrmarker = [];
    self.lat = ko.observable(12.9716);
    self.lng = ko.observable(77.5946);
    self.locationArray = ko.observableArray();
    self.mainArray = ko.observableArray();

    self.map = null;
    var track;
    this.removePlace = function (item,data) {

        console.log(data);
        console.log(item);
        self.reset();
        var context = document.getElementById('item'+ item);
        //context.split('id');
        if(context !== undefined && context !== null) {

           context.style.color = 'black';
       }

        if(self.map !== null && self.arrmarker[data.id] !== undefined) {

            var posMark = {lat: data.lat, lng: data.lng};
            var map = self.map;
            var marker = self.arrmarker[data.id].marker;
            map.setCenter(posMark);
            map.setZoom(14);


            marker.setAnimation(google.maps.Animation.BOUNCE);
            if(track !== undefined) {
                track.setIcon();
            }

            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            track = marker;

            setTimeout(function() {
               marker.setAnimation(null)
            }, 1000);
        }
        else {
            console.log("error");
        }

    };

    this.reset = function () {
        for(var i=0;i<self.mainArray().length;i++) {
            var context = document.getElementById('item'+i);
            if(context !== undefined && context!==null) {
                context.style.color = 'rgba(121, 85, 72, 0.57)';
            }
        }
    };
    this.myFunction = function(item){

       if(this.coloritem !== undefined) {
           this.coloritem.style.color = '#818181';
       }
    
      self.query(item);
      var query = document.getElementById(item);
      query.style.color = 'black';
      this.coloritem = query;
      self.input(' ');

    };

    this.filteredMarkers = ko.computed(function () {

        self.mainArray([]);
        var filter = self.input().replace(/ /g,'').toLowerCase();
        if (!filter) {
            self.mainArray(self.locationArray());

        } else {
            clearOverlays();


            ko.utils.arrayFilter(self.locationArray(), function (item) {
               if( item.title.replace(/ /g,'').toLowerCase().indexOf(filter) !== -1) {
                   self.mainArray.push(item);
                   showOverlays(item)

               }
            });

        }

    });

    function clearOverlays() {

        if (self.arrmarker) {
            for( var i = 0, n = self.arrmarker.length; i < n; ++i ) {
                (function(i) {
                    self.arrmarker[i].marker.setVisible(false);
                    console.log(self.arrmarker[i].marker);
                })(i);
            }
        }
    }

    function showOverlays(item) {

        if(self.arrmarker[item.id] !== undefined) {
            self.arrmarker[item.id].marker.setVisible(true);
        }

    }

    this.getUrl = ko.computed(function(address){

      //var query = self.query();
      if(self.address().length > 0) {
         console.log("this url working");
         // Runs when user changes the address!!
        var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+self.address()+"&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";  //console.log(url);
        var xhttp = new XMLHttpRequest();   
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {

              var data = JSON.parse(this.responseText).results[0].geometry.location;
              self.lat (data.lat);
              self.lng (data.lng);
          }
        };

        function reqError(err) {
              console.log('Fetch Error :-S', err);
          }

          xhttp.onerror = reqError;
          xhttp.open("GET", url, true);
          xhttp.send();

        }
      else {
        alert("Please enter a valid Neighbourhood");
        self.address("Bengaluru");
      }  

      
    });

    this.ajaxCall = ko.computed(function () {
        self.locationArray([]);

       var coordinate = {
          "latitude" : self.lat(),
          "longitude" : self.lng(),
           "query": self.query()
       };
       
     if(coordinate.latitude !== undefined||'' && coordinate.longitude !== undefined||'') {
         $.ajax({
             type: "POST",
             url:"http://localhost:3000/",
             data: JSON.stringify(coordinate),
             contentType: 'application/json',
             success: function(data){

                 var locationData = JSON.parse(data);
                 document.getElementById('loader').style.display ='none';
                 document.getElementById('myDiv').style.display ='block';

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

             },
             error: function(textstatus, errorThrown) {
                 alert('text status ' + self.latitude + self.longitude + ', err ' + errorThrown);
             }
         });
     }

           
        
    });

    this.initMap= function(locationArray) {

       var ul = document.getElementById('items');
       var infoWindow = new google.maps.InfoWindow();
       clearSidenav();
       setMap(locationArray);

      function reset() {
         var k = document.getElementById("items").getElementsByTagName("li");
          for(var i=0;i<k.length;i++) {
            k[i].style.color = '#818181';
          }
      }

      function clearSidenav() {

          if(ul !== null) {
              while (ul.hasChildNodes()) {
                  ul.removeChild(ul.firstChild);
              }
          }

      }
     
      function setMap(locationArray) {

       function getMap(callback) {

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
            self.map = map;
            setMarker(map);
        });

      function setMarker(map) {

          self.arrmarker = [];
          for(var i=0;i<locationArray.length;i++) {
              (function locationArr(i) {

                  var posMark = {lat: locationArray[i].lat, lng: locationArray[i].lng};

                  function getMarker(callback) {
                      var marker = new google.maps.Marker({
                          position: posMark,
                          map: map,
                          title: locationArray[i].title

                      });

                      callback({
                          marker : marker,
                          id: i});

                      //Create Infowindows along with each marker

                  }

                  getMarker(function(mark){

                      // Pushing Markers in arrmark() array
                      self.arrmarker.push(mark);
                      addInfowindow(mark.marker);
                  });


                  function addInfowindow(marker) {

                      var loc = locationArray[i].locat === undefined  ? ''  : locationArray[i].locat ;
                      console.log(locationArray[i].contact.facebook );
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
              })(i)

          }

      }


    }

}

 }


