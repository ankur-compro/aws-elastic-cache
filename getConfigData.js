var redis = require("redis");
var fs = require('fs');

var options = {
  "host": "thor-central-config.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var counter = 0, loopCounter = 0;

console.log('Creating Multiple Redis Clients');

var centralConfigData = {};

var client = redis.createClient(options.port, options.host);
client.on("error", function (err) {
  console.log("Error " + err);
});

client.on('connect', function() {
    counter++;
    if(counter % 10 == 0) {
      console.log('clients created : ' + counter);
    }
//      console.log('Redis connect event');
});

client.on('ready', function() {
//      console.log('Redis ready event');
});

client.on('end', function() {
  console.log('Redis end event');
});

client.keys('*',function(err, serviceKeys) {
  for(var key in serviceKeys) {
    
    centralConfigData[serviceKeys[key]] = undefined;
    client.get(serviceKeys[key], function(err, value) {
      console.log('err');
      console.log(err);
      console.log('value');
      console.log(value);
      centralConfigData[key] = value;
      console.log('centralConfigData');
      console.log(centralConfigData);
    })
  }
})
