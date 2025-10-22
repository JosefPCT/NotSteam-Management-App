const express = require('express');

const controller = require('../controllers/categoriesController.js');

const router = express.Router();

router.get('/', controller.indexGet);

router.get('/add', controller.addGet);
router.post('/add', controller.addPost);

router.get('/:categoryName', controller.categoryNameGet);
router.post('/:categoryName', controller.categoryNamePost);

router.get('/:categoryName/add', controller.categoryNameAddGet);
router.post('/:categoryName/add', controller.categoryNameAddPost);

router.get('/:categoryName/edit', controller.categoryNameEditGet);
router.post('/:categoryName/edit', controller.categoryNameEditPost);

router.post('/:categoryName/:itemId', controller.categNameItemIdPost);


module.exports = router;