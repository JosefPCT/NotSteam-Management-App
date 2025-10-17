const express = require('express');

const controller = require('../controllers/gamesController.js');

const router = express.Router();

router.get('/', controller.gamesIndexGet);
router.get('/add', controller.addGameGet);
router.post('/add', controller.addGamePost);
router.get('/:id', controller.gamePageGet);
router.get("/:id/delete", controller.gamePageDelete);


module.exports = router;