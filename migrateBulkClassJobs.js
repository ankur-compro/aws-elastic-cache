var Q = require('q');
var request = require('request-promise');
var async = require('async');
var AWS = require('aws-sdk');

var baasURL = process.env.BAAS_URL;
var dateNow = Date.now()-61*24*60*60*1000; //two months earlier date.
var jobsTable = 'Realm_' + process.env.REALM + '.' + process.env.ENVIRONMENT + '_jobs';
var token = process.env.TOKEN;

var dynamoClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
  accessKeyId: process.env.REALM_DYNAMODB_DATA_ACCESS_KEY_ID,
  secretAccessKey: process.env.REALM_DYNAMODB_DATA_SECRET_ACCESS_KEY
});

var listOfOrgs = []; //[o1, o2]

async.eachSeries(listOfOrgs, function(orgId, next) {
  fetchJobsFromBAASAndCreateInDDB(orgId)
  .then(function() {
    console.log('*****************************************************************');
    console.log('Jobs migrated for org: ' + orgId);
    console.log('*****************************************************************');
    next();
  })
  .catch(function(err) {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('Job Migration Failed for org ' + orgId);
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    next(err);
  });
},
function(err) {
  if(err) {
    console.log('###############################################################');
    console.log('Error while migrating job, migration aborted');
    console.log('###############################################################');
  }
  else {
    console.log('________________________________________________________________');
    console.log('Job migration completed successfully');
    console.log('________________________________________________________________');
  }
});


function fetchJobsFromBAASAndCreateInDDB(orgId, cursor) {
  var deferred = Q.defer();
  var options = {
    method: 'GET',
    uri: baasURL + '/' + orgId + '/default/jobs',
    qs: {
      ql: "itype='class_bulk_enrollment_association' && created >= {dateNow} order by created desc",
      limit: 25,
      access_token: token,
    }
  };

  if(cursor) { options.qs.cursor = cursor; }

  request(options)
  .then(function transformBAASJobsIn(response) {
    var jobs = response.entities;
    cursor = response.cursor;
    return transformJobs(orgId, jobs);
  })
  .then(function createJobsInDDB(jobs) {
    return batchWriteJobsInDDB(jobs);
  })
  .then(function() {
    if(cursor) {
      console.log('Going to fetch jobs with next cursor for org ' + orgId);
      return fetchJobsFromBAASAndCreateInDDB(orgId, cursor);
    }
  })
  .then(function() { deferred.resolve(); })
  .catch(function(err) { deferred.reject(err); });

  return deferred.promise;
}

function batchWriteJobsInDDB(items) {
  var deferred = Q.defer();

  var params = {
    RequestItems: {
      [jobsTable]: items
    }
  };

  dynamoClient.batchWrite(params, function(err) {
    if(err) { deferred.reject(err); }
    else { deferred.resolve(); }
  });

  return deferred.promise;
}

function transformJobs(orgid, jobs) {
  var deferred = Q.defer();
  var res = [];
  async.each(jobs, function(job, next) {
    var userid = job.class_bulk_enrollment_association.context.userid;
    getUserExUserId(orgid, userid)
    .then(function(extUserId) {
      job.pk = process.env.ACCOUNT + '#' + extUserId;
      job.sk = 'class_bulk_enrollment_association' + '#' + job.uuid;
      job.ttl = 60*24*60*60;
      job.jobid = job.uuid;
      delete job.uuid;
      delete job.type;
      delete job.metadata;
      res.push(job);
      next();
    })
    .catch(function(err) { next(err); });
  }, function(err) {
    if(err) { deferred.reject(err); }
    else { deferred.resolve(res); }
  });

  return deferred.promise;
}

function getUserExUserId(orgid, userid) {
  var deferred = Q.defer();

  request({
    method: 'GET',
    uri: baasURL + '/' + orgid + '/default/users/' + userid,
    qs: {
      access_token: token
    }
  })
  .then(function(user) {
    deferred.resolve(user.ext_user_id || 'builder-' + userid);
  })
  .catch(function(err) { deferred.reject(err); });

  return deferred.promise;
}
