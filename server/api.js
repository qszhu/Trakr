'use strict';

var PORT = 3000;

var express = require('express');
var cors = require('cors');
var app = express();

var db = require('./db');

app.use(cors());
app.use(express.logger());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());

app.get('/test', function(req, res) {
  res.send('Don\'t panic.');
});

function getParams(src, names) {
  var res = {};
  for (var i in names) {
    var k = names[i];
    var v = src[k];
    if (v) {
      if (v instanceof String) v = v.trim();
      res[k] = v;
    }
  }
  return res;
}

var book_fields = ['name', 'total', 'unit'];

app.post('/books/', function(req, res) {
  var data = getParams(req.body, book_fields);
  db.Book.new(data.name, data.total, data.unit)
  .then(function(book) {
    res.json(book);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

app.get('/books/', function(req, res) {
  db.Book.list()
  .then(function(books) {
    res.json(books);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

app.put('/book/:book_id', function(req, res) {
  var data = getParams(req.body, book_fields);
  var book_id = req.params.book_id;
  db.Book.modify(book_id, data)
  .then(function(book) {
    res.json(book);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

app.delete('/book/:book_id', function(req, res) {
  var book_id = req.params.book_id;
  db.Book.delete(book_id)
  .then(function(book) {
    res.json(book);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

var work_fields = ['amount', 'duration'];

app.post('/book/:book_id/works/', function(req, res) {
  var book_id = req.params.book_id;
  var data = getParams(req.body, work_fields);
  db.Work.new(book_id, data.amount, data.duration)
  .then(function(work) {
    res.json(work);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

app.get('/book/:book_id/works/', function(req, res) {
  var book_id = req.params.book_id;
  db.Work.listByTarget(book_id)
  .then(function(works) {
    res.json(works);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

app.delete('/work/:work_id', function(req, res) {
  var work_id = req.params.work_id;
  db.Work.delete(work_id)
  .then(function(work) {
    res.json(work);
  })
  .fail(function(err) {
    res.json(500, {'error': err});
  });
});

db.conn.on('error', console.error.bind(console, 'connection error:'));
db.conn.once('open', function() {
  var server = app.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
  });
});
