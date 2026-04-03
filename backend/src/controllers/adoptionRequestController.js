const mongoose = require('mongoose');
const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createAdoptionRequest = async (req, res, next) => {
  try {
    const { petId, name, phone, email = '', address, reason, donationType = '', certificateType = '' } = req.body;

    if (!petId || !name?.trim() || !phone?.trim() || !address?.trim() || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc cho đơn nhận nuôi'
      });
    }

    if (!isValidObjectId(petId)) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID không hợp lệ'
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    const adoptionRequest = await AdoptionRequest.create({
      petId,
      user: req.user?.userId || null,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      address: address.trim(),
      reason: reason.trim(),
      petName: pet.name,
      donationType,
      certificateType,
      status: req.body.status || 'submitted'
    });

    if (pet.status === 'available') {
      pet.status = 'reserved';
      await pet.save();
    }

    return res.status(201).json(adoptionRequest);
  } catch (error) {
    next(error);
  }
};

exports.getAllAdoptionRequests = async (_req, res, next) => {
  try {
    const requests = await AdoptionRequest.find().sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

exports.getAdoptionRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const request = await AdoptionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nhận nuôi' });
    }

    return res.json(request);
  } catch (error) {
    next(error);
  }
};

exports.updateAdoptionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const request = await AdoptionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nhận nuôi' });
    }

    const fields = ['name', 'phone', 'email', 'address', 'reason', 'donationType', 'certificateType', 'status', 'adminNote'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) request[field] = req.body[field];
    });

    if (req.body.status && ['approved', 'rejected', 'cancelled'].includes(req.body.status)) {
      request.processedAt = new Date();
      request.processedBy = req.user?.userId || null;
    }

    await request.save();

    const pet = await Pet.findById(request.petId);
    if (pet) {
      if (request.status === 'approved') pet.status = 'adopted';
      else if (['rejected', 'cancelled', 'submitted', 'pending_payment', 'paid'].includes(request.status)) {
        if (pet.status !== 'adopted') pet.status = 'available';
      }
      await pet.save();
    }

    return res.json(request);
  } catch (error) {
    next(error);
  }
};

exports.deleteAdoptionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const request = await AdoptionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nhận nuôi' });
    }

    const pet = await Pet.findById(request.petId);
    if (pet && pet.status === 'reserved') {
      pet.status = 'available';
      await pet.save();
    }

    await request.deleteOne();
    return res.json({ success: true, message: 'Xóa đơn nhận nuôi thành công' });
  } catch (error) {
    next(error);
  }
};
