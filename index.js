const express = require('express');
const app = express();
const mongoose = require('mongoose')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const PORT = process.env.PORT || 4000;
const DBURI = process.env.DBURI || "mongodb+srv://shaunOP:bk8QRmHW2he1aUUw@cluster0.re6a6ru.mongodb.net/test?retryWrites=true&w=majority";

const passport = require('passport');
require('./middlewares/passport')(passport);
const homeRoutes = require('./routes/homeRoute');
const authRoutes = require('./routes/authRoute')
const User = require('./models/user')
const morgan = require('morgan')

//MongoDB connect
mongoose.connect(DBURI,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log("DB ERROR : ",err);
    })


//Body Parser
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//EJS
app.set("view engine", "ejs");

//default file loc.
app.use(express.static(__dirname + "/public"));

//cookie & session
app.use(cookieParser('MySecretString'));
app.use(session({
    secret:'SecretStringforSession',
    cookie:{
        maxAge:14*24*60*60*100
    },
    resave:true,
    saveUninitialized:true
    
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());
//
app.use(morgan('common'))

app.use(async (req,res,next)=>{
    res.locals.user = req.user;
    // res.locals.title = req.flash("title")
   
    next();
  });

  app.use('/auth',authRoutes);
  app.use('/',homeRoutes);

app.listen(PORT,()=>{
    console.log(`Server started at port localhost:${PORT}`);
})