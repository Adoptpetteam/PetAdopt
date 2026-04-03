const Pet = require('../models/Pet');
const User = require('../models/User');
const AdoptionRequest = require('../models/AdoptionRequest');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      Pet.countDocuments({ status: 'available' }),
      Pet.countDocuments({ status: { $in: ['pending', 'reserved'] } }),
      User.countDocuments(),

     AdoptionRequest.countDocuments({ status: 'pending' }),

      AdoptionRequest.countDocuments({ status: { $in: ['pending_payment', 'paid'] } }),

      AdoptionRequest.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'admin' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        availablePets: stats[0],
        pendingPets: stats[1],
        totalUsers: stats[2],
        pendingRequests: stats[3],
        approvedRequests: stats[4],
        totalAdmins: stats[5]
      }
    });
  } catch (error) {
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

module.exports = {
  getDashboardStats,
  getAllPetsAdmin,
  approvePet,
  rejectPet,
  banUser,
  unbanUser,
  getAllUsers
};
