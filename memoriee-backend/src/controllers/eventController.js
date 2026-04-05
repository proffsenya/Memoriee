const Event = require('../models/Event');
const Photo = require('../models/Photo');
const GuestUsage = require('../models/GuestUsage');
const { Op } = require('sequelize');

exports.createEvent = async (req, res) => {
  try {
    const { name, date, category, filter, photosPerGuest, guestCount } = req.body;
    const totalPhotos = guestCount * photosPerGuest;
    const event = await Event.create({
      name, date, category, filter, photosPerGuest, guestCount, totalPhotos,
      userId: req.userId,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    await event.update(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    // удаляем связанные фото с диска
    const photos = await Photo.findAll({ where: { eventId: event.id } });
    const fs = require('fs').promises;
    for (const photo of photos) {
      await fs.unlink(photo.url).catch(() => {});
    }
    await Photo.destroy({ where: { eventId: event.id } });
    await GuestUsage.destroy({ where: { eventId: event.id } });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};