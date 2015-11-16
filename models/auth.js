var Q = require('q');

module.exports = {
  auth: function (db, username, password) {
    var q = Q.defer();
    var col = db.collection('auth');
    col.createIndex({username: 1});
    col.createIndex({password: 1});

    var cursor = db.collection('auth').find({username: username, password: password});
    cursor.toArray(function (err, items) {
      if (err) q.reject(err);
      else q.resolve(items.length);
    });

    return q.promise;
  }
};
