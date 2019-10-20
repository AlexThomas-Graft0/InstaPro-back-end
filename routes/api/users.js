const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const config = require("../../config/config");
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
          password: req.body.password,
          followers: [],
          following: []
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
          avatar: user.avatar,
          followers: user.followers,
          following: user.following
        }; //add other info we want to send back
        jwt.sign(
          payload,
          config.ourSecret,
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

router.get(
  `/setCurrentUser`,
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then(user => {
        const payload = {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          followers: user.followers,
          following: user.following
        }; //add other info we want to send back
        jwt.sign(
          payload,
          config.ourSecret,
          { expiresIn: 3600000 },
          (err, token) => {
            if (err) throw err;
            res.json({ success: true, token: "Bearer " + token });
          }
        );
      })
      .catch(err => console.log(err));
  }
);

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
      .then(users => res.json(users))
      .catch(err => res.status(404).json({ users: "No users found" }));
  }
);

// function resolveAfter2Seconds() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('resolved');
//     }, 2000);
//   });
// }

// async function asyncCall() {
//   console.log('calling');
//   var result = await resolveAfter2Seconds();
//   console.log(result);
//   // expected output: 'resolved'
// }

// asyncCall();

const getCurrentUser = user => {
  return new Promise((resolve, reject) => {
    User.findById(user).then(user => {
      const payload = {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following
      }; //add other info we want to send back
      jwt.sign(
        payload,
        config.ourSecret,
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) reject(err);
          let obj = { success: true, token: "Bearer " + token };
          resolve(obj);
        }
      );
    });
  });
};

router.post(
  "/follow/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    //add user to followers
    User.findById(req.user._id) //find logged in user
      .then(user => {
        if (
          user.following.filter(
            follower => follower.user.toString() === req.params.id //if followee is in logged in users following
          ).length > 0
        ) {
          console.log(`you are following ${req.params.id}`);
          const index = user.following
            .map(follower => follower.user.toString())
            .indexOf(req.params.id); //get that follower
          user.following.splice(index, 1); //remove that follow
          console.log(`you are no longer following ${req.params.id}`);
          user
            .save() //save the logged in users
            .then(user => {
              console.log("saved user");
              User.findById(req.params.id) //find followee user
                .then(followee => {
                  // if (!followee.followers) followee.followers = [];
                  // if (!followee.following) followee.following = [];

                  console.log("found followee 1");
                  if (
                    followee.followers.filter(
                      follower =>
                        follower.user.toString() === req.user._id.toString() //if logged in user is in followees followers
                    ).length > 0
                  ) {
                    console.log(`you are a follower of ${req.params.id}`);
                    const index = followee.followers
                      .map(follower => follower.user.toString())
                      .indexOf(req.user._id); //get logged in user
                    followee.followers.splice(index, 1); //remove logged in user
                    console.log(`no longer in ${req.params.id} followers`);
                    followee
                      .save() //save followee user
                      .then(user => {
                        getCurrentUser(req.user._id)
                          .then(token => {
                            res
                              .status(200)
                              .status(200)
                              .json(token);
                          })
                          .catch(err => {
                            console.log(err);
                            console.log(`fsdfsd: ${err}`);
                          });
                      })
                      .catch(err => console.log(err));
                  } else {
                    console.log(
                      `${req.user._id} is not in ${followee._id} followers`
                    );
                    console.log(followee);
                  }
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        } else if (
          user.following.filter(
            follower => follower.user.toString() === req.params.id //if followee is not in logged in users following
          ).length === 0
        ) {
          console.log(`not following ${req.params.id}`);
          User.findById(req.params.id) //find followee
            .then(followee => {
              console.log(`found followee 2`);
              user.following.unshift({
                user: followee._id,
                name: followee.name,
                avatar: followee.avatar
              });
              console.log(`you are now following ${req.params.id}`);
              user
                .save() //save followee to logged in users following
                .then(user => {
                  console.log("saved user");
                  if (
                    followee.followers.filter(
                      follower =>
                        follower.user.toString() === req.user._id.toString()
                    ).length === 0
                  ) {
                    console.log(`you are not in ${req.params.id} followers`);
                    followee.followers.unshift({
                      user: req.user._id,
                      name: req.user.name,
                      avatar: req.user.avatar
                    });
                    console.log(`added you to ${req.params.id} followers`);
                    followee
                      .save()
                      .then(user => {
                        getCurrentUser(req.user._id)
                          .then(token => {
                            res.status(200).json(token);
                          })
                          .catch(err => {
                            console.log(`fsdfsdfd: ${err}`);
                            console.log(err);
                          });
                      })
                      .catch(err => console.log(err));
                  }
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        } else {
          console.log("fsdfsdf");
        }
      })
      .catch(err => res.json({ users: "Failed" }));
  }
);

module.exports = router;

// else if (
//   followee.followers.filter(
//     follower => follower.user.toString() === req.user.id //if followee not in logged in user followers
//   ).length === 0
// ) {
//   followee.followers.unshift({
//     user: req.user.id,
//     name: req.user.name,
//     avatar: req.user.avatar
//   });
//   followee
//     .save()
//     .then(followee => console.log(followee))
//     .catch(err => console.log(err));
// }
//add user to following
// //
// //
// User.findOne({ _id: req.params.id }) //by id? find me first? and check my follows?
//   .then(user => {
//     console.log("got here8");
//     if (
//       user.followers.filter(
//         follower => follower.user.toString() === req.user.id
//       ).length > 0
//     ) {
//       console.log("got here9");
//       const index = user.followers
//         .map(follower => follower.user.toString())
//         .indexOf(req.user.id);
//       user.followers.splice(index, 1);
//       user
//         .save()
//         .then(user => res.json(user))
//         .catch(err => console.log(err));
//       console.log("got here10");
//     } else if (
//       user.followers.filter(
//         follower => follower.user.toString() === req.user.id
//       ).length === 0
//     ) {
//       User.findOne({ _id: req.user.id })
//         .then(followee => {
//           console.log("got here11");
//           user.following.unshift({
//             user: followee._id,
//             name: followee.name,
//             avatar: followee.avatar
//           });
//           user
//             .save()
//             .then(user => res.json(user))
//             .catch(err => console.log(err));
//           console.log("got here12");
//         })
//         .catch(err => console.log(err));
//     }
//   })
//   .catch(err => res.json({ users: "Failed" }));
// //
// //

// let users = [];
// User.findOne({ _id: req.params.id })
//   .then(user => {
//     users.push(user);
//     User.findOne({ _id: req.user.id })
//       .then(user => {
//         users.push(user);
//         res.json(users);
//       })
//       .catch(err => console.log(err));
//   })
//   .catch(err => console.log(err));
