// =============================================
// ATTENDANCE CONTROLLER
// =============================================

import Attendance from '../models/attendance.model.js';

export const clockIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ user: req.user._id, date: today });
    if (existing?.clockIn) return res.status(400).json({ success: false, message: 'Already clocked in today' });

    const attendance = existing
      ? Object.assign(existing, { clockIn: new Date(), status: 'present' })
      : new Attendance({ user: req.user._id, date: today, clockIn: new Date(), status: 'present' });

    await attendance.save();
    res.json({ success: true, message: 'Clocked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    if (!attendance?.clockIn) return res.status(400).json({ success: false, message: 'No clock-in found for today' });
    if (attendance.clockOut) return res.status(400).json({ success: false, message: 'Already clocked out today' });

    attendance.clockOut = new Date();
    attendance.totalHours = parseFloat(((attendance.clockOut - attendance.clockIn) / 3600000).toFixed(2));
    await attendance.save();

    res.json({ success: true, message: 'Clocked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitEOD = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: today },
      { eodReport: { ...req.body, submittedAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'EOD report submitted', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { userId, month, year, page = 1, limit = 31 } = req.query;
    const filter = {};

    const targetUser = req.user.role === 'employee' ? req.user._id : (userId || req.user._id);
    filter.user = targetUser;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('user', 'name avatar department')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Compute summary
    const summary = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      leave: records.filter(r => r.status === 'leave').length,
      totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2),
    };

    res.json({ success: true, records, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ date: today })
      .populate('user', 'name avatar department position');

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEodReports = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    since.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      date: { $gte: since },
      'eodReport.submittedAt': { $exists: true },
    })
      .populate('user', 'name avatar department position')
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
