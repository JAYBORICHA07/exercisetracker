const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require ('mongoose')
const bodyParser = require('body-parser')
const Schema = mongoose.Schema;
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Database Connected Succesfully!")
}).catch((err) => {
  console.log(err);
})


const userSchema = new Schema({
  "username" : String,
})

const exerciseSchema = new Schema({
  "username" : String,
  "date" : Date,
  "duration" : Number,
  "descriptiton" : String,
})

const logSchema = new Schema ({
  "username" : String,
  "count" : Number,
  "log" : Array
})

const userInfo = mongoose.model('userInfo', userSchema);
const execriseInfo = mongoose.model('exerciseInfo', exerciseSchema);
const logInfo = mongoose.model('logInfo', logSchema);


app.use(express.urlencoded({extended : false }))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/users',  (req,res) => {
  userInfo.find({"username" : req.body.username}, (err,userData) => {
    if(err){
      console.log("Error with server***", err)
    } else {
      if(userData.length === 0){
        const udata = new userInfo({
          "_id" : req.body.id,
          "username" : req.body.username,
        })

        udata.save((err,data) => {
          if(err){
            console.log("Error with saving the data***", err)
          } else {
            res.json({
              "_id" : data.id,
              "username" : data.username,
            })
          }
        })
      } else{
        res.send("Username already exsists..")
      }
    }
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})