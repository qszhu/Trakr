'use strict';

var expect = require('chai').expect;
var request = require('superagent');
var db = require('../db');

var SERVER = 'http://localhost:3000';

describe('API', function() {

  var book;

  beforeEach(function(done) {
    book = {
      name: 'foo',
      total: 100,
      unit: 'page'
    };
    db.reset()
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });

  describe('Smoke', function() {
    it('should not panic', function(done) {
      request.get(SERVER+'/test')
      .end(function(res) {
        if (res.error) return done(res.error);
        expect(res.text).to.equal('Don\'t panic.');
        done();
      });
    });
  });

  describe('Books', function() {
    it('should create new books', function(done) {
      request.post(SERVER+'/books/')
      .send(book)
      .end(function(res) {
        if (res.error) return done(res.error);
        var book = res.body;
        expect(book.name).to.equal('foo');
        expect(book.total).to.equal(100);
        expect(book.unit).to.equal('page');
        expect(book._id).to.exist;
        done();
      });
    });
    it('should return an empty list when there is no book', function(done) {
      request.get(SERVER+'/books/')
      .end(function(res) {
        if (res.error) return done(res.error);
        var books = res.body;
        expect(books.length).to.equal(0);
        done();
      });
    });
    it('should return a list when books are created', function(done) {
      request.post(SERVER+'/books/')
      .send(book)
      .end(function(res) {
        if (res.error) return done(res.error);
        request.get(SERVER+'/books/')
        .end(function(res) {
          if (res.error) return done(res.error);
          expect(res.body.length).to.equal(1);
          done();
        });
      });
    });
    it('should fail when creating duplicated books', function(done) {
      request.post(SERVER+'/books/')
      .send(book)
      .end(function(res) {
        if (res.error) return done(res.error);
        request.post(SERVER+'/books/')
        .send(book)
        .end(function(res) {
          expect(res.error).to.exist;
          done();
        });
      });
    });
    it('should update books', function(done) {
      request.post(SERVER+'/books/')
      .send(book)
      .end(function(res) {
        if (res.error) return done(res.error);
        var book = res.body;
        request.put(SERVER+'/book/'+book._id)
        .send({name: 'bar'})
        .end(function(res) {
          if (res.error) return done(res.error);
          expect(res.body.name).to.equal('bar');
          done();
        });
      });
    });
    it('should delete books', function(done) {
      request.post(SERVER+'/books/')
      .send(book)
      .end(function(res) {
        if (res.error) return done(res.error);
        var book = res.body;
        request.del(SERVER+'/book/'+book._id)
        .end(function(res) {
          if (res.error) return done(res.error);
          request.get(SERVER+'/books/')
          .end(function(res) {
            if (res.error) return done(res.error);
            expect(res.body.length).to.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('Works', function() {
    var bookId;
    var work = {
      amount: 10,
      duration: 600
    };

    beforeEach(function(done) {
      db.reset()
      .then(function() {
        return db.Book.new('foo', 100, 'page');
      })
      .then(function(book) {
        bookId = book.id;
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });

    it('should create new works', function(done) {
      request.post(SERVER+'/book/'+bookId+'/works/')
      .send(work)
      .end(function(res) {
        if (res.error) return done(res.error);
        var work = res.body;
        expect(work.targetId).to.equal(bookId);
        expect(work.amount).to.equal(10);
        expect(work.duration).to.equal(600);
        expect(work._id).to.exist;
        done();
      });
    });

    it('should list works', function(done) {
      request.post(SERVER+'/book/'+bookId+'/works/')
      .send(work)
      .end(function(res) {
        if (res.error) return done(res.error);
        request.get(SERVER+'/book/'+bookId+'/works/')
        .end(function(res) {
          if (res.error) return done(res.error);
          expect(res.body.length).to.equal(1);
          done();
        });
      });
    });

    it('should delete works', function(done) {
      request.post(SERVER+'/book/'+bookId+'/works/')
      .send(work)
      .end(function(res) {
        if (res.error) return done(res.error);
        var work = res.body;
        request.del(SERVER+'/work/'+work._id)
        .end(function(res) {
          if (res.error) return done(res.error);
          request.get(SERVER+'/book/'+bookId+'/works/')
          .end(function(res) {
            if (res.error) return done(res.error);
            expect(res.body.length).to.equal(0);
            done();
          });
        });
      });
    });
  });
});