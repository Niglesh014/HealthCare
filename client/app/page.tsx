"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function receptionist() view returns(address)",
  "function registerPatient(address,string,uint)",
  "function registerDoctor(address)",
  "function grantDoctor(address)",
  "function getMyRecords() view returns(tuple(string diagnosis,string prescription,string ipfsHash,uint timestamp,address doctor)[])",
  "function addRecord(address,string,string,string)"
];

export default function Home(){

const [wallet,setWallet] = useState("");
const [role,setRole] = useState("");
const [isReceptionist,setIsReceptionist] = useState(false);

const [userName,setUserName] = useState("");
const [specialization,setSpecialization] = useState("");

const [newPatient,setNewPatient] = useState("");
const [patientName,setPatientName] = useState("");
const [patientAge,setPatientAge] = useState("");

const [newDoctor,setNewDoctor] = useState("");
const [doctorName,setDoctorName] = useState("");
const [doctorSpecial,setDoctorSpecial] = useState("");

const [doctors,setDoctors] = useState<any[]>([]);
const [doctor,setDoctor] = useState("");

const [records,setRecords] = useState<any[]>([]);

const [patient,setPatient] = useState("");
const [diagnosis,setDiagnosis] = useState("");
const [prescription,setPrescription] = useState("");
const [file,setFile] = useState<File | null>(null);


useEffect(()=>{
loadDoctors();
},[]);


async function loadDoctors(){
try{
const res = await axios.get("http://localhost:5000/api/doctors");
setDoctors(res.data);
}catch{
console.log("Doctor list error");
}
}


async function connectWallet(){

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();

setWallet(address);

const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const rec = await contract.receptionist();
setIsReceptionist(rec.toLowerCase() === address.toLowerCase());

const res = await axios.get(`http://localhost:5000/api/role/${address}`);
setRole(res.data.role);

try{

const user = await axios.get(`http://localhost:5000/api/user/${address}`);

if(user.data){
setUserName(user.data.name);
setSpecialization(user.data.specialization || "");
}

}catch{
console.log("User not found");
}

}



async function uploadToIPFS(){

if(!file){
alert("Select file");
return "";
}

const formData = new FormData();
formData.append("file",file);

const res = await axios.post(
"https://api.pinata.cloud/pinning/pinFileToIPFS",
formData,
{
headers:{
pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY!,
pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET!
}
}
);

return res.data.IpfsHash;

}



async function registerPatient(){

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const tx = await contract.registerPatient(
newPatient,
patientName,
Number(patientAge)
);

await tx.wait();

await axios.post("http://localhost:5000/api/patient",{
  walletAddress:newPatient,
  name:patientName,
  age:Number(patientAge),
  phone:"0000000000",
  email:"patient@hospital.com"
});

alert("Patient Registered");

}



async function registerDoctor(){

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const tx = await contract.registerDoctor(newDoctor);
await tx.wait();

await axios.post("http://localhost:5000/api/doctor",{
walletAddress:newDoctor,
name:doctorName,
specialization:doctorSpecial
});

alert("Doctor Registered");

loadDoctors();

}



async function grantDoctor(){

if(!doctor){
alert("Select doctor");
return;
}

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const tx = await contract.grantDoctor(doctor);
await tx.wait();

alert("Doctor Granted");

}



async function getRecords(){

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const data = await contract.getMyRecords();
setRecords(data);

}



async function addRecord(){

const hash = await uploadToIPFS();

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

const tx = await contract.addRecord(
patient,
diagnosis,
prescription,
hash
);

await tx.wait();

alert("Record Added");

}



const card={
background:"#fff",
padding:"25px",
borderRadius:"10px",
boxShadow:"0px 3px 10px rgba(0,0,0,0.1)",
marginTop:"20px"
};

const input={
padding:"10px",
width:"100%",
marginTop:"8px",
marginBottom:"10px",
borderRadius:"6px",
border:"1px solid #ccc"
};

const button={
padding:"10px 16px",
background:"#4CAF50",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginTop:"5px"
};



return(

<div style={{maxWidth:"900px",margin:"auto",padding:"40px",fontFamily:"Arial"}}>

<h1 style={{textAlign:"center"}}>🏥 Healthcare Blockchain DApp</h1>


<div style={{textAlign:"center",marginTop:"20px"}}>

<button style={button} onClick={connectWallet}>
Connect Wallet
</button>

{wallet && (

<div style={{marginTop:"15px"}}>

<h3>{userName || wallet}</h3>

{specialization && <p>{specialization}</p>}

</div>

)}

</div>



{isReceptionist && (

<div style={card}>

<h2>Receptionist Dashboard</h2>

<h3>Register Patient</h3>

<input style={input} placeholder="Patient Wallet" value={newPatient} onChange={(e)=>setNewPatient(e.target.value)}/>

<input style={input} placeholder="Patient Name" value={patientName} onChange={(e)=>setPatientName(e.target.value)}/>

<input style={input} placeholder="Patient Age" value={patientAge} onChange={(e)=>setPatientAge(e.target.value)}/>

<button style={button} onClick={registerPatient}>
Register Patient
</button>


<hr style={{margin:"25px 0"}}/>


<h3>Register Doctor</h3>

<input style={input} placeholder="Doctor Wallet" value={newDoctor} onChange={(e)=>setNewDoctor(e.target.value)}/>

<input style={input} placeholder="Doctor Name" value={doctorName} onChange={(e)=>setDoctorName(e.target.value)}/>

<input style={input} placeholder="Specialization" value={doctorSpecial} onChange={(e)=>setDoctorSpecial(e.target.value)}/>

<button style={button} onClick={registerDoctor}>
Register Doctor
</button>

</div>

)}



{role === "1" && (

<div style={card}>

<h2>Patient Dashboard</h2>

<select style={input} onChange={(e)=>setDoctor(e.target.value)}>

<option value="">Select Doctor</option>

{doctors.map((d:any)=>(
<option key={d.walletAddress} value={d.walletAddress}>
Dr. {d.name} - {d.specialization}
</option>
))}

</select>

<button style={button} onClick={grantDoctor}>
Grant Doctor Access
</button>


<br/><br/>


<button style={button} onClick={getRecords}>
View Medical Records
</button>


{records.map((r,i)=>(
<div key={i} style={{marginTop:"15px",padding:"15px",border:"1px solid #eee",borderRadius:"8px"}}>

<p><b>Diagnosis:</b> {r.diagnosis}</p>

<p><b>Prescription:</b> {r.prescription}</p>

<a href={`https://gateway.pinata.cloud/ipfs/${r.ipfsHash}`} target="_blank">
View Report
</a>

</div>
))}

</div>

)}



{role === "2" && (

<div style={card}>

<h2>Doctor Dashboard</h2>

<input style={input} placeholder="Patient Wallet" onChange={(e)=>setPatient(e.target.value)}/>

<input style={input} placeholder="Diagnosis" onChange={(e)=>setDiagnosis(e.target.value)}/>

<input style={input} placeholder="Prescription" onChange={(e)=>setPrescription(e.target.value)}/>

<input type="file" style={input} onChange={(e)=>setFile(e.target.files?.[0] || null)}/>

<button style={button} onClick={addRecord}>
Add Medical Record
</button>

</div>

)}

</div>

);

}