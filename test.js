var redis = require("redis");


var fs = require('fs');


//var _und = require('underscore');
var options = {
  "host": "test-redis.yaiwig.0001.use1.cache.amazonaws.com",
  "port": 6379,
  "password": "comprodlscomprodls"
};

var client = redis.createClient(options.port, options.host, function() {
  console.log('222222222');
});
client.auth(options.password, function (err) {
  console.log('111111111111111');
  if (err) { throw err; }
  else {
    var data = [ 's:anal:dev1:ingestion:yoyo' ];
    if(true) { data.push('classId'); }
    else { data.push('standard'); }
    client.multi()
    .sadd(data)
    .expire(data[0], 15*60)
    .exec(function(err, res) {
      if(err) {
        console.log(err);
      }
      else { console.log(res); }
    });
  }
});







/*client.auth(options.password, function (err) {
  if (err) { throw err; }
  else {
    client.sadd(['key', 'd', 'k'], function(err, res) {
      if(err) { console.log(err); }
      else {
        console.log((res));
        _und.each(res, function(value, key) {
          k++;
          classrecord[key] = value;
          
        })
        console.log(k);
        var a = JSON.stringify(classrecord, null, 4);
        fs.writeFile('/test.txt', a, function(err) {
          if (err) {
            console.log(err);
            return;
          }
          //file written successfully
        })
      }
    });
  }
});*/
