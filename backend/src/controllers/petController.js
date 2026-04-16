const Pet = require('../models/Pet');

// CREATE
exports.createPet = async (req, res, next) => {
  try {
    const { name, species, ...rest } = req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: 'Tên và loài thú cưng là bắt buộc'
      });
    }

    const pet = new Pet({
      name,
      species,
      ...rest,
      createdBy: req.user?.userId || req.user?.id
    });

    await pet.save();

    res.status(201).json({
      success: true,
      message: 'Tạo thú cưng thành công!',
      data: pet
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
exports.getAllPets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const filter = {};

    if (filters.species) filter.species = filters.species;
    if (filters.status) filter.status = filters.status;
    if (filters.gender) filter.gender = filters.gender;
    if (filters.size) filter.size = filters.size;

    if (filters.minAge || filters.maxAge) {
      filter.age = {};
      if (filters.minAge) filter.age.$gte = +filters.minAge;
      if (filters.maxAge) filter.age.$lte = +filters.maxAge;
    }

    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { breed: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const pets = await Pet.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments(filter);

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
exports.getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      createdBy: req.user?.userId || req.user?.id
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoặc không có quyền'
      });
    }

    Object.keys(req.body).forEach(key => {
      pet[key] = req.body[key];
    });

    await pet.save();

    res.json({
      success: true,
      message: 'Cập nhật thành công!',
      data: pet
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      createdBy: req.user?.userId || req.user?.id
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoặc không có quyền'
      });
    }

    await pet.deleteOne();

    res.json({
      success: true,
      message: 'Xóa thành công!'
    });
  } catch (error) {
    next(error);
  }
};
