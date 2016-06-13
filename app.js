var express = require('express');
var bodyParser = require('body-parser');
var sqlite = require('sqlite3');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var app = express();


app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

function hashPassword(password, salt) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

passport.use(new LocalStrategy(function(username, password, done) {
    db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
        if (!row) return done(null, false);
        var hash = hashPassword(password, row.salt);
        db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, hash, function(err, row) {
            if (!row) return done(null, false);
            return done(null, row);
        });
    });
}));

passport.serializeUser(function(user, done) {
    return done(null, user.id);
});

app.post('/login', passport.authenticate('local', {session: true, successRedirect: '/',
    failureRedirect: '/login' }));

app.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    res.render('login');
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');

});



app.post('/signup', function (req, res) {

    var user = req.body.username;
    var salt = 'lalka';
    var pswd = hashPassword(req.body.password, salt);
    db.run('insert into users (username, password, salt) values (?, ?, ?)', [user, pswd, salt], function (err) {
        if (err) {
            res.statusCode = 400;
        }
        res.end();
    });
});

app.get('/signup', function (req, res) {
    res.render('signup');
});


app.all('/*', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    }
    next();  // call next() here to move on to next middleware/router
});



passport.deserializeUser(function(id, done) {
    db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
    });
});

var db = new sqlite.Database('db.sqlite');
app.get('/', function (req, res) {
    db.all('select cars.*, count(*) as likes,  CASE WHEN ? IN (SELECT user_id from featured_cars WHERE car_id = cars.id) THEN 1 ELSE 0 END AS featured from cars left outer join featured_cars as fc on cars.id = fc.car_id group by cars.id', [req.user.id], function (err, result) {
        res.render('index.ejs', {template: 'main', items: result, title: ''});
    });

});

app.param(['class'], function (req, res, next, value) {
    next();
});

app.get('/class/:class', function (req, res, next) {
    db.all("select cars.*,count(*) as likes, CASE WHEN  ? IN (SELECT user_id from featured_cars WHERE car_id = cars.id) THEN 1 ELSE 0 END AS featured from cars left outer join featured_cars as fc on cars.id = fc.car_id group by cars.id having class=?", [req.user.id, req.params.class], function (err, result) {
        res.render('index.ejs', {template: 'main', items: result, title: 'Class ' + req.params.class});
    });
});

app.get('/top', function (req, res) {
    db.all("select cars.*, count(*) as likes, CASE WHEN  ? IN (SELECT user_id from featured_cars WHERE car_id = cars.id) THEN 1 ELSE 0 END AS featured from cars join featured_cars as fc on cars.id = fc.car_id group by cars.id order by likes DESC limit 100", [req.user.id], function (err, result) {
        res.render('index.ejs', {template: 'main', items: result, title: 'Top 100'});
    });
});

app.get('/featured', function (req, res) {
    db.all("select cars.*, count(*) as likes, CASE WHEN  ? IN (SELECT user_id from featured_cars WHERE car_id = cars.id) THEN 1 ELSE 0 END AS featured from cars join featured_cars as fc on cars.id = fc.car_id group by cars.id having ? IN (SELECT user_id from featured_cars WHERE car_id = cars.id)", [req.user.id, req.user.id], function (err, result) {
        res.render('index.ejs', {template: 'main', items: result, title: 'Featured'});
    });
});
app.param(['carid'], function (req, res, next, value) {
    next();
});
app.post('/like/:carid', function (req, res) {
    db.run("insert into featured_cars (user_id, car_id) values (?, ?)", [req.user.id, req.params.carid], function (err, result) {
        if (err) {
            req.statusCode = 400;
        }
        res.end();
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});