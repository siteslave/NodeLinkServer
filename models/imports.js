var Q = require('q');
var _ = require('lodash');
var moment = require('moment');

module.exports = {
  doImport: function(db, data) {
    var q = Q.defer();
    var col = db.collection('refer');

    var query = col.initializeUnorderedBulkOp({
      useLegacyOps: true
    });
    var total = 0;
    _.forEach(data, function(v) {
      if (v.vn && v.hospcode) {
        total++;
        v.date_serv = new Date(moment(v.date_serv, "yyyymmdd").format());
        v.d_update = new Date(moment(v.d_update, "yyyymmddhhmmss").format());
        query.find({
            hospcode: v.hospcode,
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
