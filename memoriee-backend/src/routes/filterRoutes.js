const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/presets', filterController.getPresets);
router.get('/all', filterController.getAllFilters);
router.get('/user', filterController.getUserFilters);
router.post('/', filterController.createFilter);
router.get('/:id', filterController.getFilterById);
router.put('/:id', filterController.updateFilter);
router.delete('/:id', filterController.deleteFilter);

module.exports = router;
