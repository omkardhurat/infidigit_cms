var express = require('express');

const { createConnection } = require("../database/dbConnect");
const { isNullOrEmpty } = require('../constants/validators')
var router = express.Router();

router.get('/get', async function(req, res, next) {
    let connection = await createConnection();
    let countQuery = `SELECT com.id, com.name, com.created_at, com.updated_at, S.NAME AS state, C.NAME AS city, N.NAME AS network 
    FROM COMPAIGN COM
      INNER JOIN STATE S 
      ON S.ID = com.STATE
      INNER JOIN CITY C
      ON C.ID = com.CITY
      INNER JOIN NETWORK N
      ON N.ID = com.NETWORK`
    connection.query(countQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }else{
        res.status(200).json({ status: 200, compaigns: result});
      }
    });
    
});



let validateCompaign = async (compaign) => {
    if(compaign.name == undefined || compaign.name == null || compaign.name == ''){
        return false;
    }else if(compaign.state == undefined || compaign.state == null || compaign.state == ''){
      return false;
    }else if(compaign.city == undefined || compaign.city == null || compaign.city == ''){
      return false;
    }else if(compaign.network == undefined || compaign.network == null || compaign.network == ''){
        return false;
    }else if(compaign.channels == undefined || compaign.channels == null || compaign.channels.length == 0){
        return false;
    }else if(compaign.product == undefined || compaign.product == null || compaign.product == ''){
      return false;
    }else if(compaign.brand == undefined || compaign.brand == null || compaign.brand == ''){
        return false;
    }else if(compaign.startDate == undefined || compaign.startDate == null || compaign.startDate == ''){
        return false;
    }else if(compaign.endDate == undefined || compaign.endDate == null || compaign.endDate == ''){
        return false;
    }else if(compaign.slotType == undefined || compaign.slotType == null || compaign.slotType == ''){
        return false;
    }else{
      return true;
    }
  }
  
  router.post('/add', async function(req, res, next) {
    let connection = await createConnection();
    let compaign = req.body;
    console.log(JSON.stringify(compaign));
    let validateData = await validateCompaign(compaign);
    console.log(validateData);
    if(validateData){
    compaign.channels = compaign.channels.join(",");
    console.log(compaign.channels);
      let insertQuery = `INSERT INTO compaign(name, state, city, network, channels, product, brand, start_date, end_date, slot_type) values ('${compaign.name}', ${compaign.state}, ${compaign.city}, ${compaign.network}, '${compaign.channels}', '${compaign.product}', '${compaign.brand}', '${compaign.startDate}', '${compaign.endDate}', '${compaign.slotType}')`;
      connection.query(insertQuery, function (err, result, fields) {
        if (err) {
        console.log(err);
          res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
        }else{
            res.status(200).json({ status: 200, message: 'Compaign Added Succussfully'});
        }
      });
    }else{
      res.status(400).send('Please enter valid data to add Compaign');
    }
    
  });

  

module.exports = router;