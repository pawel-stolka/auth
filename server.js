var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    User = require('./models/User'),
    auth = require('./auth'),
    CONS = require('./common/cons')

var app = express(),
    port = process.env.PORT || CONS.consts.port,
    // TODO: CHANGE TO 3.0!!!!!!!
    mongoString = CONS.consts.mongoString


app.use(cors())
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
app.use(bodyParser.json())
app.use(morgan('dev'))


// ----------------------------------------------------------------------------------------------------
// ------------------------------ REQUESTS ------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    // res.render('index');
    res.send('hi! everything in Auth3 is working great!')
})

// -------------------- USERS ---------------------------
app.get('/users', async (req, res) => {
    try {
        var users = await User.find({}, '-pass -plainPass -__v')
        res.send(users)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.get('/user/:email', async (req, res) => {
    let email = req.params.email
    try {
        var user = await User.findOne({
            email: email
        }, '-__v')//'-pass -__v')
        // var users = await User.find({}, '-pass -__v')
        res.send(user)//.name)
    } catch (error) {
        console.error(error)
        res.send({
            message: 'No such a user...'
        })
    }
})



// ----------------------------------------------------------------------------------------------------
// ------------------------------> /AUTH <------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

app.use('/auth', auth.router)

// -------------------- MONGOOSE & SERVER --------------
mongoose.connect(mongoString, (err) => {
    let _name = mongoString.split('/'),
        dbName = _name[_name.length - 1]
    if (!err)
        console.log(` ===> connected to: ${dbName} <===`)
})

var server = app.listen(port, () => {
    console.log(` ===> server is listening at =====> port ${port}`)
});