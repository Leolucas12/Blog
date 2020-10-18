const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
//bcrypt is used to compare the password in the database with the password in the login form


module.exports = app => {
    const signIn = async (req, res) => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Informe usuário e senha!')
        }

        const user = await app.db('users')
            .where({ email: req.body.email })
            .first()
        
        if (!user) return res.status(400).send('Usuário não encontrado')
        
        //isMatch is a bcrypt exclusive function used to compare the password in the form with the hash
        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if (!isMatch) return res.status(401).send('Email ou senha inválidos')

        //using the Date function to validate the login
        const now = Math.floor(Date.now() / 1000)
        
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            //iat = Issued at
            iat: now,
            exp: now + (60 * 60)
        }
        
        //payload object uses the body of the request to create a login token
        //login token can be used to access the account automatically, if the payload didnt expire
        res.json({
            ...payload,
            //jwt (json web token) is used to create an authorization
            token: jwt.encode(payload, authSecret)
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null

        try {
            if (userData) {
                //getting the token from the request.body
                const token = jwt.decode(userData.token, authSecret)
                //checking if the token already expired
                if (new Date(token.exp *1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch(e) {}

        res.send(false)
    }
    return { signIn, validateToken }
}
