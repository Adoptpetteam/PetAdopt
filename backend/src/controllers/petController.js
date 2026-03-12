const Pet = require('../models/Pet');

exports.createPet = async (req, res, next) => {
  try {
    const {
      name, species, breed, age, gender, size, color,
      description, healthStatus, vaccinated, neutered,
      adoptionFee, location
    } = req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: 'Tên và loài thú cưng là bắt buộc'
      });
    }

    const pet = new Pet({
      name,
      species,
      breed,
      age,
      gender,
      size,
      color,
      description,
      healthStatus,
      vaccinated,
      neutered,
      adoptionFee,
      location,
      createdBy: req.user.userId  
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

exports.getAllPets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      species,
      status,
      gender,
      size,
      minAge,
      maxAge,
      search
    } = req.query;

    const filter = {};

    if (species) filter.species = species;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (size) filter.size = size;
    
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Pet.countDocuments(filter);

    const pets = await Pet.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
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

exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    const allowedFields = [
      'name', 'species', 'breed', 'age', 'gender', 'size', 'color',
      'description', 'healthStatus', 'vaccinated', 'neutered',
      'status', 'adoptionFee', 'location'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        pet[field] = req.body[field];
      }
    });

    await pet.save();

    res.json({
      success: true,
      message: 'Cập nhật thú cưng thành công!',
      data: pet
    });
  } catch (error) {
    next(error);  
  }
};

exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    await pet.deleteOne();

    res.json({
      success: true,
      message: 'Xóa thú cưng thành công!'
    });
  } catch (error) {
    next(error);  
  }
};
