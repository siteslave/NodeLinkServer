var express = require('express');
var router = express.Router();

var importor = require('../models/imports');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/save', function (req, res, next) {
  var url = req.dbUrl;

  var MongoClient = require('mongodb').MongoClient;
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

router.get('/all', function (req, res, next) {
  var url = req.dbUrl;

  var MongoClient = require('mongodb').MongoClient;
  var data = req.body.data;

  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
      res.send({ok: false, msg: err});
    }
    else {
      var cursor = db.collection('refer').find();
      cursor.toArray(function (err, items) {
        if (err) res.send({ok: false, msg: err});
        else res.send({ok: true, rows: items});
      })
    }
  });
})

module.exports = router;
