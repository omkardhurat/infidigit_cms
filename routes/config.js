var express = require('express');

const { createConnection } = require("../database/dbConnect");
var router = express.Router();

router.get('/states', async function(req, res, next) {
    let connection = await createConnection();
    let countQuery = `SELECT * FROM STATE`
    connection.query(countQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
      res.status(200).json({ status: 200, states: result});
    });
    
});

router.get('/cities/:stateId', async function(req, res, next) {
  let connection = await createConnection();
  let stateId = req.params.stateId;
  let countQuery = `SELECT * FROM CITY where state = ${stateId}`
  connection.query(countQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, citites: result});
  });
  
});


module.exports = router;