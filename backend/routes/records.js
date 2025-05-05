const express = require("express");
const { authenticateToken} = require("../Services/authentication");
const Records = require("../Schemas/Records");
const { Register } = require("../Services/updateRegister");
const router = express.Router();


router.post("/query",authenticateToken, async (req, res) => {
    const { month, year } = req.body;
    try {
      const record = await Records.findOne({ month, year, user:req.user});
      if (!record) 
        return res.status(404).send("No records found for the specified month and year.");
      res.status(200).send(record);
    } catch (error) {
      res.status(500).send(error);
    }
  });


  router.post("/crud",authenticateToken, async (req, res)=>{
    const { month, year, transactions} = req.body;
    
    const user = req.user;
    try {
      let record = await Records.findOne({ month, year, user});
      if (!record) 
        record = new Records({ month, year, transactions: [], user});
      record.set({...record,transactions});
      await Register(record, user);
      res.status(201).send(record);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  })

  module.exports = router;