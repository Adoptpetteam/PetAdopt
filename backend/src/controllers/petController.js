const Pet = require('../models/Pet');

// CREATE PET
exports.createPet = async (req, res, next) => {
  try {
    const {
      name, species, breed, age, gender, size, color,
      description, healthStatus, vaccinated, neutered,
      adoptionFee, location, categoryId
    } = req.body;

    // ✅ validate cơ bản
    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: 'Tên và loài thú cưng là bắt buộc'
      });
    }

    // ✅ tránh crash nếu chưa login
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập'
      });
    }

    // ✅ handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
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
      categoryId: categoryId || null,
      images,
      createdBy: req.user.userId
    });

    await pet.save();

    res.status(201).json({
      success: true,
      message: 'Tạo thú cưng thành công!',
      data: pet
    });

  } catch (error) {
    console.error("CREATE PET ERROR:", error); // 🔥 cực quan trọng để debug
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL
exports.getAllPets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pets = await Pet.find()
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments();

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });

  } catch (error) {
    console.error("GET PETS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BY ID (fix duplicate)
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
    console.error("GET PET ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    Object.assign(pet, req.body);

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
      pet.images = [...(pet.images || []), ...uploadedImages];
    }

    await pet.save();

    res.json({
      success: true,
      message: 'Cập nhật thành công!',
      data: pet
    });

  } catch (error) {
    console.error("UPDATE PET ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
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
      message: 'Xóa thành công!'
    });

  } catch (error) {
    console.error("DELETE PET ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};