const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require ('mongoose')
const bodyParser = require('body-parser')
const Schema = mongoose.Schema;
const {urlencoded} = require('express')
require('dotenv').config()


const userSchema = mongoose.Schema(
  {username : {
    type : "string",
    unique : true,
  }},
  {versionKey : false}
);

const User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema(
  {username : {
    type : "string",
    unique : true,
  },
  description : "string",
  duration : "number",
  date : "string",
  userId : "string"
  },
  {versionKey : false}
);

const Exercise = mongoose.model('Exercise', exerciseSchema);



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Database Connected Succesfully!")
}).catch((err) => {
  console.log(err);
})


app.use(express.json())
app.use(express.urlencoded({extended : true}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) =>{
  const users = await User.find();
  res.send(users);
})

app.post('/api/users',  async (req,res) => {
  const username =  req.body.username;
  // const foundUser = await User.findOne({ username });
  // if(foundUser){
    // res.json(foundUser)
  // }
  const user = await User.create({
    username,
  })
  res.json(user)
})

app.get('/api/users/:_id/logs', async (req,res) => {
  let {from, to ,limit} = req.query;
  const userId = req.params._id;
  const foundUser = await User.findById(userId);
  if(!foundUser){
    res.json({ error :" Invalide user or Id"})
  }

  let filter = {userId}
  let dateFilter = {}
  if(from){
    dateFilter['$gte'] = new Date(from);
  }
  if(to){
    dateFilter['$lte'] = new Date(to);
  }
  if(from || to){
    filter.date = dateFilter;
  }
  if(!limit){
    limit = 100;
  }
  let exercises = await Exercise.find(filter).limit(limit)
    exercises = exercises.map((exercise) => {
    return {
      discription : exercise.description,
      duration : exercise.duration,
      date : exercise.date,
    }
  });
  
  res.json({
    username : foundUser.username,
    count : exercises.length,
    _id : userId,
    log : exercises
  })
})

app.post('/api/users/:_id/exercises', async (req,res) =>{
  const userId = req.body[":_id"];
  let {description, duration, date} = req.body;
  const foundUser = await User.findById(userId);
  if(!date){
    date = new Date();
  }else{
    date = new Date(date);
  }
  if(!foundUser){
    res.json({ error :" Invalide user or Id"})
  }

  await Exercise.create({
    username : foundUser.username,
    description,
    duration,
    date,
    userId,
  })
  
  res.send({
    username : foundUser.username,
    description,
    duration,
    date : date.toDateString(),
    _id : userId,
    
  });
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})