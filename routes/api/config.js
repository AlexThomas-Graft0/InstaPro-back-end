const express = require("express");
const router = express.Router();
//@router get /api/config/
//@descriptin Returns all following posts based on relevance.
//@ppublic
router.get("/", (req, res) => {
  res.json({
    apiKey: process.env.apiKey,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket
  });
});

module.exports = router;
