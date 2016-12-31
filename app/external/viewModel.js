
function AppViewModel() {
    var self = this;
    
    self.address = ko.observable('Bengaluru');
    self.query = ko.observable('Burger');
    
    this.myFunction = function(item){
       if(this.coloritem !== undefined) {
           console.log(this.coloritem);
           this.coloritem.style.color = '#818181';
       }   
    
      self.query(item);
      var query = document.getElementById(item);
      query.style.color = 'black';
      this.coloritem = query;

    }

    this.getUrl = ko.computed(function(address){

      var query = self.query();
      if(self.address().length > 0) {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+self.address()+"&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";  //console.log(url);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {

               var data = JSON.parse(this.responseText).results[0].geometry.location;
                
              self.ajaxCall(data.lat, data.lng);
               //self.sendData(latitude,longitude);
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
       
       var locationArray = []; 
       var coordinate = {
          "latitude" : lat,
          "longitude" : lng,
           "query": self.query()
       };
       

      $.ajax({
          type: "POST",
          url:"https://hidden-chamber-82669.herokuapp.com/",
          data: JSON.stringify(coordinate),
          contentType: 'application/json',
          success: function(data){

               
              var locationData = JSON.parse(data);
              //console.log(locationData.response.venues);
              var locationVenues = locationData.response.venues;
              function latlng () {
                this.lat = null;
                this.lng = null;
                this.title = null;
              }

              for(var i=0; i<locationVenues.length ;i++) {
                console.log(locationVenues[i]);
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
                 document.getElementById('loader').style.display ='none';
               document.getElementById('myDiv').style.display ='block'; 
          },
          error: function(textstatus, errorThrown) {
              alert('text status ' + textstatus + ', err ' + errorThrown);
          }
      });
           
        
    };

    this.initMap= function(locationArray) {
       var ul = document.getElementById('items');
       if(locationArray[0].lat !== undefined ){
           var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: locationArray[0].lat, lng: locationArray[0].lng}
          });
       }
       else {
        alert("Enter a valid search");
       }

        var infoWindow = new google.maps.InfoWindow();

        while (ul.hasChildNodes()) {   
           ul.removeChild(ul.firstChild);
        }

      function reset() {
         var k = document.getElementById("items").getElementsByTagName("li");
  
          for(var i=0;i<k.length;i++) {
            k[i].style.color = '#818181';
          
          }
      }
       var track;

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
        var li = document.createElement("li");
        li.style.color = '#818181';
        li.addEventListener('click', pos, false);

        var loc= locationArray[i].location.replace('</br>'," ");
        var content = loc.length > 0 ? locationArray[i].title +","+ loc : locationArray[i].title;
        li.appendChild(document.createTextNode(content));
        ul.appendChild(li);
       
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

          //console.log(infowindow);
          //var prev_infowindow =false;
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

ko.applyBindings(new AppViewModel());

