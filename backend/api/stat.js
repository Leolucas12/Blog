module.exports = app => {
    //creating the data that will be inserted in MongoDB
    const Stat = app.mongoose.model('Stat', {
        users: Number,
        categories: Number,
        articles: Number,
        createdAt: Date
    })  

    const get = (req, res) => {
        Stat.findOne({}, {}, { sort: { 'createdAt' : -1 } }) //sort -1 will get the latest update
            .then(stat => {
                const defaultStat = {
                    users: 0,
                    categories: 0,
                    articles: 0
                }
                res.json(stat || defaultStat)
            })
    }

    return { Stat, get }
}
