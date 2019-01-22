var redis = require("redis");
var timeout = 1; // = 1 sec, (in miliseconds)
var counter = 0;

var options = {
    'host': 'test-redis.dwnzoe.ng.0001.usw2.cache.amazonaws.com',
    'port': 6379
};

var client = redis.createClient(options.port, options.host);

client.on('connect', function () {
    console.log('Redis client connected');
});

client.on('ready', function () {
    console.log('Redis client ready');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

var redisKey = 's:PrimaryNodeTesting:22Jan:1';



console.log('GETting key - ' + redisKey);
var intervalId = setInterval(function() {
    counter++;
    var timestamp = Date.now();
    client.get(redisKey, function (error, result) {
        if (error) {
          console.log("ERROR at getting-----");
          console.log(error);
        }
        else {
            console.log(result + ' : ' + timestamp, timestamp - parseInt(result));
        }
    });
}, timeout);
