var express = require('express');
var moment = require('moment');
const { createConnection } = require("../database/dbConnect");
const { isNullOrEmpty } = require('../constants/validators');
const { isLoggedIn } = require('./middleware');
var router = express.Router();

router.get('/get', isLoggedIn, async function(req, res, next) {

  let connection = await createConnection();
  try{
    const [results] = await connection.query(`SELECT com.id, com.name, com.created_at, com.updated_at, S.NAME AS state, C.NAME AS city, N.NAME AS network 
    FROM COMPAIGN COM
      INNER JOIN STATE S 
      ON S.ID = com.STATE
      INNER JOIN CITY C
      ON C.ID = com.CITY
      INNER JOIN NETWORK N
      ON N.ID = com.NETWORK`);
    console.log('Results:', results);
    res.status(200).json({ status: 200, compaigns: results});
  }catch(error){
    console.log(error);
    res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
  }finally{
    await connection.end();
  }
   
    
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
    }else if(compaign.time == undefined || compaign.time == null || compaign.time == ''){
      return false;
    }else if(compaign.slotCount == undefined || compaign.slotCount == null || compaign.slotCount == ''){
      return false;
    }else if(compaign.slotType == undefined || compaign.slotType == null || compaign.slotType == ''){
        return false;
    }else{
      return true;
    }
  }

  let generateSlots = async (compaign) => {
    // const dayStart = new Date(0, 0, 0); // Start of the day (midnight)
    // const dayEnd = new Date(23, 59, 59, 999); // End of the day
    try{
      let slotDuration = compaign.slotDuration;
      let slotCount = compaign.slotCount;
      slotDuration = slotDuration * 1000; // slotDuration seconds in milliseconds
      let compaignTime = compaign.time.split('-');
      let totalHours = parseInt(compaignTime[1]) - parseInt(compaignTime[0])
      console.log(JSON.stringify(compaignTime) + ' - ' + totalHours);
      let gapMinutes = ((totalHours - 1) * 60)/slotCount;
      const gapDuration = gapMinutes * 60 * 1000; // 1 hour in milliseconds
  
      let startDate = new Date(compaign.startDate);
      let endDate = new Date(compaign.endDate);
      let slots = [];
      let slotInsertValues = [];
      const usedNumbers = [];
      let dateIndex = 0;
      console.log(`${startDate} - ${endDate} - ${slotDuration} - ${gapDuration}`);
      for (startDate; startDate <= endDate; startDate.setDate(startDate.getDate() + 1)) {
        console.log('Current Date:', startDate);
        const startTime = moment().startOf('day').add(8, 'hours'); // Start at 6 AM
        const endTime = moment().endOf('day').subtract(1, 'hours'); // End at 6 PM (excluding the last 6 hours)
        let index = 0;
        let randomNumber;
        do {
          randomNumber = getRandomNumber(usedNumbers);
        } while (usedNumbers.includes(randomNumber)); // Ensure non-repeating number
        console.log("Ramndom Numner"+randomNumber);
        usedNumbers.push(randomNumber);
        dateIndex++;
        console.log(dateIndex);
        let currentSlot = startTime.add((randomNumber * 60 * 1000), 'milliseconds');
        
        // console.log(randomNumber);
        while (currentSlot.isBefore(endTime)) {
          slots.push({
            compaignId: compaign.compaignId,
            date: moment(startDate).format("DD-MM-YYYY"),
            start_time: currentSlot.format('HH:mm:ss.SSS'), // Timestamp with milliseconds
            end_time: currentSlot.add(slotDuration).format('HH:mm:ss.SSS')
          });
          slotInsertValues.push(`('${currentSlot.format('HH:mm:ss.SSS')}', '${currentSlot.add(slotDuration).format('HH:mm:ss.SSS')}', ${compaign.compaignId}, '${new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')}')`)
          index++;
          console.log(index);
          
          currentSlot = currentSlot.add(slotDuration + (gapDuration));
        }
        
      }
      // console.log(JSON.stringify(slots));
      return slotInsertValues;
    }catch(error){
      console.log(error);
      throw error;
    }
    
  }

  function getRandomNumber(usedNumbers) {
    const availableNumbers = [];
    for (let i = 1; i <= 30; i++) {
      if (!usedNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
  
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  }
  
  router.post('/add', isLoggedIn, async function(req, res, next) {
    let connection = await createConnection();
    let compaign = req.body;
    console.log(JSON.stringify(compaign));
    let validateData = await validateCompaign(compaign);
    console.log(validateData);
    if(validateData){
      compaign.channels = compaign.channels.join(",");
      console.log(compaign.channels);

      try{
        await connection.query('START TRANSACTION');
        var startDate = moment(compaign.startDate);
        var endDate = moment(compaign.endDate);

        const diffDays = endDate.diff(startDate);

        if(diffDays <= 0 ){
          res.status(400).send('End Date must be after Start Date');
        }else{
          let insertQuery = `INSERT INTO compaign(name, state, city, network, channels, product, brand, start_date, end_date, slot_type) values ('${compaign.name}', ${compaign.state}, ${compaign.city}, ${compaign.network}, '${compaign.channels}', '${compaign.product}', '${compaign.brand}', '${compaign.startDate}', '${compaign.endDate}', '${compaign.slotType}')`;
          let [result] = await connection.query(insertQuery);
          
          let lastIdQuery = `SELECT id from compaign order BY id DESC LIMIT 1`;
          let compaignId = await connection.query(lastIdQuery);
          console.log("JSON::"+JSON.stringify(compaignId[0][0]));
          compaign.compaignId = compaignId[0][0].id;
          
          let slots = await generateSlots(compaign);
          let slotInsertQry = `INSERT INTO SLOTS (start_time, end_time, compaignId, date) values ${slots.join(',')}`
          let [slotResp] = await connection.query(slotInsertQry);
          console.log(slotInsertQry);
          await connection.query('COMMIT');
          res.status(200).json({ status: 200, message: 'Compaign Added Succussfully'});
        }
        
      }catch(error){
        await connection.query('ROLLBACK');
        console.log(error);
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
      }finally{
        await connection.end();
      }

    }else{
      res.status(400).send('Please enter valid data to add Compaign');
    }
    
  });

  

module.exports = router;