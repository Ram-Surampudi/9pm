const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const moneyRegisterRoutes = require("./routes/moneyRegister.js");
const recordsRoutes = require("./routes/records.js");
const userRoutes = require("./routes/user.js");


const app = express();
app.use(bodyParser.json());

require('dotenv').config();

app.use(cors());

app.use(cors({
  // origin: "https://9am.vercel.app", 
  origin: "", 
  methods: "GET,POST,PUT,DELETE", 
  credentials: true
}));


mongoose.connect(process.env.MONGO_URI);

app.use("/api/auth", authRoutes);
app.use("/api/mr", moneyRegisterRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/user",userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});