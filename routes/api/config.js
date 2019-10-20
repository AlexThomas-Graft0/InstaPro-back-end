const express = require("express");
const router = express.Router();
//@router get /api/config/
//@descriptin Returns all following posts based on relevance.
//@ppublic
router.get("/", (req, res) => {
  res.json({
    apiKey: "AIzaSyCA901IZMnqeXsCamKxl6JjwaBwD2CywL0",
    projectId: "instapro-ad710",
    storageBucket: "instapro-ad710.appspot.com",
    mongoURI:
      "mongodb+srv://admin:InstaPro@cluster0-kgh4c.mongodb.net/test?retryWrites=true",
    ourSecret: "sUPeRsEcReTPasSwOrD"
  });
});

module.exports = router;
