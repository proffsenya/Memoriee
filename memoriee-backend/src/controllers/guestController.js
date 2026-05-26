const Event = require('../models/Event');
const Photo = require('../models/Photo');
const GuestUsage = require('../models/GuestUsage');
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs').promises;

exports.getEventForGuest = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId, { 
      attributes: ['id', 'name', 'filter', 'filterId', 'filterParams', 'filters', 'plan', 'photosPerGuest'] 
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Если есть массив фильтров (план), возвращаем его
    // Если нет - возвращаем filterParams (обычное событие)
    const response = {
      id: event.id,
      name: event.name,
      filter: event.filter,
      filterId: event.filterId,
      photosPerGuest: event.photosPerGuest,
      plan: event.plan,
    };
    
    if (event.filters && event.filters.length > 0) {
      response.filters = event.filters;
    } else {
      response.filterParams = event.filterParams;
    }
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadGuestPhoto = async (req, res) => {
  try {
    const { eventId, guestId, guestName } = req.body;
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Проверка общего лимита события
    if (event.usedPhotos >= event.totalPhotos) {
      return res.status(400).json({ error: 'Общий лимит фото для события исчерпан' });
    }

    let usage = await GuestUsage.findOne({ where: { eventId, guestId } });
    if (!usage) usage = await GuestUsage.create({ eventId, guestId, count: 0 });
    if (usage.count >= event.photosPerGuest) {
      return res.status(400).json({ error: 'Ваш личный лимит фото исчерпан' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `uploads/${req.file.filename}`;
    const photo = await Photo.create({
      url: fileUrl,
      eventId,
      guestId,
      guestName,
      capturedAt: new Date(),
    });
    await usage.update({ count: usage.count + 1 });
    await event.update({ usedPhotos: event.usedPhotos + 1 });

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}/${fileUrl}`;
    res.status(201).json({ ...photo.toJSON(), url: fullUrl });
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