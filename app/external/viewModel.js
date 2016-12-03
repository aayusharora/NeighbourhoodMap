
function AppViewModel() {
    var self = this;
    self.address = ko.observable('Delhi');
    self.latitude = '';
    
    this.getUrl = ko.computed(function(address) {

      var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+self.address()+"&key=AIzaSyAlQWLkSPjKEvBBbMkVZjBtIminATljqis";  console.log(url);
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          
             var data = JSON.parse(this.responseText).results[0].geometry.location;
             self.latitude = data.lat;
             //self.sendData(latitude,longitude);
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send(self.latitude);
      console.log(self.latitude);
    })

   
 }

ko.applyBindings(new AppViewModel());
