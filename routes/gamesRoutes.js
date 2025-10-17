const express = require('express');

const controller = require('../controllers/gamesController.js');

const router = express.Router();

router.get('/', controller.gamesIndexGet);
router.get('/add', controller.gamesAddGet);
router.post('/add', controller.gamesAddPost);
router.get('/:id', controller.gamesIdGet);
router.post("/:id", controller.gamesIdPost);
router.get('/:id/edit', controller.gamesIdEditGet);



module.exports = router;