const Filter = require('../models/Filter');

// Preset filters
const PRESET_FILTERS = [
  {
    name: 'Тёплый',
    description: 'Тёплый и уютный тон',
    type: 'preset',
    params: {
      filterType: 'warm',
      brightness: 1.0,
      contrast: 1.05,
      saturation: 1.1,
      hue: 0,
      warmth: 15,
      tint: 5,
      fade: 0,
      vignette: 0
    }
  },
  {
    name: 'Чёрное и белое',
    description: 'Классический чёрно-белый стиль',
    type: 'preset',
    params: {
      filterType: 'bw',
      brightness: 1.0,
      contrast: 1.15,
      saturation: 0,
      hue: 0,
      warmth: 0,
      tint: 0,
      fade: 5,
      vignette: 0
    }
  },
  {
    name: 'Ретро',
    description: 'Винтажный киноэффект',
    type: 'preset',
    params: {
      filterType: 'vintage',
      brightness: 0.95,
      contrast: 0.9,
      saturation: 0.85,
      hue: 10,
      warmth: 10,
      tint: 8,
      fade: 15,
      vignette: 25
    }
  },
  {
    name: 'Холодный',
    description: 'Холодный и чистый тон',
    type: 'preset',
    params: {
      filterType: 'cool',
      brightness: 1.05,
      contrast: 1.1,
      saturation: 1.0,
      hue: -5,
      warmth: -15,
      tint: -8,
      fade: 0,
      vignette: 0
    }
  },
  {
    name: 'Сепия',
    description: 'Эффект сепии',
    type: 'preset',
    params: {
      filterType: 'sepia',
      brightness: 1.0,
      contrast: 1.0,
      saturation: 0.6,
      hue: 25,
      warmth: 20,
      tint: 10,
      fade: 20,
      vignette: 15
    }
  }
];

exports.getPresets = async (req, res) => {
  try {
    res.json(PRESET_FILTERS);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserFilters = async (req, res) => {
  try {
    const filters = await Filter.findAll({ 
      where: { userId: req.userId, type: 'custom' },
      order: [['createdAt', 'DESC']]
    });
    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFilters = async (req, res) => {
  try {
    const userFilters = await Filter.findAll({ 
      where: { userId: req.userId, type: 'custom' },
      order: [['createdAt', 'DESC']]
    });
    
    const allFilters = [
      ...PRESET_FILTERS.map(f => ({ ...f, id: f.name.toLowerCase() })),
      ...userFilters
    ];
    
    res.json(allFilters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFilter = async (req, res) => {
  try {
    const { name, description, params } = req.body;
    const filter = await Filter.create({
      name,
      description,
      params,
      type: 'custom',
      userId: req.userId
    });
    res.status(201).json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFilterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a preset
    const preset = PRESET_FILTERS.find(f => f.name.toLowerCase() === id.toLowerCase());
    if (preset) {
      return res.json({ ...preset, id });
    }
    
    const filter = await Filter.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }
    
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, params } = req.body;
    
    const filter = await Filter.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }
    
    await filter.update({
      name,
      description,
      params
    });
    
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFilter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const filter = await Filter.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }
    
    await filter.destroy();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
