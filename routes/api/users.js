const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const validateRegistration = require("../../validation/register");
const validateLogin = require("../../validation/login");

const User = require("../../models/Users");
const Profile = require("../../models/Profiles");

router.get("/test", (req, res) => {
  res.json({ Message: "This router works" });
});

//sample json for register
// {
// 	"name": "Alex thomas",
// 	"email": "Graft0@live.com",
// 	"username": "Graft0",
// 	"password": "Password1",
// 	"password_confirm": "Password1"
// }

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegistration(req.body);

  if (!isValid) return res.status(400).json(errors);

  User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  })
    .then(user => {
      if (user) {
        errors.user = "Account already exists. Forgot your password?";
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                const newProfile = new Profile({
                  name: req.body.name,
                  user: user._id,
                  username: user.username,
                  avatar: user.avatar
                });
                newProfile
                  .save()
                  .then(profile => {
                    res.json(user);
                  })
                  .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

// const bcryptPassword = password => {
//   console.log(`pass before bcrypt: ${password}`);
//   bcrypt.genSalt(10, (err, salt) => {
//     console.log(`salt: ${salt}`);
//     bcrypt.hash(password, salt, (err, hash) => {
//       console.log(`hash: ${hash}`);
//       return hash;
//     });
//   });
// };

router.post("/login", (req, res) => {
  const password = req.body.password;
  const { errors, isValid } = validateLogin(req.body);
  if (!isValid) return res.status(400).json(errors);
  // User.findOne({ email: req.body.email })
  User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  }).then(user => {
    if (!user) {
      errors.user = "User not found";
      res.send(404).json(errors);
    }

    bcrypt.compare(password, user.password).then(match => {
      if (match) {
        const payload = {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar
        }; //add other info we want to send back
        jwt.sign(
          payload,
          process.env.ourSecret,
          { expiresIn: 3600000 },
          (err, token) => {
            if (err) throw err;
            res.json({ success: true, token: "Bearer " + token });
          }
        );
      } else {
        errors.password = "Password incorrent";
        return res.status(400).json(errors);
      }
    });
  });
});

// //route for matching a user/checking session

// router.post(
//   "/match",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {}
// );

router.get("/", (req, res) => {
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(404).json({ users: "No users found" }));
});

// router.get("/", (req, res) => {
router.get(
  "/auth",
  passport.authenticate("jwt", { session: false }), //comment to toggle auth test
  (req, res) => {
    //where user it not set to blocked, hidden or hasn't blocked current user?
    User.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.status(404).json({ users: "No users found" }));
  }
);

module.exports = router;
