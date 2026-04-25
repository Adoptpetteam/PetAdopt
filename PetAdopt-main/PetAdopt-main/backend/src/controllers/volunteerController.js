const mongoose = require('mongoose');
const VolunteerApplication = require('../models/VolunteerApplication');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createVolunteer = async (req, res, next) => {
  try {
    const { name, email, phone, age, experience = '', availability = '', reason, status = 'pending_review' } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và lý do tham gia'
      });
    }

    const application = await VolunteerApplication.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: age !== undefined && age !== '' ? Number(age) : undefined,
      experience,
      availability,
      reason: reason.trim(),
      status
    });

    return res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

exports.getVolunteers = async (_req, res, next) => {
  try {
    const volunteers = await VolunteerApplication.find().sort({ createdAt: -1 });
    return res.json(volunteers);
  } catch (error) {
    next(error);
  }
};

exports.getVolunteerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const volunteer = await VolunteerApplication.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tình nguyện viên' });
    }

    return res.json(volunteer);
  } catch (error) {
    next(error);
  }
};

exports.updateVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const volunteer = await VolunteerApplication.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tình nguyện viên' });
    }

    const fields = ['name', 'email', 'phone', 'age', 'experience', 'availability', 'reason', 'status', 'adminNote', 'interviewAt', 'interviewLocation'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) volunteer[field] = req.body[field];
    });

    if (req.body.status && ['approved', 'rejected'].includes(req.body.status)) {
      volunteer.reviewedAt = new Date();
    }

    await volunteer.save();
    return res.json(volunteer);
  } catch (error) {
    next(error);
  }
};

exports.deleteVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const volunteer = await VolunteerApplication.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tình nguyện viên' });
    }

    await volunteer.deleteOne();
    return res.json({ success: true, message: 'Xóa tình nguyện viên thành công' });
  } catch (error) {
    next(error);
  }
};
