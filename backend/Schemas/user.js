const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true  },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    initialAmount :{type:Number, default:0, required:true},
    years: {type: [Number],default: () => [new Date().getFullYear()]}, 
    startMonth : { type: Number, default: 8},
    catetories: { type: Array, default: []}, 
  });


  const Users = mongoose.model("users", userSchema);
  
  module.exports = Users;
  