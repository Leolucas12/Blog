const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, noExistsOrError, equalsOrError } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async (req, res) => {
        //usuario = corpo da requisicao
        const user = { ...req.body}
        //se o id estiver presente na req e ja estiver cadastrado
        if (req.params.id) user.id = req.params.id

        if (!req.originalUrl.startsWith('/users')) user.admin = false
        if (!req.user || req.user.admin) user.admin = false 

        try {
            existsOrError(user.name , 'Nome não informado')
            existsOrError(user.email , 'E-mail não informado')
            existsOrError(user.password , 'Senha não informada')
            existsOrError(user.confirmPassword , 'Confirmação de senha inválida')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')

            //buscar usuario no db a partir do email
            const userFromDB = await app.db('users')
                .where({ email: user.email }).first()
            if(!user.id) {
                noExistsOrError(userFromDB, 'Usuário já cadastrado')
            }
        } catch(msg) {
            return res.status(400).send(msg)
            //400 é um código de erro client-side
        }

        user.password = encryptPassword(req.body.password)
        delete user.confirmPassword

        if (user.id) {
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
                //500 é um erro server-side
        } else {
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const get = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNull('deletedAt')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .whereNull('deletedAt')
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try {
            const articles = await app.db('articles')
                .where({ userId: req.params.id })
            noExistsOrError(articles, 'Usuário possui artigos')

            const rowsUpdated = await app.db('users')
                .update({ deletedAt: new Date() })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Usuário não encontrado')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    return { save, get, getById, remove }
}