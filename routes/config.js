var express = require('express');

const { createConnection } = require("../database/dbConnect");
var router = express.Router();

router.get('/states', async function(req, res, next) {
    let connection = await createConnection();
    try{
      let countQuery = `SELECT * FROM STATE`;
      let [result] = await connection.query(countQuery);
      res.status(200).json({ status: 200, states: result});
    }catch(error){
      console.log(error);
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
    }finally{
      await connection.end();
    }
    
});

router.get('/cities/:stateId', async function(req, res, next) {
  let connection = await createConnection();
  try{
    let stateId = req.params.stateId;
    let countQuery = `SELECT * FROM CITY where state = ${stateId}`;
    let [result] = await connection.query(countQuery);
    res.status(200).json({ status: 200, citites: result});
  }catch(error){
    console.log(error);
    res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
  }finally{
    await connection.end();
  }
  
});


module.exports = router;