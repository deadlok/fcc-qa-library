/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();

module.exports = function (app) {

  const mongoose = require('mongoose')
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{
    console.log("Connected to MongoDB")
  })
  .catch((e)=>{
    console.log("Cannot Connected to MongoDB")
    console.log(e)
  });

  const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    commentcount: {
      type: Number,
      default: 0
    }
  })

  const commentSchema = new mongoose.Schema({
    bookid: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  })

  app.route('/api/books')
  .get(async function (req, res){
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    let Book = mongoose.model('Book', bookSchema)
    let id = req.query._id

    try {
        await Book.find({})
        .then(docs => {
          res.json(docs)
        })
     } catch(e) { 
      console.log(e)
      res.json({result:'no book exists'});
     }
  })
  .post(async function (req, res){
    let title = req.body.title;
    let Book = mongoose.model('Book', bookSchema)
    //response will contain new book object including atleast _id and title

    if (!title) res.send('missing required field title') 
    let newBook = new Book({title: title})

    await newBook.save()
    .then(
      doc => {
      res.json(doc);
      },
      error => {
      console.log(e);
      res.json({error:e});
      }
    )

  })
  .delete(async function(req, res){
    let Book = mongoose.model('Book', bookSchema)
    let Comment = mongoose.model('Comment', commentSchema)
    //if successful response will be 'complete delete successful'
    try {
      await Book.deleteMany({})
      .then(async ()=>{
        await Comment.deleteMany({})
        .then(()=>res.send('complete delete successful'))
    })
    } catch(e) {
      console.log(e)
      res.send('no book exists')
    }
  });


  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      let Book = mongoose.model('Book', bookSchema)
      let Comment = mongoose.model('Comment', commentSchema)
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try{
          await Book.findById(bookid)
          .then(async doc => {
            let comments = [];
            await Comment.find({bookid:bookid}).then(
              docs => {
                docs.map((cmt) => comments.push(cmt.comment));
              }
            )
            res.json({_id:bookid, title:doc.title, comments: comments})
          })
      } catch(e) {
          console.log(e)
          res.send('no book exists')
      }
    })
    // add comment for a book
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      let Book = mongoose.model('Book', bookSchema)
      let Comment = mongoose.model('Comment', commentSchema)
      console.log('bookid: ' + bookid)
      console.log('comment: ' + comment)
      //json res format same as .get

      if (!comment) {
        res.send('missing required field comment')
      } else {
        try {
          await Book.findById(bookid)
          .then( async book => {
            if (book) {
              let commentCnt = 0
              //////// Save new comment ///////
              let newComment = new Comment({bookid:bookid, comment: comment});
              await newComment.save()

              //////// Find all comments ///////
              let comments = []
              await Comment.find({bookid:bookid}).then(
                docs => {
                  docs.map((cmt) => comments.push(cmt.comment));
                  commentCnt = docs.length
                }
              )

              ///////// Update count for the book /////////
              book.commentCnt = commentCnt
              await book.save()

              res.json({_id:bookid, title:book.title, comments: comments})

            } else {
              res.send('no book exists')
            }
          })
        } catch(e) {
          console.log(e)
          res.send('no book exists')
        }
      }
    })
    .delete(async function(req, res){
      let bookid = req.params.id;
      let Book = mongoose.model('Book', bookSchema);
      let Comment = mongoose.model('Comment', commentSchema);
      //if successful response will be 'delete successful'
      try {
        await Book.findOneAndDelete({_id: bookid})
        .then(async ()=>{
          await Comment.deleteMany({bookid:bookid})
          .then(()=>{
            res.send('delete successful');
          })
      })
      } catch(e) {
        console.log(e)
        res.send('no book exists');
      }
    });
};
