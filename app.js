const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
// when there is any kind of request, shows down in console
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const exphbs = require('express-handlebars')
const connectDB = require('./config/db.js')

// Load config; lets you access .env files
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport.js')(passport)  // pass passport into this file

connectDB()

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// handlebars helpers
const { formatDate, stripTags, truncate, editIcon } = require('./helpers/hbs.js')

// handlebars
app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon
   },
  defaultLayout: 'main',
  extname: '.hbs' }))
app.set('view engine', '.hbs')

// Sessions (put above passport middleware)
app.use(session({
  secret: 'keyboard cat',
  resave: false,  // don't save session if nothing is modified
  saveUninitialized: false,  // don't create session until something is stored
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set express global variable
app.use(function(req, res, next) {
  // global variable; allows us to access 'user' from within templates
  res.locals.user = req.user || null
  next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`))
