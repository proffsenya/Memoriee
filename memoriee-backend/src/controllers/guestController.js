const Event = require('../models/Event');
const Photo = require('../models/Photo');
const GuestUsage = require('../models/GuestUsage');
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs').promises;

exports.getEventForGuest = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId, { attributes: ['id', 'name', 'filter', 'photosPerGuest'] });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadGuestPhoto = async (req, res) => {
  try {
    const { eventId, guestId } = req.body;
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    let usage = await GuestUsage.findOne({ where: { eventId, guestId } });
    if (!usage) usage = await GuestUsage.create({ eventId, guestId, count: 0 });
    if (usage.count >= event.photosPerGuest) {
      return res.status(400).json({ error: 'Limit exceeded' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `uploads/${req.file.filename}`;
    const photo = await Photo.create({ url: fileUrl, eventId, guestId });
    await usage.update({ count: usage.count + 1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({ ...photo.toJSON(), url: `${baseUrl}/${fileUrl}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuestUsage = async (req, res) => {
  try {
    const { eventId, guestId } = req.params;
    const usage = await GuestUsage.findOne({ where: { eventId, guestId } });
    const event = await Event.findByPk(eventId);
    const remaining = event ? Math.max(0, event.photosPerGuest - (usage?.count || 0)) : 0;
    res.json({ remaining });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};