const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/players', gameController.createPlayer);
router.get('/players/:playerId', gameController.getPlayer);

router.get('/regions', gameController.getRegions);
router.get('/regions/:regionId/content', gameController.getRegionContent);

router.post('/answers/submit', gameController.submitAnswer);
router.post('/regions/complete', gameController.completeRegionMission);
router.get('/results/:playerId', gameController.getGameResult);

module.exports = router;