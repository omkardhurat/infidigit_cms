var mysql = require('mysql2');

async function createConnection(){
    const connection = await mysql.createConnection({
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

