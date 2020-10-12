module.exports = middleware => {
    // checks if user is an administrator by readng the request
    return (req, res, next) => {
        if (req.user.admin) {
            middleware(req, res, next)
        } else {
            res.status(401).send('Usuário não é administrador')
        }
    }
}
