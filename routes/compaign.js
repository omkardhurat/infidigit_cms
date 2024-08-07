var express = require('express');
var moment = require('moment');
const { createConnection } = require("../database/dbConnect");
const { isNullOrEmpty } = require('../constants/validators');
const { isLoggedIn } = require('./middleware');
var router = express.Router();

router.get('/get', isLoggedIn, async function (req, res, next) {

  let connection = await createConnection();
  try {
    const [results] = await connection.query(`SELECT com.id, com.name, com.created_at, com.updated_at, S.NAME AS state, C.NAME AS city, N.NAME AS network 
    FROM COMPAIGN COM
      INNER JOIN STATE S 
      ON S.ID = com.STATE
      INNER JOIN CITY C
      ON C.ID = com.CITY
      INNER JOIN NETWORK N
      ON N.ID = com.NETWORK`);
    console.log('Results:', results);
    res.status(200).json({ status: 200, compaigns: results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: 'Something Went wrong. Please contact administrator' });
  } finally {
    await connection.end();
  }


});

router.get('/dashboardCount', isLoggedIn, async function (req, res, next) {

  let connection = await createConnection();
  try {
    const [results] = await connection.query(`SELECT count(*) as count,s.name as state, c.name as city From compaign com
    INNER JOIN city c 
    on c.id= com.city
    INNER JOIN state s
    on s.id=c.state
    group by city`);
    console.log('Results:', results);
    res.status(200).json({ status: 200, count: results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: 'Something Went wrong. Please contact administrator' });
  } finally {
    await connection.end();
  }


});




router.get('/getClients', isLoggedIn, async function (req, res, next) {

  let connection = await createConnection();
  try {
    const [results] = await connection.query(`SELECT * FROM CLIENT`);
    console.log('Results:', results);
    res.status(200).json({ status: 200, clients: results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: 'Something Went wrong. Please contact administrator' });
  } finally {
    await connection.end();
  }

});



let validateCompaign = async (compaign) => {
  if (compaign.name == undefined || compaign.name == null || compaign.name == '') {
    return false;
  } else if (compaign.state == undefined || compaign.state == null || compaign.state == '') {
    return false;
  } else if (compaign.city == undefined || compaign.city == null || compaign.city == '') {
    return false;
  } else if (compaign.network == undefined || compaign.network == null || compaign.network == '') {
    return false;
  } else if (compaign.channels == undefined || compaign.channels == null || compaign.channels.length == 0) {
    return false;
  } else if (compaign.product == undefined || compaign.product == null || compaign.product == '') {
    return false;
  } else if (compaign.brand == undefined || compaign.brand == null || compaign.brand == '') {
    return false;
  } else if (compaign.startDate == undefined || compaign.startDate == null || compaign.startDate == '') {
    return false;
  } else if (compaign.endDate == undefined || compaign.endDate == null || compaign.endDate == '') {
    return false;
  } else if (compaign.time == undefined || compaign.time == null || compaign.time == '') {
    return false;
  } else if (compaign.slotCount == undefined || compaign.slotCount == null || compaign.slotCount == '') {
    return false;
  } else if (compaign.client == undefined || compaign.client == null || compaign.client == '') {
    return false;
  } else if (compaign.slotType == undefined || compaign.slotType == null || compaign.slotType == '') {
    return false;
  } else {
    return true;
  }
}

let validateCompaignDynamic = async (compaign) => {
  if (compaign.name == undefined || compaign.name == null || compaign.name == '') {
    return false;
  } else if (compaign.state == undefined || compaign.state == null || compaign.state == '') {
    return false;
  } else if (compaign.city == undefined || compaign.city == null || compaign.city == '') {
    return false;
  } else if (compaign.network == undefined || compaign.network == null || compaign.network == '') {
    return false;
  } else if (compaign.channels == undefined || compaign.channels == null || compaign.channels.length == 0) {
    return false;
  } else if (compaign.product == undefined || compaign.product == null || compaign.product == '') {
    return false;
  } else if (compaign.brand == undefined || compaign.brand == null || compaign.brand == '') {
    return false;
  } else if (compaign.startDate == undefined || compaign.startDate == null || compaign.startDate == '') {
    return false;
  } else if (compaign.endDate == undefined || compaign.endDate == null || compaign.endDate == '') {
    return false;
  } else if (compaign.client == undefined || compaign.client == null || compaign.client == '') {
    return false;
  } else if (compaign.slotType == undefined || compaign.slotType == null || compaign.slotType == '') {
    return false;
  } else {
    return true;
  }
}

