var redis = require("redis");
 
//var redisBatch = new RedisBatch(redis, { flushAfter: 3000 });


//var _und = require('underscore');
var options = {
  "host": "thor-analytics.dwnzoe.ng.0001.usw2.cache.amazonaws.com",
  "port": 6379
};

var client = redis.createClient(options.port, options.host);

client.on('error', function (err) {
    console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

client.keys('s:anal:*:classrecord:*matrix', function(err, keys) {
  if (err) {
    console.log('err');
    console.log(err);
  }
  console.log('keys');
  console.log(keys);
  console.log('keys.length');
  console.log(keys.length);
  //expireKey(keys);
});


function expireKey(keys) {
  if(keys.length) {
    var classrecordKey = keys.pop();
    var splitClassrecordKey = classrecordKey.split(':');
    var orgid = splitClassrecordKey[2];
    var productid = splitClassrecordKey[5];
    var classid = splitClassrecordKey[7];
    var classrecordExpireKey = 'i:s:anal:' + orgid + ':classrecord:product:' + productid +':class:' + classid + ':syncdeleteidle';
    console.log(' classrecord which is going to expire: ' + classrecordExpireKey);
    client.setex(classrecordExpireKey, 1, '', function(err) {
      if(err) {
        console.log('err');
        console.log(err);
      }
      else {
        console.log('Key: ' + classrecordKey + ' has expired.');
        console.log('Keys left to expire: ' + keys.length);
        setTimeout(function() { expireKey(keys); }, 5000);
      }
    });
  }
  else {
    console.log('***********All Keys expired successfully**********');
  }
}
