const Pet = require('../models/Pet');
const User = require('../models/User');
const AdoptionRequest = require('../models/AdoptionRequest');
const Supporter = require('../models/Supporter');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Get Volunteer model
const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number },
  experience: { type: String },
  availability: { type: String },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true }));

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Thú cưng
      Pet.countDocuments({ status: 'available' }),
      Pet.countDocuments({ status: { $in: ['pending', 'reserved'] } }),
      Pet.countDocuments(),
      
      // Người dùng
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      
      // Nhận nuôi
      AdoptionRequest.countDocuments({ status: 'pending' }),
      AdoptionRequest.countDocuments({ status: 'approved' }),
      AdoptionRequest.countDocuments(),
      
      // Tình nguyện viên
      Volunteer.countDocuments({ status: 'approved' }),
      Volunteer.countDocuments({ status: 'pending' }),
      Volunteer.countDocuments(),
      
      // Người ủng hộ
      Supporter.countDocuments({ status: 'completed' }),
      Supporter.countDocuments({ status: 'pending' }),
      Supporter.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalDonationAmount = stats[13].length > 0 ? stats[13][0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        // Thú cưng
        availablePets: stats[0],
        pendingPets: stats[1],
        totalPets: stats[2],
        
        // Người dùng
        totalUsers: stats[3],
        totalAdmins: stats[4],
        
        // Nhận nuôi
        pendingAdoptions: stats[5],
        approvedAdoptions: stats[6],
        totalAdoptions: stats[7],
        
        // Tình nguyện viên
        approvedVolunteers: stats[8],
        pendingVolunteers: stats[9],
        totalVolunteers: stats[10],
        
        // Người ủng hộ
        totalSupporters: stats[11],
        pendingSupporters: stats[12],
        totalDonationAmount: totalDonationAmount
      }
    });
  } catch (error) {
    console.error('[Dashboard Stats] Error:', error);
    next(error);
  }
};

exports.getAllPetsAdmin = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, status, species, search
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (species) filter.species = species;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Pet.countDocuments(filter);

    const pets = await Pet.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.approvePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng!'
      });
    }

    pet.status = 'available';
    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Duyệt thú cưng thành công!',
      data: pet
    });
  } catch (error) {
    next(error);
  }
};


exports.rejectPet = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng!'
      });
    }

    pet.status = 'rejected';
    pet.adminNote = reason || 'Không đạt yêu cầu';
    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Từ chối thú cưng thành công!',
      data: pet
    });
  } catch (error) {
    next(error);
  }
};


exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user!'
      });
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã cấm user ${user.name}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};


exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user!'
      });
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã gỡ cấm user ${user.name}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, role, search, banned
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (banned !== undefined) filter.isBanned = banned === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -twoFASecret')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for admin
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Admin Orders] Error:', error);
    next(error);
  }
};

// Get all adoptions for admin
exports.getAllAdoptionsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AdoptionRequest.countDocuments(filter);

    const adoptions = await AdoptionRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('pet', 'name species breed age')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: adoptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Admin Adoptions] Error:', error);
    next(error);
  }
};

