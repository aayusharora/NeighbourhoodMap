var express = require('express');
var app = express();     // define our app using express
var request = require('request');

var bodyParser = require('body-parser');
var port = process.env.PORT || 3000; 
app.use(bodyParser.json());                        

    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('app'));

//app.use(express.bodyParser());

app.listen(port);

app.post('/', function(req,res) {
  
    coordinates(req.body.latitude, req.body.longitude, req.body.query, function(data) {
       res.send(data);
    });
   

});

function coordinates(lat, lng, query, callback) {
  
  var CLIENT_ID = "4KRLZJS2EXSKBHNSGXGHJIPQQG3LAFRTFZ22XBQ2XTXCUJMS";
  var CLIENT_SECRET = "BVD4TUFEPUY4IX021WFIIWCZTN3UY0RQWMKTSA3CP5IFHZCK"; 
  var url = "https://api.foursquare.com/v2/venues/search?client_id="+ CLIENT_ID +
   "&client_secret="+ CLIENT_SECRET +
    "&v=20130815&ll="+lat+","+lng+"&query="+query ;

  console.log(url);

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

     
        callback(response.body);
     

  })

}
app.listen();
console.log('Express server started on port %s', port);