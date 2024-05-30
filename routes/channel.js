var express = require('express');

const { createConnection } = require("../database/dbConnect");
var router = express.Router();

router.get('/get', async function(req, res, next) {
    let connection = await createConnection();
    let countQuery = `SELECT * FROM CHANNEL`
    connection.query(countQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
      res.status(200).json({ status: 200, channels: result});
    });
    
});

router.post('/add', async function(req, res, next) {
  let connection = await createConnection();
  let countQuery = `SELECT * FROM CHANNEL`;
  console.log("in add channel::"+JSON.stringify(req.body));
  // let validateData = await validateChannel(req.body);
  // connection.query(countQuery, function (err, result, fields) {
  //   if (err) {
  //     res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
  //   }
  //   res.status(200).json({ status: 200, channels: result});
  // });
  res.status(200).json({ status: 200, message: 'Channel Added Succussfully'});
});



module.exports = router;