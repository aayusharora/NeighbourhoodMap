
function AppViewModel() {
    var self = this;
    
    self.address = ko.observable('Delhi');
   
    this.getUrl = ko.computed(function(address) {

      var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+self.address()+"&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";  console.log(url);
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          
             var data = JSON.parse(this.responseText).results[0].geometry.location;
              
            self.ajaxCall(data.lat, data.lng);
             //self.sendData(latitude,longitude);
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send(self.latitude);
      
    })

    this.ajaxCall = function (lat, lng) {
      var locationArray = []; 

       var coordinate = {
          "latitude" : lat,
          "longitude" : lng
       }
       

      $.ajax({
          type: "POST",
          url:"http://localhost:3000",
          data: JSON.stringify(coordinate),
          contentType: 'application/json',
          success: function(data){
              
              var locationData = JSON.parse(data);
              console.log(locationData.response.venues);
              var locationVenues = locationData.response.venues;
              function latlng () {
                this.lat = null,
                this.lng = null
                this.title = null
              };

              for(var i=0; i<locationVenues.length ;i++) {
                var myLatLng = new latlng();
                myLatLng.lat =  locationVenues[i].location.lat;
                myLatLng.lng =  locationVenues[i].location.lng;
                myLatLng.title = locationVenues[i].name;
                myLatLng.crossStreet = locationVenues[i].location.crossStreet;
                myLatLng.location = locationVenues[i].location.crossStreet !== undefined ? locationVenues[i].location.address + '</br>' + locationVenues[i].location.crossStreet : 
                                    locationVenues[i].location.city !== undefined && locationVenues[i].location.crossStreet !== undefined ? locationVenues[i].location.address + '</br>' + locationVenues[i].location.crossStreet + '</br>'+ locationVenues[i].location.city :
                                     locationVenues[i].location.address;      

                locationArray.push(myLatLng);
              }
               
              self.initMap(locationArray);   
          },
          error: function(textstatus, errorThrown) {
              alert('text status ' + textstatus + ', err ' + errorThrown);
          }
      });
           
        
    }

    this.initMap= function(locationArray) {
       
       var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: {lat: locationArray[0].lat, lng: locationArray[0].lng}
          });
      
      for(var i=0;i<locationArray.length;i++) {
        
        console.log(locationArray[i]);

        (function locationArr(i) {
          var infoWindow = new google.maps.InfoWindow();
          var marker = new google.maps.Marker({
            position: {lat: locationArray[i].lat, lng: locationArray[i].lng},
            map: map,
            title: locationArray[i].title
          });
        
        locationArray[i].location = locationArray[i].location == undefined  ? ''  : locationArray[i].location ;
        var content = "<div>" + locationArray[i].title + "</div>" + "<div>" + locationArray[i].location + "</div>";
        google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
          return function() {
              infowindow.setContent(content);
              infowindow.open(map,marker);
          };
         })(marker,content,infoWindow));  

        })(i)
        
        }
    
    }


  
 }

ko.applyBindings(new AppViewModel());

