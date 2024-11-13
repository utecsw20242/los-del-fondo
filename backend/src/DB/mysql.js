const mysql = require('mysql');
const config = require('../config');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');

const dbPool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
});

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        dbPool.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const initializeDatabase = async () => {
    try {
        await query('CREATE DATABASE IF NOT EXISTS los_del_fondo');
        await query('USE los_del_fondo');

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) PRIMARY KEY NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                username VARCHAR(100) NOT NULL UNIQUE,
                age INT, 
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255),
                phone_number VARCHAR(15),
                auth_provider ENUM('google','apple','facebook','local') DEFAULT 'local',
                provider_id VARCHAR(255),
                register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await query(createTableSQL);
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err; 
    }
};

initializeDatabase().catch(err => {
    console.error('Failed to initialize the database:', err);
});
const allUsers = (table) => query(`SELECT * FROM ??`, [table]);
const oneUser = (table, id) => query(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
const removeUser = (table, id) => query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
const insertUser = (table, data) => query(`INSERT INTO ?? SET ?`, [table, data]);
const updateUser = (table, data) => query(`UPDATE ?? SET ? WHERE id = ?`, [table, data, data.id]);
const addUser = async (table, data) => {
    if(!data.id){
        data.id = uuidv4();
    }
    const result = await insertUser(table, data);
    return {user: {...data, id: data.id}};
};
const findUserByEmail = async(email) =>{
    const result = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (result.length === 0) return null;
    return result[0];
} 
const loginUser = async(data) =>{
    const user = await findUserByEmail(data.email);
    if(!user) throw new Error('User not found');
    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword;
}
const checkEmailExists = async(email) =>{
    const user = await findUserByEmail(email);
    return user !== null;
}
module.exports = {
    allUsers,
    oneUser,
    removeUser,
    insertUser,
    updateUser,
    addUser,
    loginUser,
    checkEmailExists,
    findUserByEmail,
};