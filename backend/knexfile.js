//this file is the configuration for the database connection

module.exports = {

    client: 'postgresql',
    connection: {
      database: 'blog',
      user:     'postgres',
      password: ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }

};
