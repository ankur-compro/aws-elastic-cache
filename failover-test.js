var redis = require("redis");
var fs = require('fs');

var options = {
  "host": "thor-user-tokens.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

console.log('Creating Redis Client');
var set_ref;

var client_get = redis.createClient(options.port, options.host);
var client_set = redis.createClient(options.port, options.host);

client_set.on("error", function (err) {
    console.log("Error set " + err);
    client_set.end(true); 
    clearTimeout(set_ref);
});

client_get.on("error", function (err) {
    console.log("Error_ get " + err);
});

client_set.on('connect', function() {
  console.log('Redis connect event set');
  set_ref = setInterval(function() { setDate()  }, 200);
});

client_get.on('connect', function() {
  console.log('Redis connect event get');
  setInterval(function() { getDate()  }, 200);
});

var counter_set = 0, counter_get=0;
function setData() {
  var val = Date.now();
  counter_set++;
  client_set.set('ka_no', val, function(err) {
    if(err) {  console.log('error while setting: ' + val + ' - ', err); }
    else { console.log('value set: ' + val); }
    console.log('counter_set: ' + counter_set)
  });
}

function getData() {
  var val = Date.now();
  counter_get++;
  client_get.set('ka_no', function(err, data) {
    if(err) { console.log('error while getting', err); }
    else { console.log('value got: ' + data); }
    console.log('counter_get: ' + counter_get)
  });
}
