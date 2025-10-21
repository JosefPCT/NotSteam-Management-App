const express = require('express');

const controller = require('../controllers/categoriesController.js');

const router = express.Router();

router.get('/', controller.categoriesIndexGet);


module.exports = router;