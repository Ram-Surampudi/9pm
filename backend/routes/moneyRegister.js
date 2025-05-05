const express = require("express");
const {authenticateToken} = require("../Services/authentication");
const MoneyRegister = require("../Schemas/MoneyRegister");
const Records = require("../Schemas/Records");
const { sort } = require("../Services/updateRegister");

const router = express.Router();

router.get("/getregister", authenticateToken, async (req, res)=>{
    const user = req.user;
    try{
        const money_register = await MoneyRegister.find({user}) ;
        sort(money_register);
        res.status(200).send(money_register);
    }
    catch(error){
        console.log(error);
        res.status(400).json({error});
    }
});

router.get("/excelfile", authenticateToken, async (req, res)=>{
    const user = req.user;
    try{
        const records = await Records.find({user});
        const register = await MoneyRegister.find({user});
        sort(register);
        sort(records);
        res.status(200).send({records, register});
    }
    catch(error){
        console.log(error);
        res.status(400).json({error});
    }
  });


module.exports = router;