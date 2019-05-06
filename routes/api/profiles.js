const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const validationProfile = require("../../validation/profile");

const Profile = require("../../models/Profiles");
const User = require("../../models/Users");

router.get("/test", (req, res) => res.json({ Message: "Profile route works" }));

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
  }
);

router.get(
  "/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ username: req.params.username })
      .then(profile => res.json(profile))
      .catch(err => res.send(404).json(err));
  }
);

module.exports = router;
