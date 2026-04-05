const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getEventPhotos, deletePhoto, deleteAllPhotos } = require('../controllers/photoController');

router.use(auth);
router.get('/:eventId', getEventPhotos);
router.delete('/:id', deletePhoto);
router.delete('/all/:eventId', deleteAllPhotos);

module.exports = router;