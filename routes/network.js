var express = require('express');

const { createConnection } = require("../database/dbConnect");
const { isNullOrEmpty } = require('../constants/validators')
var router = express.Router();

router.get('/get', async function(req, res, next) {
    let connection = await createConnection();
    let countQuery = `SELECT N.id, N.name, N.created_at, N.updated_at, S.NAME AS state, C.NAME AS city
    FROM NETWORK N 
      INNER JOIN STATE S 
      ON S.ID = N.STATE
      INNER JOIN CITY C
      ON C.ID = N.CITY`
    connection.query(countQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }else{
        res.status(200).json({ status: 200, networks: result});
      }
    });
    
});

router.get('/getByCity', async function(req, res, next) {
  let connection = await createConnection();
  let city = req.query.city;
  let countQuery = `SELECT * FROM NETWORK where city = ${city}`
  connection.query(countQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, networks: result});
  });
  
});

let validateNetwork = async (network) => {
    if(network.state == undefined || network.state == null || network.state == ''){
      return false;
    }else if(network.city == undefined || network.city == null || network.city == ''){
      return false;
    }else if(network.channels == undefined || network.channels == null || network.channels.length == 0){
        return false;
    }else if(network.name == undefined || network.name == null || network.name == ''){
      return false;
    }else{
      return true;
    }
  }
  
  router.post('/add', async function(req, res, next) {
    let connection = await createConnection();
    let network = req.body;
    console.log(JSON.stringify(network));
    let validateData = await validateNetwork(network);
    console.log(validateData);
    if(validateData){
    network.channels = network.channels.join(",");
    console.log(network.channels);
      let insertQuery = `INSERT INTO NETWORK(name, state, city, channels) values ('${network.name}', ${network.state}, ${network.city}, '${network.channels}')`;
      connection.query(insertQuery, function (err, result, fields) {
        if (err) {
        console.log(err);
          res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
        }else{
            res.status(200).json({ status: 200, message: 'Network Added Succussfully'});
        }
      });
    }else{
      res.status(400).send('Please enter valid data to add Network');
    }
    
  });

  

module.exports = router;