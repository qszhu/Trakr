'use strict';

var Q = require('q');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/trakr');

var bookSchema = mongoose.Schema({
  name: { type: String, unique: true },
  total: Number,
  unit: String
});
bookSchema.statics.new = function(name, total, unit) {
  var create = Q.nbind(Book.create, Book);
  return create({
    name: name,
    total: total,
    unit: unit
  });
};
bookSchema.statics.list = function() {
  var find = Q.nbind(Book.find, Book);
  return find({});
};
bookSchema.statics.modify = function(bookId, data) {
  var update = Q.nbind(Book.findByIdAndUpdate, Book);
  return update(bookId, { $set: data });
};
bookSchema.statics.delete = function(bookId) {
  var remove = Q.nbind(Book.findByIdAndRemove, Book);
  return remove(bookId);
};
var Book = mongoose.model('Book', bookSchema);

var workSchema = mongoose.Schema({
  targetId: String,
  amount: Number,
  duration: Number,
  date: { type: Date, default: Date.now }
});
workSchema.statics.new = function(targetId, amount, duration) {
  var create = Q.nbind(Work.create, Work);
  return create({
    targetId: targetId,
    amount: amount,
    duration: duration
  });
};
workSchema.statics.listByTarget = function(targetId) {
  var find = Q.nbind(Work.find, Work);
  return find({ targetId: targetId });
};
workSchema.statics.delete = function(workId) {
  var remove = Q.nbind(Work.findByIdAndRemove, Work);
  return remove(workId);
};
var Work = mongoose.model('Work', workSchema);

var conn = mongoose.connection;

exports.conn = conn;
exports.Book = Book;
exports.Work = Work;

exports.reset = function() {
  return Q.nbind(Work.remove, Work)({})
  .then(function() {
    return Q.nbind(Book.remove, Book)({});
  });
};

