const mongoose = require("mongoose");
require("dotenv").config()

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("mongodb atlas is connected with db SocioDB ")
}).catch(err=>{
    console.log("database connection error",err)
})

const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB successfully !"));