let fetchExistingSlots = async (compaign, slotDate, connection, selectedChannel, selectedTime, endTime) => {
  let startTimeF = selectedTime.format('HH:mm:ss');
  let endTimeF = endTime.format('HH:mm:ss')
  let slotFetchQuery = `select * from slots where 
                          (
                          TIME('${startTimeF}') between (start_time) and (end_time)
                          OR TIME('${endTimeF}') between (start_time) and (end_time)
                          )
                          and date = '${moment(slotDate).format("YYYY-MM-DD")}' 
                          and channels=${selectedChannel}`;
 
  let [existSlotsData] = await connection.query(slotFetchQuery);
  // console.log(JSON.stringify(existSlotsData));
  if (existSlotsData.length != 0) {
    // console.log(slotFetchQuery);
  }
  return (existSlotsData.length != 0);
}

let generateSlots = async (compaign, connection) => {
  try {
    let slotDuration = compaign.slotDuration;
    let slotCount = parseInt(compaign.slotCount);
    slotDuration = slotDuration * 1000; // slotDuration seconds in milliseconds
    let compaignTime = compaign.time.split('-');
    let totalHours = parseInt(compaignTime[1]) - parseInt(compaignTime[0])
    console.log(JSON.stringify(compaignTime) + ' - ' + totalHours);
    let gapMinutes = (((totalHours - 1) * 60) / slotCount);
    const gapDuration = gapMinutes * 60 * 1000; // 1 hour in milliseconds

    let MstartDate = new Date(compaign.startDate);
    let endDate = new Date(compaign.endDate);
    let slots = [];
    let slotInsertValues = [];
    const usedNumbers = [];
    let dateIndex = 0;
    console.log(`${MstartDate} - ${endDate} - ${slotDuration} - ${gapDuration}`);
    let channelsArray = compaign.channels.split(",");
    console.log(channelsArray.length);
    for (let channel = 0; channel < channelsArray.length; channel++) {
      const selectedChannel = channelsArray[channel];
      console.log("selected channel::" + selectedChannel + ":MstartDate:" + MstartDate);
      for (var startDate = new Date(compaign.startDate); startDate <= endDate; startDate.setDate(startDate.getDate() + 1)) {
        const startTime = moment().startOf('day').add(parseInt(compaignTime[0]), 'hours'); // Start at 6 AM
        const endTime = moment().endOf('day').add((parseInt(compaignTime[1]) - 1), 'hours').add(59, 'minutes'); // End at 6 PM (excluding the last 6 hours)
        
        let index = 0;
        let randomNumber = (Math.random() * (5 - 1) + 1);
      
        dateIndex++;
        let currentSlot = startTime.clone().add((randomNumber * 60 * 1000), 'milliseconds');
        let endSlot = startTime.clone().add((randomNumber * 60 * 1000), 'milliseconds').add(slotDuration);
        // let existingSlots = await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot.format('HH:mm:ss.SSS'));
        while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
          let newRandomNumber = (Math.random() * (4 - 1) + 1);
          currentSlot = currentSlot.add((newRandomNumber * 60 * 1000), 'milliseconds');
          endSlot = currentSlot.clone().add(slotDuration)
          // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
        }
        
        // console.log("selected slot::===" + currentSlot.format('HH:mm:ss'));
        for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
          
          slotInsertValues.push(`('${currentSlot.format('HH:mm:ss')}', '${endSlot.format('HH:mm:ss')}', ${compaign.compaignId}, '${new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')}', ${compaign.network}, '${selectedChannel}', ${compaign.slotDuration})`)
          index++;
          let loopRandomNumber = (Math.random() * (4 - 1) + 1);
          if (currentSlot.isBefore(endTime)) {
            currentSlot = currentSlot.add(slotDuration + (gapDuration));
            endSlot = currentSlot.clone().add(slotDuration)
            while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
              currentSlot = currentSlot.add((loopRandomNumber * 60 * 1000), 'milliseconds');
              // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
            }
          } else {
            currentSlot = currentSlot.add(slotDuration - (gapDuration / 2));
            endSlot = currentSlot.clone().add(slotDuration)
            while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
              currentSlot = currentSlot.add((loopRandomNumber * 60 * 1000), 'milliseconds');
              // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
            }
          }
        }

      }
    }

    return slotInsertValues;
  } catch (error) {
    console.log(error);
    throw error;
  }

}

