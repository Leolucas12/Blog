const schedule = require('node-schedule')

module.exports = app => {
    schedule.scheduleJob('*/1 * * * *', async function(){ //scheduleJob runs this function every 1 minute
        //getting the user, categories and articles count
        const userCount = await app.db('users').count('id').first()
        const categoriesCount = await app.db('categories').count('id').first()
        const articlesCount = await app.db('articles').count('id').first()

        const { Stat } = app.api.stat
        
        //getting the last update from /api/stat.js
        const lastStat = await Stat.findOne({}, {},
            { sort: { 'createdAt': -1 } })
        
        //new stat will overwrite the lastStat
        const stat = new Stat({
            users: userCount.count,
            categories: categoriesCount.count,
            articles: articlesCount.count,
            createdAt: new Date()
        })
        
        //saving the updates and
        const changeUsers = !lastStat || stat.users !== lastStat.users
        const changeCategories = !lastStat || stat.categories !== lastStat.categories
        const changeArticles = !lastStat || stat.articles !== lastStat.articles

        if (changeUsers || changeCategories || changeArticles) {
            stat.save().then(() => console.log('[Stats] Estatísticas atualizadas'))
        }
    })
}
