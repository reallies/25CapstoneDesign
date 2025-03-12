const express = require("express");
const tripController = require("../controller/scheduleController");

const router = express.Router();

//여정추가
router.post("/",tripController.createTrip);

module.exports = router;