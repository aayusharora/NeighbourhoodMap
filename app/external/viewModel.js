
function AppViewModel() {
    
    var self = this;
    
    self.address = ko.observable('Bengaluru');
    self.query = ko.observable('Burger');
    self.locationArray = ko.observableArray();
    this.people = [
        { name: 'Franklin', credits: 250 },
        { name: 'Mario', credits: 5800 }
    ]
    console.log(self.locationArray());
    
    this.myFunction = function(item){

       if(this.coloritem !== undefined) {
           this.coloritem.style.color = '#818181';
       }   
    
      self.query(item);
      var query = document.getElementById(item);
      query.style.color = 'black';
      this.coloritem = query;

    };

    this.getUrl = ko.computed(function(address){

      var query = self.query();
      if(self.address().length > 0) {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+self.address()+"&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";  //console.log(url);
        var xhttp = new XMLHttpRequest();   
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {

              var data = JSON.parse(this.responseText).results[0].geometry.location;   
              self.ajaxCall(data.lat, data.lng);
          }
        };

        xhttp.open("GET", url, true);
        xhttp.send();

        }
      else {
        alert("Please enter a valid Neighbourhood");
        self.address("Bengaluru");
      }  
      
      
    });

    this.ajaxCall = function (lat, lng) {
        self.locationArray([]);

       var coordinate = {
          "latitude" : lat,
          "longitude" : lng,
           "query": self.query()
       };
       

      $.ajax({
          type: "POST",
          url:"http://localhost:3000/",
          data: JSON.stringify(coordinate),
          contentType: 'application/json',
          success: function(data){

             
            var locationData = JSON.parse(data);
            //console.log(locationData.response.venues);
            var locationVenues = locationData.response.venues;
            function latlng (lat,lng,title,crossStreet,location) {
              this.lat = lat;
              this.lng =lng;
              this.title = title;
              this.crossStreet = crossStreet;
              this.location = location;
            }

              for(var i=0; i<locationVenues.length ;i++) {

               var locat = locationVenues[i].location.crossStreet !== undefined ? locationVenues[i].location.address + locationVenues[i].location.crossStreet :
                                   locationVenues[i].location.city !== undefined && locationVenues[i].location.crossStreet !== undefined ? locationVenues[i].location.address  + locationVenues[i].location.crossStreet +  locationVenues[i].location.city :
                                   locationVenues[i].location.address;

                  var myLatLng = new latlng(locationVenues[i].location.lat,
                                            locationVenues[i].location.lng,
                                            locationVenues[i].name,
                                            locationVenues[i].location.crossStreet,
                                            locat
                                            );

                  self.locationArray.push({'lat': locationVenues[i].location.lat,
                      'lng':locationVenues[i].location.lng,
                      'title':locationVenues[i].name,
                      'crossStreet':locationVenues[i].location.crossStreet,
                      'locat':locat,
                       'id': i});

              }

              document.getElementById('loader').style.display ='none';
              document.getElementById('myDiv').style.display ='block';     
              self.initMap(self.locationArray());
              
          },
          error: function(textstatus, errorThrown) {
              alert('text status ' + textstatus + ', err ' + errorThrown);
          }
      });
           
        
    };

    this.initMap= function(locationArray) {
        console.log(locationArray)

       var ul = document.getElementById('items');
       var locationInfo = locationArray;
       var infoWindow = new google.maps.InfoWindow();  
       var track;
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
          console.log(locationArray[0].lat);

        if(locationArray[0].lat !== undefined ){
            var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: locationArray[0].lat, lng: locationArray[0].lng}
           });
         }
         else {
          alert("Enter a valid search");
         }

  

      for(var i=0;i<locationArray.length;i++) {

       // console.log(locationArray[i]);
      (function locationArr(i) {
          
          var posMark = {lat: locationArray[i].lat, lng: locationArray[i].lng}
          var marker = new google.maps.Marker({
            position: posMark,
            map: map,
            title: locationArray[i].title
          });
     
          locationArray[i].location = locationArray[i].location == undefined  ? ''  : locationArray[i].location ;
          var content = "<div>" + locationArray[i].title + "</div>" + "<div>" + locationArray[i].location + "</div>";

          //li.style.color = '#818181';

          //li.addEventListener('click', pos, false);


    
        function pos() {

          reset();
          map.setCenter(posMark);
          map.setZoom(14);
          this.style.color = 'black';
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

        google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
          prev_infowindow = infowindow;
          return function() {
              infowindow.setContent(content);
              infowindow.open(map,marker);
          };
         })(marker,content,infoWindow));  

        })(i)
        
        }

    }

}
  
 }

ko.applyBindings(new AppViewModel());

