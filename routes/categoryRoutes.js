const express = require('express');

const controller = require('../controllers/categoriesController.js');

const router = express.Router();

router.get('/', controller.categoriesIndexGet);
router.get('/add', controller.categoriesAddGet);
router.post('/add', controller.categoriesAddPost);
router.get('/:id', controller.categoriesIdGet);


module.exports = router;