var express = require('express')
var app = express()     // define our app using express
var request = require('request');

var port = process.env.PORT || 3000; 

app.use(express.static('app'));

app.listen(port);

app.get('/map', function(req, res, next) {

  var username = req.query.name;
  console.log(username);
  var CLIENT_ID = "4KRLZJS2EXSKBHNSGXGHJIPQQG3LAFRTFZ22XBQ2XTXCUJMS";
  var CLIENT_SECRET = "BVD4TUFEPUY4IX021WFIIWCZTN3UY0RQWMKTSA3CP5IFHZCK"; 
  var url = "https://api.foursquare.com/v2/venues/search?client_id="+ CLIENT_ID +
   "&client_secret="+ CLIENT_SECRET +
    "&v=20130815&ll=28.881338,77.34845780000001&query=sushi";


  request(url, function (error, response, body) {
      //Check for error
      //console.log(url);
      
      if(error){
          return console.log('Error:', error);
      }

      //Check for right status code
      if(response.statusCode !== 200){
          return console.log('Invalid Status Code Returned:', response.statusCode);
      }

      //All is good. Print the body
      res.send(body); // Show the HTML for the Modulus homepage.

  })

});

app.listen();
console.log('Express server started on port %s', port);