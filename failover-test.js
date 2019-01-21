var redis = require("redis");
var fs = require('fs');

var options = {
  "host": "test-redis.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379,
  retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        // reconnect after
        return 100;
    }
};

console.log('Creating Redis Client');
var set_ref;

var client_get = redis.createClient(options);
var client_set = redis.createClient(options);

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
  set_ref = setInterval(function() { setData()  }, 200);
});

client_get.on('connect', function() {
  console.log('Redis connect event get');
  setInterval(function() { getData()  }, 200);
});

var counter_set = 0, counter_get=0;
var latSet;
function setData() {
  var val = Date.now();
  counter_set++;
  client_set.set('ka_no', val, function(err) {
    if(err) {  
      console.log('latSet: ' + latSet);
      console.log('error while setting: ' + val + ' - ', err); 
      clearTimeout(set_ref);
    }
    else { latSet = val; }
  });
}

function getData() {
  var val = Date.now();
  client_get.get('ka_no', function(err, data) {
    if(err) { console.log('error while getting', err); }
    else { console.log('val got: ' + data); }
  });
}
