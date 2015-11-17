var Q = require('q');
var _ = require('lodash');
var moment = require('moment');

module.exports = {
  doImport: function(db, data) {
    var q = Q.defer();
    var col = db.collection('accident');
    col.createIndex({hospcode: 1});
    col.createIndex({hn: 1});
    col.createIndex({vn: 1});

    var query = col.initializeUnorderedBulkOp({
      useLegacyOps: true
    });
    var total = 0;
    _.forEach(data, function(v) {
      if (v.vn && v.hcode && v.hn) {
        total++;
        // v.vstdate = moment(v.vstdate).format('x');
        // v.arrive_time = moment(v.arrive_time).format('x');
        // v.birth = moment(v.birth).format('x');

        query.find({
            hcode: v.hcode,
            hn: v.hn,
            vn: v.vn
          })
          .upsert().updateOne(v);
      }
    });

    if (total) {
      query.execute(function(err, res) {
        if (err) {
          q.reject(err);
        } else {
          q.resolve();
        }
      });
    } else {
      q.resolve();
    }

    return q.promise;
  }
};
