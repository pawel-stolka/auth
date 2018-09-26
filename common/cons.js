const consts = {
    // mongoString: //'mongodb://localhost:27017/Auth',
    // mongoString: 'mongodb://test100:test100@ds249992.mlab.com:49992/authqa',
    mongoString: process.env.DB_CONN_STR_QA2,

    secretString: process.env.SECRET_KEY,

    // apiUrl: 'http://localhost:9009',//'http://localhost:9011',
    apiUrl: 'https://authtemplate.herokuapp.com/',

    // frontUrl: 'http://localhost:4400',
    frontUrl: 'http://pablodev.pl',
    // frontUrl: 'http://test.gdziesabasiaipawel.com',

    port: 9009
}

exports.consts = consts