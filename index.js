const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const redis = require('redis');
const path = require('path');
const cookieParser = require('cookie-parser')
const client = redis.createClient();
const app = express();

//redis server connection
client.on('connect', () => console.log('redis server is up...'));


//View engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
mongoose.set('useCreateIndex', true);

//method override 
app.use(methodOverride('_method'));

//Import routes
const userRoute = require('./routes/user');
const productRoute = require('./routes/products');

//Route middlewares
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);


//Mongo db connection
mongoose.connect(process.env.DB_URL, { dbName: "Store", useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) console.log(err)
    else console.log('connected to db')
});


//Home page
app.get('/', (req, res, next) => {
    res.render('login')
});

//Server listening for connection
app.listen(3000, () => console.log('Server is up and listening in port 3000'));