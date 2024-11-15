const express = require('express');
const multer = require('multer');
const { upload } = require("../middleware/multer");
const authMiddleware = require('../middleware/auth');
const eventListing = require('../Controller/eventListing');
const registerForEvent = require('../Controller/regcontroller');
const router = express.Router();

router.post("/listing", eventListing.createEvent);
router.post("/register", authMiddleware, registerForEvent.registerForEvent);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
  next();
});


module.exports = router;