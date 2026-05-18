import Automation from '../models/automation.model.js';

export const getAutomations = async (req, res) => {
  try {
    const { search, enabled, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (enabled !== undefined) filter.enabled = enabled === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { trigger: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Automation.countDocuments(filter);
    const automations = await Automation.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, automations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id).populate('createdBy', 'name email');
    if (!automation) return res.status(404).json({ success: false, message: 'Automation not found' });
    res.json({ success: true, automation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAutomation = async (req, res) => {
  try {
    const automation = await Automation.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, automation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAutomation = async (req, res) => {
  try {
    const automation = await Automation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!automation) return res.status(404).json({ success: false, message: 'Automation not found' });
    res.json({ success: true, automation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleAutomation = async (req, res) => {
  try {
    const automation = await Automation.findByIdAndUpdate(
      req.params.id,
      { enabled: Boolean(req.body.enabled) },
      { new: true }
    );
    if (!automation) return res.status(404).json({ success: false, message: 'Automation not found' });
    res.json({ success: true, automation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findByIdAndDelete(req.params.id);
    if (!automation) return res.status(404).json({ success: false, message: 'Automation not found' });
    res.json({ success: true, message: 'Automation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
