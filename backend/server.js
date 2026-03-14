require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const hospitalContract = require("./blockchain");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= MONGODB ================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB Error:", err));

/* ================= TEST ================= */

app.get("/", (req,res)=>{
  res.send("Hospital backend running");
});

/* ================= BLOCKCHAIN ROLE ================= */

app.get("/api/role/:wallet", async (req,res)=>{

  try{

    const wallet = req.params.wallet.toLowerCase();

    const role = await hospitalContract.roles(wallet);

    res.json({
      role: role.toString()
    });

  }catch(err){

    res.status(500).json({
      error: err.message
    });

  }

});

/* ================= REGISTER PATIENT ================= */

app.post("/api/patient", async (req,res)=>{

  try{

    const { walletAddress,name,age,phone,email } = req.body;

    const wallet = walletAddress.toLowerCase();

    const existingPatient = await Patient.findOne({
      walletAddress: wallet
    });

    if(existingPatient){
      return res.status(400).json({
        error:"Patient already exists"
      });
    }

    const patient = new Patient({

      walletAddress: wallet,
      name,
      age,
      phone,
      email

    });

    await patient.save();

    res.status(201).json(patient);

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= GET PATIENT ================= */

app.get("/api/patient/:wallet", async (req,res)=>{

  try{

    const wallet = req.params.wallet.toLowerCase();

    const patient = await Patient.findOne({
      walletAddress: wallet
    });

    res.json(patient);

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= REGISTER DOCTOR ================= */

app.post("/api/doctor", async (req,res)=>{

  try{

    const { walletAddress,name,specialization,phone,email } = req.body;

    const wallet = walletAddress.toLowerCase();

    const existingDoctor = await Doctor.findOne({
      walletAddress: wallet
    });

    if(existingDoctor){
      return res.status(400).json({
        error:"Doctor already exists"
      });
    }

    const doctor = new Doctor({

      walletAddress: wallet,
      name,
      specialization,
      phone,
      email

    });

    await doctor.save();

    res.status(201).json(doctor);

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= GET SINGLE DOCTOR ================= */

app.get("/api/doctor/:wallet", async (req,res)=>{

  try{

    const wallet = req.params.wallet.toLowerCase();

    const doctor = await Doctor.findOne({
      walletAddress: wallet
    });

    res.json(doctor);

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= GET ALL DOCTORS ================= */

app.get("/api/doctors", async (req,res)=>{

  try{

    const doctors = await Doctor.find({});

    res.json(doctors);

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= USER PROFILE (PATIENT / DOCTOR) ================= */

app.get("/api/user/:wallet", async (req,res)=>{

  try{

    const wallet = req.params.wallet.toLowerCase();

    const patient = await Patient.findOne({
      walletAddress: wallet
    });

    if(patient){

      return res.json({

        name: patient.name,
        specialization:"",
        role:"patient"

      });

    }

    const doctor = await Doctor.findOne({
      walletAddress: wallet
    });

    if(doctor){

      return res.json({

        name: doctor.name,
        specialization: doctor.specialization || "",
        role:"doctor"

      });

    }

    return res.json({

      name: wallet,
      specialization:"",
      role:"unknown"

    });

  }catch(err){

    res.status(500).json({
      error:err.message
    });

  }

});

/* ================= START SERVER ================= */

app.listen(5000, ()=>{

  console.log("Server running on port 5000");

});