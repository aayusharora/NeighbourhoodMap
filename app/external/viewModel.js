
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
      console.log(self.latitude);
    })

    this.ajaxCall = function (lat, lng) {
       var coordinate = {
          "latitude" : lat,
          "longitude" : lng
       }

      $.ajax({
          type: "POST",
          url:"http://localhost:3000",
          data: JSON.stringify(coordinate),
          contentType: 'application/json',
          sucess: function(){
              alert("something!");
          },
          error: function(textstatus, errorThrown) {
              alert('text status ' + textstatus + ', err ' + errorThrown);
          }
      });

    }


    /*this.makeAjaxCall = function (methodType, url ,callback) {
      var xhttp = new XMLHttpRequest();
      xhttp.open(methodType, url, true);
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            callback(xhr.response) 
        }
   
       xhttp.send();
       console.log("request sent to the server");
      };  
          
    }
*/
  
 }

ko.applyBindings(new AppViewModel());
