var redis = require("redis");

var options = {
  "host": "redis-13833.c12.us-east-1-4.ec2.cloud.redislabs.com",
  "port": "13833",
  "password": "comprodls"
};

var timeoutDelay = 100;

var client = redis.createClient(options.port, options.host);
if(options.password) {
  client.auth(options.password, function(err) {
      if(err) {
        console.log(err, { stats: 'count#redis.' + host + '~~' + type + '.connection.failed=1' },
         'Error while Authenticating to Redis Server for ' + type);
      }
    });
}

client.on('error', function (err) {
    console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis connect event');
});

client.on('ready', function() {
  console.log('Redis ready event');
});

client.keys('s:auth:org:*job*', function(err, keys) {
  if (err) {
    console.log('err');
    console.log(err);
  }
  console.log('Total Keys');
  console.log(keys.length);
  expireKey(keys);
});


function expireKey(keys) {
  if(keys.length) {
    var jobKey = keys.pop();
    client.hget(jobKey, 'status', function(err, status) {
      if(!err && status === 'completed') {
        client.setex( 'i:' + jobKey, 1, '', function(err) {
          if(err) { console.log("err while exping key: "+jobKey); }
          else {
            console.log('Key: ' + jobKey + ' has expired.');
            console.log('Keys left to expire: ' + keys.length);
            setTimeout(function() { expireKey(keys); }, timeoutDelay);
          }
        });
      }
      else {
        expireKey(keys);
      }
    });
  }
  else {
    console.log('***********All Keys expired successfully**********');
  }
}
