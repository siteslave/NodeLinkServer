var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;

var importor = require('../models/imports');
var auth = require('../models/auth');

/* GET home page. */
router.get('/', function(req, res, next) {

  var url = req.dbUrl;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    } else {
      db.collection('accident').createIndex({hcode:1});
      db.collection('hospitals').createIndex({hospcode:1});

      db.collection('accident').distinct('hcode', function (err, hospitals) {
        var cursor = db.collection('hospitals').find({'hospcode': {$in: hospitals}});

        cursor.toArray(function (err, items) {
          if (err) res.send({ok: false, msg: err});
          else {
            res.render('index', { title: 'NodeLink Server', hospitals: items });
          }
        });
      });
    }

  });


});

router.get('/test', function (req, res, next) {
  var url = req.dbUrl;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    } else {
      db.collection('accident').ensureIndex({hospcode:1});
      db.collection('accident').distinct('hospcode', function (err, hospitals) {
        var cursor = db.collection('hospitals').find({'hospcode': {$in: hospitals}});

        cursor.toArray(function (err, items) {
          if (err) res.send({ok: false, msg: err});
          else res.send({ok: true, rows: items});
        });
      });
    }
  });
});

router.get('/auth', function (req, res, next) {
  var url = req.dbUrl;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    } else {
      db.collection('auth').createIndex({username: 1});
      db.collection('auth').createIndex({password: 1});
      var cursor = db.collection('auth').find({username: '04968', password: 'e10adc3949ba59abbe56e057f20f883e'});
      cursor.toArray(function (err, items) {
        if (err) res.send({ok: false, msg: err});
        else res.send({ok: true, rows: items});
      })
    }
  });
});

router.post('/save', function (req, res, next) {
  var url = req.dbUrl;

  var data = req.body.data;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    }
    else {
      //var data = [{cid: '123456', name: 'satit rianpit' }, {cid: '6666', name: 'sfsdfsdfsf' }]
      importor.doImport(db, data)
      .then(function () {
        db.close();
        res.send({ok: true})
      }, function (err) {
        res.send({ok: false, msg: err})
      })
    }
  });
});

router.post('/send_history', function (req, res, next) {
  var url = req.dbUrl;
  var date = req.body.date;
  var username = req.body.user;
  var password = req.body.password
  var hcode = req.body.hcode;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    }
    else {
      // Check auth
      auth.auth(db, username, password)
      .then(function (pass) {
        if (pass) {
          // Create timestamp
          var strDate = moment(moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')).format('x');
          db.collection('accident').createIndex({vstdate: 1});
          db.collection('accident').createIndex({hcode: 1});
          var cursor = db.collection('accident').find({vstdate: strDate, hcode: hcode});
          cursor.toArray(function (err, items) {
            if (err) res.send({ok: false, msg: err});
            else {
              var data = [];
              _.forEach(items, function (v) {
                var obj = {};
                obj.hcode = v.hcode;
                obj.vn = v.vn;

                data.push(obj);
              });
              db.close();
              res.send({ok: true, rows: data});
            }
          })
        } else {
          db.close();
          res.send({ok: false, msg: 'Access denied!'});
        }
      }, function (err) {
        db.close();
        res.send({ok: false, msg: err});
        console.log(err);
      })
    }
  });
});

router.post('/list', function (req, res, next) {
  var url = req.dbUrl;
  var hospcode = req.body.hospcode;

  if (hospcode) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log(err);
        res.send({ok: false, msg: err});
      }
      else {
        db.collection('accident').createIndex({hcode: 1});
        var cursor = db.collection('accident').find({hcode: hospcode});
        cursor.toArray(function (err, items) {
          if (err) res.send({ok: false, msg: err});
          else {
            var data = [];
            _.forEach(items, function (v) {
              var obj = {};
              obj.hcode = v.hcode;
              obj.vn = v.vn;
              obj.hn = v.hn;
              obj.vstdate = moment(v.vstdate, 'x').format('DD/MM/YYYY');
              obj.fullname = v.prename + v.firstname + ' ' + v.lastname;
              obj.trauma = v.trauma;
              obj.sex = v.sex == '1' ? 'ชาย' : 'หญิง';
              obj.birth = moment(v.dob, 'x').format('DD/MM/YYYY');

              data.push(obj);
            });
            res.send({ok: true, rows: data});
          }
        })
      }
    });
  } else {
    res.send({ok: false, msg: 'ไม่พบหน่วยบริการ'})
  }
});

module.exports = router;
