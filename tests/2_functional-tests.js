/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    let newBookId
    let newBookTitle = 'Testing Book Title'
    let falseBookId = '6659155a9ae429a12f5485b1'  

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .keepOpen()
        .post('/api/books')
        .send({
          title: newBookTitle
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.title, newBookTitle);
          assert.equal(res.body.commentcount, 0);
          newBookId = res.body._id;
          done();
        })
        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .keepOpen()
        .post('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res)
          assert.equal(res.type, 'text/html')
          assert.equal(res.text, 'missing required field title')
          done()
        })
      });
      
    }); // Suite POST /api/books


    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/books')
        .end(function(err,res){
            assert.equal(res.status, 200);
            //console.log(res)
            assert.equal(res.type, 'application/json')
            assert.isArray(res.body)
            done()
        })
      });      
    }); // Suite GET /api/books

    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/books/' + falseBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'no book exists');
          done()
        });
      })
    
      
      test('Test GET /api/books/[id] with valid id in db', function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/books/'+newBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, newBookId);
          assert.equal(res.body.title, newBookTitle);
          assert.isArray(res.body.comments);
          done()
        });
      }); //test
      
    }); //Suite


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .keepOpen()
        .post('/api/books/'+ newBookId)
        .send({comment: 'very good'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, newBookId);
          assert.equal(res.body.title, newBookTitle);
          assert.isArray(res.body.comments);
          done()
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
        .keepOpen()
        .post('/api/books/'+ newBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'missing required field comment');
          done()
        });

      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        
        chai.request(server)
        .keepOpen()
        .post('/api/books/'+ falseBookId)
        .send({comment: 'very good'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'no book exists')
          done()
        });

      });
      
    });// Suite POST /api/books/[id]

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
        .keepOpen()
        .delete('/api/books/'+ newBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'delete successful');
          done()
        });
      })

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
        .keepOpen()
        .delete('/api/books/' + falseBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log(res.body);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'no book exists');
          done()
        });
      })
    });  // suite DELETE
  });

}); 
