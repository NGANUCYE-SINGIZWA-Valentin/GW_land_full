const express = require('express');
const router = express.Router();

const favoritesController = require('../controllers/favorites.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', favoritesController.listFavorites);
router.post('/', favoritesController.addFavorite);
router.delete('/:listingId', favoritesController.removeFavorite);

module.exports = router;
