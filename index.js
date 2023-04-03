const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { urlencoded } = require("express");

const userSchema = mongoose.Schema(
  {
    username: {
      type: "string",
      unique: true,
      require: true,
    },
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

const exerciseSchema = mongoose.Schema(
  {
    userId: {
      type: "string",
      require: true,
    },
    username: {
      type: "string",
      require: true,
    },
    date: {
      type: Date,
      require: true,
    },
    duration: {
      type: Number,
      require: true,
    },
    description: {
      type: "string",
      require: true,
    },
  },
  { versionKey: false }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

mongoose
  .connect(
    "mongodb+srv://jayboricha707:OHnPpvvEGYJXvnQg@cluster0.ez6lqeq.mongodb.net/freecodecamp?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Database Connected Succesfully!");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    res.json(foundUser);
  }
  const user = await User.create({
    username,
  });
  res.json(user);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  let { from, to,limit } = req.query;
  const userId = req.params._id;
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    res.json({ error: " Invalid user or Id" });
  }

  let filter = { userId };
  // let dateFilter = {};
  // if (from) {
  //   dateFilter["$gte"] = new Date(from);
  // }
  // if (to) {
  //   dateFilter["$lte"] = new Date(to);
  // }
  // if (from || to) {
  //   filter.date = dateFilter;
  // }
  let exercises 
  if (!limit) {
    exercises = await Exercise.find(filter);
  }else{
  exercises = await Exercise.find(filter).limit(limit).exec();
  }
  exercises = exercises.map((exercise) => { 
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    };
  });
const responseObj = {
  username: foundUser.username,
  count: exercises.length,
  _id: userId,
  log: exercises,
}
  // console.log(responseObj)
  res.json(responseObj);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params["_id"];
  let { description, duration, date } = req.body;
  const foundUser = await User.findById(userId);
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  if (!foundUser) {
    res.json({ error: " Invalided user or Id" });
  }
  console.log(date);
  await Exercise.create({
    userId,
    username: foundUser.username,
    date,
    duration,
    description,
  });


  const user = {
    _id: userId,
    username: foundUser.username,
    date: date.toDateString(),
    duration : Number(duration),
    description,
  }
  // console.log(user)
  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
