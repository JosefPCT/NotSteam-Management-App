const express = require('express');

const controller = require('../controllers/gamesController.js');

const router = express.Router();

router.get('/', controller.gamesIndexGet);
router.get('/:id', controller.gamePageGet);

module.exports = router;