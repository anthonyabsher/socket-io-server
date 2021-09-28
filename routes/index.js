const express = require("express");
const router = express.Router();
const cors = require('cors');
var corsOptions = {
    origin: '*',
    "Access-Control-Allow-Origin": '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
router.get("/", cors(corsOptions), (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

module.exports = router;
