const express = require("express");
const { generateToken} = require("../Services/authentication");
const Users = require("../Schemas/user");
const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password, initialAmount} = req.body;
    const user = await Users.findOne({name});
    if(user){
      res.status(400).json({msg:"user already exists"});
      return;
    } 
    try {
      let years = [new Date().getFullYear()]
      const user = new Users({ name, email, password ,years, initialAmount});
      await user.save();
      const token = generateToken(user._id);
      res.status(200).json({ name, initialAmount, years, email, token, startMonth:8, catetories:[]});
    } catch (error) {
      res.status(400).json({msg:"email already exists"});
    }
  });

  router.post("/login", async (req, res)=>{

    const {name , password} = req.body;

    try{      
        const user = await Users.findOne({name});
        if(!user) return res.status(404).send("user not found");

        if(user.password !== password) return res.status(400).send("incorrect password");
        const token = generateToken(user._id);
        const { email, initialAmount, years, startMonth, catetories } = user;
        res.status(200).json({ name ,years , startMonth , email, token, initialAmount, catetories});
    }
    catch(error){
      res.status(400).json(error);
    }
});

module.exports = router;