let generateDynamicInternalSlots = async (compaign, singleSlot, connection, slotDuration) => {
    let slotInsertValues = [];
    let totalHours = parseInt(singleSlot.compaignTime[1]) - parseInt(singleSlot.compaignTime[0])
    console.log(JSON.stringify(singleSlot.compaignTime) + ' - ' + totalHours);
    let gapMinutes = (((totalHours - 1) * 60) / singleSlot.slotCount);
    const gapDuration = gapMinutes * 60 * 1000; // 1 hour in milliseconds

    
    let startDate = new Date(singleSlot.date);
    let slots = [];
    const usedNumbers = [];
    let dateIndex = 0;
    const startTime = moment().startOf('day').add(parseInt(singleSlot.compaignTime[0]), 'hours'); // Start at 6 AM
    const endTime = moment().endOf('day').add((parseInt(singleSlot.compaignTime[1]) - 1), 'hours').add(59, 'minutes'); // End at 6 PM (excluding the last 6 hours)
    
    let channelsArray = compaign.channels.split(",");
    // console.log(channelsArray.length);
    for (let channel = 0; channel < channelsArray.length; channel++) {
      const selectedChannel = channelsArray[channel];
      // console.log("Selected channel->"+selectedChannel);
      // console.log("se->"+startTime+"---"+endTime);
      let index = 0;
      let randomNumber = (Math.random() * (5 - 1) + 1);
    
      dateIndex++;
      let currentSlot = startTime.clone().add((randomNumber * 60 * 1000), 'milliseconds');
      let endSlot = startTime.clone().add((randomNumber * 60 * 1000), 'milliseconds').add(slotDuration);
      console.log("current slot->"+currentSlot + " --- "+endSlot);
      // let existingSlots = await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot.format('HH:mm:ss.SSS'));
      while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
        let newRandomNumber = (Math.random() * (4 - 1) + 1);
        currentSlot = currentSlot.add((newRandomNumber * 60 * 1000), 'milliseconds');
        endSlot = currentSlot.clone().add(slotDuration)
        // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
      }
      
      // console.log("selected slot::===" + currentSlot.format('HH:mm:ss'));
      for (let slotIndex = 0; slotIndex < singleSlot.slotCount; slotIndex++) {
        // console.log("Selected slot index=--->"+slotIndex+" --- ");
        slotInsertValues.push(`('${currentSlot.format('HH:mm:ss')}', '${endSlot.format('HH:mm:ss')}', ${compaign.compaignId}, '${new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')}', ${compaign.network}, '${selectedChannel}', ${compaign.slotDuration})`)
        index++;
        let loopRandomNumber = (Math.random() * (4 - 1) + 1);
        if (currentSlot.isBefore(endTime)) {
          currentSlot = currentSlot.add(slotDuration + (gapDuration));
          endSlot = currentSlot.clone().add(slotDuration)
          while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
            currentSlot = currentSlot.add((loopRandomNumber * 60 * 1000), 'milliseconds');
            // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
          }
        } else {
          currentSlot = currentSlot.add(slotDuration - (gapDuration / 2));
          endSlot = currentSlot.clone().add(slotDuration)
          while (await fetchExistingSlots(compaign, startDate, connection, selectedChannel, currentSlot, endSlot)) {
            currentSlot = currentSlot.add((loopRandomNumber * 60 * 1000), 'milliseconds');
            // console.log("slot in loop::::" + currentSlot.format('HH:mm:ss'));
          }
        }
      }

    }

    return slotInsertValues;
}
let generateSlotsDynamic = async (compaign, connection) => {
  try {
    
      let mainSlotData = [];
      for(var j = 0;j<compaign.slotArray.length;j++){
        let singleSlot = compaign.slotArray[j]
        let slotDuration = compaign.slotDuration;
        // let slotCount = parseInt(compaign.totalSlots);
        slotDuration = slotDuration * 1000; // slotDuration seconds in milliseconds
        singleSlot.morningCount = parseInt(singleSlot.morningCount);
        singleSlot.afternoonCount = parseInt(singleSlot.afternoonCount);
        singleSlot.eveningCount = parseInt(singleSlot.eveningCount);
        console.log("Sinfgle Slot-->"+JSON.stringify(singleSlot));

        if(singleSlot.morningCount != 0){
          singleSlot.slotCount = singleSlot.morningCount;
          singleSlot.compaignTime = ("08-12").split("-");
          let insertArray = await generateDynamicInternalSlots(compaign, singleSlot, connection, slotDuration);
          mainSlotData.push(insertArray);
          // console.log("i=0->"+JSON.stringify(mainSlotData));
        }
        //for afternoon slots
        if(singleSlot.afternoonCount != 0){
          singleSlot.slotCount = singleSlot.afternoonCount;
          singleSlot.compaignTime = ("12-18").split("-");
          let insertArray = await generateDynamicInternalSlots(compaign, singleSlot, connection, slotDuration);
          mainSlotData.push(insertArray);
          // console.log("i=1->"+JSON.stringify(mainSlotData));
        }
        //for evening slots
        if(singleSlot.eveningCount != 0){
          singleSlot.slotCount = singleSlot.eveningCount;
          singleSlot.compaignTime = ("18-24").split("-");
          let insertArray = await generateDynamicInternalSlots(compaign, singleSlot, connection, slotDuration);
          mainSlotData.push(insertArray);
          // console.log("i=2->"+JSON.stringify(mainSlotData));
        }

  

    
    };
    // console.log("Outside->"+JSON.stringify(mainSlotData));
    console.log(("output created"));
    return mainSlotData;
  } catch (error) {
    console.log(error);
    throw error;
  }

}

