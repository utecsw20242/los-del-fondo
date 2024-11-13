require('dotenv').config(); 

module.exports = {
    app: {
        port: process.env.PORT || 4000,
    },
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'los_del_fondo',
    },
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/los_del_fondo',
    }
}