var User = require('./models/User'),
    jwt = require('jwt-simple'),
    bcrypt = require('bcrypt-nodejs'),
    express = require('express'),
    router = express.Router(),
    CONS = require('./common/cons'),
    nodeMailer = require('nodemailer')

let secretString = CONS.consts.secretString,
    port = process.env.PORT || CONS.consts.port,
    apiUrl = CONS.consts.apiUrl,
    frontUrl = CONS.consts.frontUrl

// ------------- API ----------------------
router.post('/register', async (req, res) => {
    var userData = req.body;
    // todo: validation
    console.log(userData)

    var user = new User(userData)

    user.temporaryToken = jwt.encode({
        sub: user._id
    }, CONS.consts.secretString)
    console.log('debug', user)
    var _existing = await User.findOne({
        email: userData.email
    })

    if (_existing) {
        return res.status(401)
            .send({
                message: 'This user already exists.'
            })
    }

    user.save((err, newUser) => {
        if (err) {
            console.log(`ERROR: ${err}`)
            return res.status(401)
                .send({ message: 'Error saving the user...' })
        }

        createSendToken(res, newUser)

        sender({
            email: user.email,
            name: user.name,
            temporaryToken: user.temporaryToken
        })
    })
})

router.post('/login', async (req, res) => {
    var loginData = req.body;

    var user = await User.findOne({
        email: loginData.email
    })

    if (!user)
        return res.status(401)
            .send({
                message: 'Email or Password invalid!'
            })

    bcrypt.compare(loginData.pass, user.pass, (err, isMatch) => {
        if (!isMatch) {
            var _notLoggedIn = user.notLoggedIn
            _notLoggedIn.push(new Date)
            user.notLoggedIn = _notLoggedIn

            user.save((err, newLog) => {
                console.log('false - updated notLoggedIn.')
            })

            return res.status(401)
                .send({
                    message: 'Email or Password invalid!'
                })
        }
        // if (isMatch) :)
        var _loggedIn = user.loggedIn
        _loggedIn.push(new Date)
        user.loggedIn = _loggedIn
       
        user.save((err, newLog) => {
            console.log('success - updated loggedIn.')
        })
        createSendToken(res, user)
    })
})

router.post('/activate/:token', async (req, res) => {
    var activateData = req.body;
    console.log('activateData', activateData)

    var user = await User.findOne({
        temporaryToken: req.params.token
    })

    if (!user) {
        return res.status(401)
            .send({
                message: 'Token invalid!'
            })
    }

    let token = req.params.token

    let checking = jwt.encode(token, CONS.consts.secretString)
    console.log('checking 4 token: ', checking, token)

    user.temporaryToken = false;
    user.confirmed = true;
    user.save((err, newLog) => {
        console.log('success - activated.')
    })

    return res.status(200)
        .send({
            token,
            message: 'Account activated.'
        })
})


// -------------------- emails ----------------------
router.post('/__mailtest', async (req, res) => {
    var userData = req.body;
    var user = new User(userData)
    sender({
        email: user.email,
        name: user.name
    })
    return res.status(200)
        .send({
            message: 'mailtest sent.'
        })
})

function sender(mailData) {
    // console.log(mailData)
    let source = "auth-app@gdziesabasiaipawel.com"
    
    let transporter = nodeMailer.createTransport({
        host: 'mail5006.smarterasp.net',//
        port: 465,
        secure: true,
        auth: {
            user: 'auth-app@gdziesabasiaipawel.com',
            pass: 'P@ss2Q'
        }
    });
    
    let receivers = [mailData.email, source],
        activationLink = `${frontUrl}/#/activate/${mailData.temporaryToken}`
        // 'https://authtemplate.herokuapp.com/users'
        /* `
            ${serverAddress}/users      
        ` */
        // `${frontUrl}/#/activate/${mailData.temporaryToken}`

    let emailContent = `
            <h2>Hello ${mailData.name}!</h2>
            <br>
            Thank you for registering at Auth Three! :)
            <br>
            <br>
            Please click on the link below to complete your activation: 
            <br>
            <a href='${activationLink}'>Activate</a>
            <p> Pablo from Auth3 </p>
            `
    let email = {
        from: `"Auth Three" ${source}`,
        to: receivers,
        subject: 'Auth Three Activation Link',
        html: emailContent
    };

    transporter.sendMail(email, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(`Message sent: ${info.response}`)
        res.json({
            success: true,
            message: 'Account created! Please check your e-mail for activation link.'
        });
        // res.send('hi! everything in FamilyTree 3.0 API is working great!')
        // res.render('index');
    });
}


// -------------------- JWT ----------------------
function createSendToken(res, user) {
    // sub = subject => just an id in mongoose terminology
    var payload = {
        sub: user._id
    }
    var token = jwt.encode(payload, CONS.consts.secretString)
    console.log('token created successfully! ', token)

    return res.status(200)
        .send({
            token,
            message: 'Account registered! Please check your e-mail for activation link.'
        })
}


var auth = {
    router,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.status(401)
                .send({
                    message: 'Unauthorized. Missing Auth Header.'
                })
        var token = req.header('authorization').split(' ')[1]

        // the same secret as in encode!!!!!!!!!!!!!!!!!!!!
        var payload = jwt.decode(token, CONS.consts.secretString)

        if (!payload)
            return res.status(401).send({
                message: 'Unauthorized. Auth Header Invalid.'
            })

        req.userId = payload.sub

        next()
    }
}

module.exports = auth