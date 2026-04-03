const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');

exports.createAdoptionRequest = async (req, res, next) => {
  try {
    const petId = req.body.petId;
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim();
    const address = req.body.address?.trim();
    const reason = req.body.reason?.trim();

    if (!petId || !name || !phone || !address || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc cho đơn nhận nuôi'
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Thú cưng này hiện chưa sẵn sàng nhận nuôi'
      });
    }

    const existingRequest = await AdoptionRequest.findOne({
      petId,
      user: req.user.userId,
      status: { $in: ['pending_payment', 'paid', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã gửi đơn nhận nuôi cho thú cưng này rồi'
      });
    }

    const adoptionRequest = await AdoptionRequest.create({
      petId,
      user: req.user.userId,
      name,
      phone,
      address,
      reason,
      petName: pet.name,
      status: req.body.status || 'pending_payment'
    });

    pet.status = 'reserved';
    await pet.save();

    return res.status(201).json({
      success: true,
      message: 'Gửi đơn nhận nuôi thành công',
      data: adoptionRequest
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyAdoptionRequests = async (req, res, next) => {
  try {
    const requests = await AdoptionRequest.find({ user: req.user.userId })
      .populate('petId', 'name age gender images species neutered color status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelMyAdoptionRequest = async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (!['pending_payment', 'paid'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn chưa được xử lý'
      });
    }

    request.status = 'cancelled';
    await request.save();

    const pet = await Pet.findById(request.petId);
    if (pet && pet.status === 'reserved') {
      pet.status = 'available';
      await pet.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Đã hủy đơn nhận nuôi'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAdoptionRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const currentLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (currentPage - 1) * currentLimit;

    const total = await AdoptionRequest.countDocuments(filter);

    const requests = await AdoptionRequest.find(filter)
      .populate('petId', 'name age gender images species neutered color status')
      .populate('user', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        pages: Math.ceil(total / currentLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.processAdoptionRequest = async (req, res, next) => {
  try {
    const { action, adminNote = '' } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action không hợp lệ'
      });
    }

    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (!['pending_payment', 'paid'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Đơn này đã được xử lý trước đó'
      });
    }

    request.status = action;
    request.adminNote = adminNote;
    request.processedAt = new Date();
    request.processedBy = req.user.userId;
    await request.save();

    const pet = await Pet.findById(request.petId);
    if (pet) {
      pet.status = action === 'approved' ? 'adopted' : 'available';
      await pet.save();
    }

    return res.status(200).json({
      success: true,
      message: `Đã ${action === 'approved' ? 'duyệt' : 'từ chối'} đơn nhận nuôi`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};