router.post('/add', isLoggedIn, async function (req, res, next) {
  let connection = await createConnection();
  let compaign = req.body;
  // console.log(JSON.stringify(compaign));
  // let existingSlots = await fetchExistingSlots(compaign, compaign.startDate, connection);
  if (compaign.slotType == 'S') {
    let validateData = await validateCompaign(compaign);
    // console.log(validateData);
    if (validateData) {
      compaign.channels = compaign.channels.join(",");
      // console.log(compaign.channels);

      try {
        await connection.query('START TRANSACTION');
        var startDate = moment(compaign.startDate);
        var endDate = moment(compaign.endDate);

        const diffDays = endDate.diff(startDate);

        if (diffDays <= 0) {
          res.status(400).send('End Date must be after Start Date');
        } else {
          let insertQuery = `INSERT INTO compaign(name, state, city, network, channels, product, brand, start_date, end_date, slot_type, client, isApproved, duration, slotCount) values ('${compaign.name}', ${compaign.state}, ${compaign.city}, ${compaign.network}, '${compaign.channels}', '${compaign.product}', '${compaign.brand}', '${compaign.startDate}', '${compaign.endDate}', '${compaign.slotType}', ${compaign.client}, 1, ${compaign.slotDuration}, ${compaign.slotCount})`;
          let [result] = await connection.query(insertQuery);

          let lastIdQuery = `SELECT id from compaign order BY id DESC LIMIT 1`;
          let compaignId = await connection.query(lastIdQuery);
          // console.log("JSON::"+JSON.stringify(compaignId[0][0]));
          compaign.compaignId = compaignId[0][0].id;

          let slots = await generateSlots(compaign, connection);
          let slotInsertQry = `INSERT INTO SLOTS (start_time, end_time, compaignId, date, network, channels, duration) values ${slots.join(',')}`
          let [slotResp] = await connection.query(slotInsertQry);
          // console.log(slotInsertQry);
          await connection.query('COMMIT');
          res.status(200).json({ status: 200, message: 'Compaign Added Succussfully' });
        }

      } catch (error) {
        await connection.query('ROLLBACK');
        console.log(error);
        res.status(500).json({ status: 500, message: 'Something Went wrong. Please contact administrator' });
      } finally {
        await connection.end();
      }

    } else {
      res.status(400).send('Please enter valid data to add Compaign');
    }
  } else {
    console.log("in Dynamic::"+JSON.stringify(compaign));
    console.log("in Dynamic::"+JSON.stringify(compaign.slotArray));
    let validateData = await validateCompaignDynamic(compaign);
    // console.log(validateData);
    if (validateData) {
      let selectedDates = compaign.selectedDates;
      selectedDates.sort(function(a,b) {
        a = a.split('-').reverse().join('');
        b = b.split('-').reverse().join('');
        return a > b ? 1 : a < b ? -1 : 0;
      });
      console.log("Unique dates -> "+JSON.stringify(selectedDates));
      let startDateFormatted = moment(compaign.startDate, "YYYY-MM-DD");
      let endDateFormatted = moment(compaign.endDate, "YYYY-MM-DD");
      let selectedFirstDate = moment(selectedDates[0], "YYYY-MM-DD");
      let selectedLastDate = moment(selectedDates[selectedDates.length-1], "YYYY-MM-DD");
      if(!selectedFirstDate.isBetween(startDateFormatted, endDateFormatted, null, '[]') || !selectedLastDate.isBetween(startDateFormatted, endDateFormatted, null, '[]')){
        res.status(400).send(`Please enter valid Dates between ${startDateFormatted} and ${endDateFormatted}`);
      }
      compaign.channels = compaign.channels.join(",");
      // console.log(compaign.channels);

      try {
        await connection.query('START TRANSACTION');
        var startDate = moment(compaign.startDate);
        var endDate = moment(compaign.endDate);

        let insertQuery = `INSERT INTO compaign(name, state, city, network, channels, product, brand, start_date, end_date, slot_type, client, isApproved, duration, slotCount) values ('${compaign.name}', ${compaign.state}, ${compaign.city}, ${compaign.network}, '${compaign.channels}', '${compaign.product}', '${compaign.brand}', '${compaign.startDate}', '${compaign.endDate}', '${compaign.slotType}', ${compaign.client}, 1, ${compaign.slotDuration}, 0)`;
        let [result] = await connection.query(insertQuery);

        let lastIdQuery = `SELECT id from compaign order BY id DESC LIMIT 1`;
        let compaignId = await connection.query(lastIdQuery);
        // console.log("JSON::"+JSON.stringify(compaignId[0][0]));
        compaign.compaignId = compaignId[0][0].id;

        let slots = await generateSlotsDynamic(compaign, connection);
        console.log("main output in route");
        let slotInsertQry = `INSERT INTO SLOTS (start_time, end_time, compaignId, date, network, channels, duration) values ${slots.join(',')}`
        let [slotResp] = await connection.query(slotInsertQry);
        
        await connection.query('COMMIT');
        res.status(200).json({ status: 200, message: 'Compaign Added Succussfully' });
      }catch (error) {
        await connection.query('ROLLBACK');
        console.log(error);
        res.status(500).json({ status: 500, message: 'Something Went wrong. Please contact administrator' });
      } finally {
        await connection.end();
      }

    } else {
      res.status(400).send('Please enter valid data to add Compaign');
    }
  }


});



module.exports = router;