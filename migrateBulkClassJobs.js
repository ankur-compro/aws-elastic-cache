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
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.REALM_DYNAMODB_DATA_ACCESS_KEY_ID,
  secretAccessKey: process.env.REALM_DYNAMODB_DATA_SECRET_ACCESS_KEY,
  sslEnabled: true,
  convertEmptyValues: true
});

var listOfOrgs = ['dev1', 'inst-dev-1']; //[o1, o2]

async.eachSeries(listOfOrgs, function(orgId, next) {
  fetchJobsFromBAASAndCreateInDDB(orgId)
  .then(function(count) {
    console.log('*****************************************************************');
    console.log('Total Jobs migrated for org: ' + orgId + ' count: ' + count);
    console.log('*****************************************************************');
    next();
  })
  .catch(function(err) {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('Job Migration Failed for org ' + orgId, err);
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    next(err);
  });
},
function(err) {
  if(err) {
    console.log('###############################################################');
    console.log('Error while migrating job, migration aborted', err);
    console.log('###############################################################');
  }
  else {
    console.log('________________________________________________________________');
    console.log('Job migration completed successfully');
    console.log('________________________________________________________________');
  }
});


function fetchJobsFromBAASAndCreateInDDB(orgId, cursor, count = 0) {
  var deferred = Q.defer();
  var options = {
    uri: baasURL + '/' + orgId + '/default/jobs',
    qs: {
      ql: "itype='class_bulk_enrollment_association' && created >= " + dateNow + " order by created desc",
      limit: 25,
      access_token: token,
    }
  };

  if(cursor) { options.qs.cursor = cursor; }

  request(options)
  .then(function transformBAASJobsIn(response) {
    response = JSON.parse(response);
    var jobs = response.entities;
    count += jobs.length;
    cursor = response.cursor;
    if(jobs.length) {
      return transformJobs(orgId, jobs);
    }
    else { cursor = null; }
  })
  .then(function createJobsInDDB(jobs) {
    if(jobs && jobs.length) {
      return batchWriteJobsInDDB(jobs);
    }
  })
  .then(function() {
    if(cursor) {
      console.log('Going to fetch jobs with next cursor for org ' + orgId);
      return fetchJobsFromBAASAndCreateInDDB(orgId, cursor, count);
    }
    else { return count; }
  })
  .then(function(count) { deferred.resolve(count); })
  .catch(function(err) { deferred.reject(err); });

  return deferred.promise;
}

function batchWriteJobsInDDB(items) {
  var deferred = Q.defer();

  //put items in parallel, its like calling put in a for loop over items.
  async.each(items, function(item, next) {
    var options = {
      TableName: jobsTable,
      Item: item
    };
    dynamoClient.put(options, function(err) {
      if(err) { next(err); }
      else { next(); }
    });
  }, function(err) {
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
      if(!extUserId) {
        console.log('>>>>>>>>>>>>>>>> ext_user_id not found for user: ' + userid + ' org ' +
                    orgid + ' jobid ' + job.uuid + ' <<<<<<<<<<<<<<<<<<<<');
        return next();
      }
      job.class_bulk_enrollment_association.context.ext_user_id = extUserId;
      job.pk = process.env.ACCOUNT + '#' + extUserId;
      job.sk = 'class_bulk_enrollment_association' + '#' + job.uuid;
      job.ttl = Math.ceil((Date.now() + 60*24*60*60*1000)/1000);
      job.jobid = job.uuid;
      job.org = orgid;
      job.account = process.env.ACCOUNT;
      job.created_by = extUserId;
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
    uri: baasURL + '/' + orgid + '/default/users/' + userid,
    qs: {
      access_token: token
    }
  })
  .then(function(user) {
    user = JSON.parse(user).entities[0];
    deferred.resolve(user.ext_user_id);
  })
  .catch(function(err) { deferred.reject(err); });

  return deferred.promise;
}
