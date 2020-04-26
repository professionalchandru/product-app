const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    const token = req.cookies.token
        // console.log(token)
    if (!token) res.status(401).send('Access Denied... Login with valid user');
    // if (!token) {
    //     req.cookies.error = 'Access Denied';
    //     res.redirect('/');
    //     res.render('login', { error: res.cookies.error });
    //     delete res.cookies.error
    // }



    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = verified;
        next();
    } catch (err) {
        if (err) {
            console.log(err);
            res.status(400).send('Oops...! Session Expired. Please login again');
        }
    }
}