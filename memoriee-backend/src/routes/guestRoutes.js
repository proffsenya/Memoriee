const router = require('express').Router();
const { getEventForGuest, uploadGuestPhoto, getGuestUsage } = require('../controllers/guestController');
const upload = require('../middleware/uploadMiddleware');

router.get('/event/:eventId', getEventForGuest);
router.post('/upload', upload.single('photo'), uploadGuestPhoto);
router.get('/usage/:eventId/:guestId', getGuestUsage);

module.exports = router;