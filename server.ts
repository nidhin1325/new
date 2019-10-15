if(process.env.NODE_ENV !== 'production'){         //production state
    require('dotenv').config()
}

import * as express from 'express';                     //express imported
import * as bodyParser from 'body-parser';              //bodyparser imported
import * as expressLayouts from 'express-ejs-layouts'   //expressLayouts imported
import * as mongoose from 'mongoose'                    //mongoose imported
import * as methodOverride from 'method-override'       //methodOverride imported


const indexRouter = require('./routes/index')        
const authorRouter =require('./routes/authors')
const bookRouter = require('./routes/books')

const app = express();                           //creating app using express

mongoose.connect(process.env.DATABASE_URL,{      //connecting to mongoDB
    useUnifiedTopology: true,
    useNewUrlParser: true

})     
var db = mongoose.connection;                    //creating connection
db.on('error', error => console.error(error))
db.once('open',() => console.log('CONNECTED TO MONGOOSE'))

app.set('view engine','ejs')            //setting view engine as ejs
app.set('views',__dirname + '/views')   //setting views directory
app.set('layout', 'layouts/layout')     //setting layouts directory
app.use(expressLayouts)                 //asking app to use expressLayouts
app.use(methodOverride('_method'))      //asking app to use methodOverride
app.use(express.static('public'))       
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))  //asking app to bodyParser
//                                              __
app.use('/', indexRouter)                    //   \
app.use('/authors',authorRouter)             // --|-- setting routes 
app.use('/books',bookRouter)                 // __/


app.listen(process.env.PORT || 3000);         //setting port