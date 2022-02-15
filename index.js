const express = require("express")
require("dotenv").config()
require("./Configs/db")
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const userRouter = require("./Routers/userRouter");
const postRouter = require("./Routers/postRouter")


app.use(cors())
// using body-parser
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// creating router for application
app.use("/",userRouter);
app.use("/",postRouter);


app.listen(process.env.PORT,()=>{
    console.log(`server is running on PORT:${process.env.PORT} `)
})