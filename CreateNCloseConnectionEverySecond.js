var redis = require("redis");
var fs = require('fs');

var options = {
  "host": "test-redis.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var counter = 0, loopCounter = 0, centralConfigData = {};

console.log('Creating Redis Clients Every milli Second');

var id = setInterval(function() {
  var client = redis.createClient(options.port, options.host);
  client.on("error", function (err) {
    console.log("Error " + err);
  });

  client.on('connect', function() {
    //console.log('Redis connect event');
    //counter++;
    //console.log('clients created : ' + counter);
  });

  client.on('ready', function() {
    console.log('Redis ready event');
    
    
    client.keys('*',function(err, serviceKeys) {
      for(var key in serviceKeys) {
        client.mget(serviceKeys, function(err, configValue) {
          for(var key in serviceKeys) {
            centralConfigData[serviceKeys[key]] = configValue[key];
          }
          client.quit();
        })
      }
    })
    
    
    //console.log('Quitting Connection');
    //setTimeout(function() {
     // client.quit();
      //counter--;
    //}, 120000 );
  });

  client.on('end', function() {
    //console.log('Redis end event');
  });
 }, 1);
