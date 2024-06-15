// var mysql = require('mysql2');
var mysql = require('mysql2/promise');

async function createConnection(){
    const connection = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'cms@#123',
        database: 'cms_app',
      });
    return connection;
}

module.exports = {
    createConnection 
}

