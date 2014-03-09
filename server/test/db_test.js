'use strict';

var expect = require('chai').expect;
var db = require('../db');

describe('Database', function() {

  beforeEach(function(done) {
    db.reset()
    .then(function() {
      done();
    })
    .fail(function(err) {
      done(err);
    });
  });

  describe('Books', function() {
    it('should create new books', function(done) {
      db.Book.new('foo', 100, 'page')
      .then(function(book) {
        expect(book.name).to.equal('foo');
        expect(book.total).to.equal(100);
        expect(book.unit).to.equal('page');
        expect(book.id).to.exist;
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should return an empty list when there is no book', function(done) {
      db.Book.list()
      .then(function(books) {
        expect(books.length).to.equal(0);
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should return a list when books are created', function(done) {
      db.Book.new('foo', 100, 'page')
      .then(function() {
        return db.Book.new('bar', 10, 'chapter');
      })
      .then(function() {
        return db.Book.list();
      })
      .then(function(books) {
        expect(books.length).to.equal(2);
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should fail when creating duplicated books', function(done) {
      db.Book.new('foo', 100, 'page')
      .then(function() {
        return db.Book.new('foo', 10, 'chapter');
      })
      .fail(function(err) {
        expect(err).to.exist;
        done();
      });
    });
    it('should update books', function(done) {
      var bookId;
      db.Book.new('foo', 100, 'page')
      .then(function(book) {
        bookId = book.id;
        return db.Book.modify(bookId, {
          name: 'bar'
        });
      })
      .then(function(book) {
        expect(book.id).to.equal(bookId);
        expect(book.name).to.equal('bar');
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should delete books', function(done) {
      var bookId;
      db.Book.new('foo', 100, 'page')
      .then(function(book) {
        bookId = book.id;
        return db.Book.list()
        .then(function(books) {
          expect(books.length).to.equal(1);
        });
      })
      .then(function() {
        return db.Book.delete(bookId);
      })
      .then(function(book) {
        expect(book.id).to.equal(bookId);
        return db.Book.list()
        .then(function(books) {
          expect(books.length).to.equal(0);
          done();
        });
      })
      .fail(function(err) {
        done(err);
      });
    });
  });

  describe('Works', function() {

    var bookId;

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
      db.Work.new(bookId, 10, 600)
      .then(function(work) {
        expect(work.targetId).to.equal(bookId);
        expect(work.amount).to.equal(10);
        expect(work.duration).to.equal(600);
        expect(work.date).to.exist;
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should list work by target', function(done) {
      db.Work.new(bookId, 10, 600)
      .then(function() {
        return db.Work.listByTarget(bookId);
      })
      .then(function(works) {
        expect(works.length).to.equal(1);
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
    it('should delete works', function(done) {
      db.Work.new(bookId, 10, 600)
      .then(function(work) {
        return db.Work.delete(work.id);
      })
      .then(function() {
        return db.Work.listByTarget(bookId);
      })
      .then(function(works) {
        expect(works.length).to.equal(0);
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
  });
});
