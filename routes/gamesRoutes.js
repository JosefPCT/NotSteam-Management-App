const express = require('express');

const controller = require('../controllers/gamesController.js');

const router = express.Router();

router.get('/', controller.gamesPageGet);

module.exports = router;