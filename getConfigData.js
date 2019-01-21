var redis = require("redis");
var fs = require('fs');

var options = {
  "host": "thor-central-config.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var testOptions = {
  "host": "test-redis.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var client = redis.createClient(options.port, options.host);

var testClient = redis.createClient(testOptions.port, testOptions.host);

client.on("error", function (err) {
  console.log("Error " + err);
});

var centralConfigData = [];

var client = redis.createClient(options.port, options.host);
client.on("error", function (err) {
  console.log("Error " + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

client.on('end', function() {
  console.log('Redis end event');
});

client.on("error", function (err) {
  console.log("Error " + err);
});

testClient.on('connect', function() {
  console.log('Redis connect event');
});

testClient.on('ready', function() {
  console.log('Redis ready event');
});

testClient.on('end', function() {
  console.log('Redis end event');
});

testClient.keys('*',function(err, serviceKeys) {
  for(var key in serviceKeys) {
    testClient.mget(serviceKeys, function(err, configValue) {
      for(var key in serviceKeys) {
        centralConfigData[serviceKeys[key]] = configValue[key];
      }
    })
  }
})



setInterval(function() {
  console.log('centralConfigData');
  console.log(centralConfigData);
  
}, 2000);
