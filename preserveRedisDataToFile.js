/**
* Given the 'keyPattern', This file will copy all the data from redis which matches the pattern and write down in a single
* file named 'data-<timestamp>.json' in the current directory of this file. The output format is like below.
* file: { key1: jsonData1, key2: jsonData2 .... }
*/

var redis = require("redis");
var async = require('async');
var fs = require('fs');
var Q = require("Q");

var options = {
  "host": "",
  "port": 0,
  "password": "" 
};

var client = redis.createClient(options.port, options.host);

function getAllKeys(pattern) {
  var deferred = Q.defer();

  client.keys(pattern, function(err, keys) {
    if(err) { deferred.reject(err); }
    else { deferred.resolve(keys); }
  });

  return deferred.promise;
}

function getAllData(keys) {
  var deferred = Q.defer();
  var result = {};

  async.eachOfLimit(keys, 20, function(key, idx, cb) {
    console.log(keys[idx]);
    client.hgetall(keys[idx], function(err, val) {
      if(err) { console.log('error for key: ' + keys[idx], err); }
      result[keys[idx]] = val;
      cb();
    });
  }, function () {
    deferred.resolve(result);
  });

  return deferred.promise;  
}

function writeDataToFile(data) {
  var deferred = Q.defer();
  var fileName = './data-' + Date.now() + '.json';
  
  try {
    fs.writeFileSync(fileName, JSON.stringify(data))
    deferred.resolve(fileName);
  }
  catch(e) {
    console.log('error while writing data to file', err);
    deferred.reject(err);
  }

  return deferred.promise;   
}

var keyPattern = 's:anal:dev1:*classrecord*items';
getAllKeys(pattern)
.then(getAllData)
.then(writeDataToFile)
.then(function(file) { console.log('data written successfully to file: ' + file); })
.catch(function(err) { console.log(err); });
