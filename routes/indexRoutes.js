const express = require('express');

const controller = require('../controllers/indexController.js');

const router = express.Router();

router.get('/', controller.getHomepage);

module.exports = router;