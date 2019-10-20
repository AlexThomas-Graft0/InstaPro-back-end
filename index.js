const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");

const passport = require("passport");

const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const profiles = require("./routes/api/profiles");
const config = require("./routes/api/config");

const app = express();

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

mongoose
  // .connect(process.mongoURI)
  .connect(process.env.mongoURI, { useNewUrlParser: true })
  .then(() => console.log("connected to db"))
  .catch(err => console.log(err));

//
require("./config/passport")(passport);
// app.use(passport.initialize());

app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profile", profiles);
app.use("/api/config", config);

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
