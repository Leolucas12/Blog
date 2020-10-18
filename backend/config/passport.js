const { authSecret } = require('../.env')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        //secret from the env file
        secretOrKey: authSecret,
        //gets the bearer token from the request
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const strategy = new Strategy(params, (payload, done) => { //payload comes from the token
        //checking user's token
        app.db('users')
            .where({ id: payload.id })
            .first()
            .then(user => done(null, user ? { ...payload } : false ))
            .catch(err => done(err, false))
    })

    passport.use(strategy)

    //user can access all routes only if he is logged in
    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}
