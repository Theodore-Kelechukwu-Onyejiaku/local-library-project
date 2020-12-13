var BookInstance = require('../models/bookinstance');
var Genre = require("../models/genre");
var Author = require("../models/author");
var async = require("async");
var moment = require("moment");
const { body,validationResult } = require('express-validator');
var Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate("book")
        .exec((err, list_bookinstances)=>{
            //If error
            if(err) return next(err);

            //If successful
            res.render("bookinstance_list", {title: "Book Instance List", bookinstance_list: list_bookinstances})
        })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, book)=>{
        if(err) return next(err);

        async.parallel({
            book_genre_detail: function(callback){
                Genre.findById(book.book.genre)
                .exec(callback)
            },
            author_detail: function(callback){
                Author.findById(book.book.author)
                .exec(callback)
            }
        }, function(err, result){
            res.render("bookinstance_detail", {title: "BookInstance detail", book_instance: book, due_back : moment(book.due_back).format("MMMM Do, YYYY"), author_detail: result.author_detail, book_genre_detail: result.book_genre_detail})
        })
        
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
    
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};