const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { createEvent, getUserEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');

router.use(auth);
router.post('/', createEvent);
router.get('/', getUserEvents);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;