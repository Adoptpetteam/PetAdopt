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
      images = req.files.map(file => `/uploads/pets/${file.filename}`);
      console.log('[Pet Create] Uploaded images:', images);
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
    const { page = 1, limit = 10, species, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (species) query.species = species;
    if (status) query.status = status;

    const pets = await Pet.find(query)
      .populate('createdBy', 'name email')
      .populate('categoryId', 'name description image type')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments(query);

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
    console.log('=== UPDATE PET ===');
    console.log('Pet ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Files:', req.files?.length || 0);

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    // Xử lý existingImages từ frontend
    let finalImages = [];
    
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        finalImages = Array.isArray(existingImages) ? existingImages : [];
        console.log('Existing images:', finalImages.length);
      } catch (e) {
        console.error('Error parsing existingImages:', e);
        finalImages = pet.images || [];
      }
    } else {
      // Nếu không có existingImages, giữ nguyên ảnh cũ
      finalImages = pet.images || [];
    }

    // Thêm ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => `/uploads/pets/${file.filename}`);
      finalImages = [...finalImages, ...uploadedImages];
      console.log('[Pet Update] New images added:', uploadedImages.length);
      console.log('[Pet Update] New image paths:', uploadedImages);
    }

    // Cập nhật các field khác (KHÔNG ghi đè createdBy)
    const updateData = { ...req.body };
    delete updateData.existingImages;
    delete updateData.createdBy; // Không cho phép thay đổi người tạo
    delete updateData._id; // Không cho phép thay đổi ID
    delete updateData.createdAt; // Không cho phép thay đổi ngày tạo
    
    // Cập nhật từng field
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
        pet[key] = updateData[key];
      }
    });
    
    pet.images = finalImages;

    console.log('Saving pet...');
    await pet.save();
    console.log('Pet updated successfully');

    res.json({
      success: true,
      message: 'Cập nhật thành công!',
      data: pet
    });

  } catch (error) {
    console.error("UPDATE PET ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi cập nhật thú cưng'
    });
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
