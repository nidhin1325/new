import * as express from 'express'   //importing express
var router = express.Router();      // assigning Router function from express to router variable

router.get('/', (request, response)=>{  //routing
    response.render('index')
});

module.exports = router;         // exporting  index route
