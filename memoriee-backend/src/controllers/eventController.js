const Event = require('../models/Event');
const Photo = require('../models/Photo');
const GuestUsage = require('../models/GuestUsage');
const { Op } = require('sequelize');

const PRESET_FILTERS = {
  'warm': {
    filterType: 'warm',
    brightness: 1.0,
    contrast: 1.05,
    saturation: 1.1,
    hue: 0,
    warmth: 15,
    tint: 5,
    fade: 0,
    vignette: 0
  },
  'bw': {
    filterType: 'bw',
    brightness: 1.0,
    contrast: 1.15,
    saturation: 0,
    hue: 0,
    warmth: 0,
    tint: 0,
    fade: 5,
    vignette: 0
  },
  'vintage': {
    filterType: 'vintage',
    brightness: 0.95,
    contrast: 0.9,
    saturation: 0.85,
    hue: 10,
    warmth: 10,
    tint: 8,
    fade: 15,
    vignette: 10
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, date, category, filter, filterId, filterParams, filters, plan, extraPhotos, photosPerGuest, guestCount } = req.body;
    
    // Для плана используем maxPhotos + extraPhotos, для обычного события guestCount * photosPerGuest
    let totalPhotos, finalFilterParams, eventFilters;
    
    if (plan && filters) {
      // Это план с несколькими фильтрами
      const planMaxPhotos = {
        'Свадебный': 200,
        'Праздничный': 400,
        'Премиум': 500
      };
      totalPhotos = (planMaxPhotos[plan] || 200) + (extraPhotos || 0);
      eventFilters = filters;
      finalFilterParams = null;
    } else {
      // Это обычное событие с одним фильтром
      totalPhotos = guestCount * photosPerGuest;
      finalFilterParams = filterParams || PRESET_FILTERS[filter] || PRESET_FILTERS['warm'];
      eventFilters = null;
    }
    
    const event = await Event.create({
      name, 
      date, 
      category, 
      filter: filter || 'warm',
      filterId: filterId || filter || 'warm',
      filterParams: finalFilterParams,
      filters: eventFilters,
      plan: plan || null,
      extraPhotos: extraPhotos || 0,
      photosPerGuest, 
      guestCount, 
      totalPhotos,
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
    
    const { filterId, filterParams, ...otherData } = req.body;
    const updateData = { ...otherData };
    
    if (filterParams) {
      updateData.filterParams = filterParams;
    }
    if (filterId) {
      updateData.filterId = filterId;
    }
    
    await event.update(updateData);
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