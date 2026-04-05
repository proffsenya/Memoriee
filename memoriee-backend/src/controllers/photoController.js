const Photo = require('../models/Photo');
const Event = require('../models/Event');
const fs = require('fs').promises;

exports.getEventPhotos = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.eventId, userId: req.userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const photos = await Photo.findAll({ where: { eventId: req.params.eventId }, order: [['createdAt', 'ASC']] });
    // преобразуем url в полный путь для клиента
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photosWithUrl = photos.map(p => ({ ...p.toJSON(), url: `${baseUrl}/${p.url}` }));
    res.json(photosWithUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({ where: { id: req.params.id } });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const event = await Event.findOne({ where: { id: photo.eventId, userId: req.userId } });
    if (!event) return res.status(403).json({ error: 'Forbidden' });
    await fs.unlink(photo.url).catch(() => {});
    await photo.destroy();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAllPhotos = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.eventId, userId: req.userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const photos = await Photo.findAll({ where: { eventId: req.params.eventId } });
    for (const photo of photos) {
      await fs.unlink(photo.url).catch(() => {});
    }
    await Photo.destroy({ where: { eventId: req.params.eventId } });
    await GuestUsage.destroy({ where: { eventId: req.params.eventId } });
    res.json({ message: 'All photos deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};