const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/knowledge_stats', { useNewUrlParser: true })
    .catch(e => {
        const msg = 'Não foi possível conectar ao mongodb'
        console.log(msg)
    })