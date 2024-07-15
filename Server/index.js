const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const router = require("./Routes/routes")
const errorHandler = require("./MiddleWare/errorhandler")
const cookieParser = require('cookie-parser')
const app = express()
// const path = require('path');
dotenv.config();


mongoose.connect(process.env.database_url).then(()=>{
    console.log("DataBase Connected Succesfully");
}).catch((error)=>{
    console.log(`Error in Connecting datab ase: ${error}`);
})

app.use(cookieParser())

app.use(express.json());

app.use(router);

app.use('/Storage', express.static('Storage'));
// app.use('/storage', express.static(path.join(__dirname, 'Storage')));


app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Backend Working on ${PORT}`)
});