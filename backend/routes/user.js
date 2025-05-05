const express = require("express");
const { authenticateToken} = require("../Services/authentication");
const Users = require("../Schemas/user");
const Records = require("../Schemas/Records.js");
const MoneyRegister = require("../Schemas/MoneyRegister");
const router = express.Router();


router.delete("/delete",authenticateToken, async (req, res)=>{
    const { password } = req.body;
    const _id = req.user;
    try {
      let user = await Users.findOne({_id});

      if (!user) 
        res.status(500).send("User not found");
      if(password !== user.password)
        res.status(500).send("Incorrect password");
      
      await Users.deleteOne({_id});
      await Records.deleteMany({user:_id});
      await MoneyRegister.deleteMany({user:_id});
      res.status(201).send("User deleted successfully");
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  })

  router.put("/profile",authenticateToken, async (req, res)=>{
    const _id = req.user;
    try {
      let user = await Users.findOne({_id});
      const catetories = req.body.catetories;
      user.catetories = catetories;
      await user.save();
        res.status(200).json({msg : "Sucessfully updated", catetories});
    }
    catch (error) {
      res.status(200).json({msg : "unable process request"});
      console.log(error);
    }
  });
  router.put("/startmonth",authenticateToken, async (req, res)=>{
    const _id = req.user;
    try {
      let user = await Users.findOne({_id});
      const startMonth = req.body.startMonth;
      user.startMonth = startMonth;
      await user.save();
        res.status(200).json({msg : "Sucessfully updated"});
    }
    catch (error) {
      res.status(200).json({msg : "unable process request"});
      console.log(error);
    }
  });

  module.exports = router;