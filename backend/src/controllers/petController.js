const Category = require('../models/Category');
const mongoose = require('mongoose');
const Pet = require('../models/Pet');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canManagePet = (pet, user) => {
  if (!user) return true;
  if (!pet.createdBy) return true;
  return String(pet.createdBy) === String(user.userId) || user.role === 'admin';
};

const canViewPet = (_pet, _user) => true;

const normalizeGender = (value) => {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (['male', 'm', 'duc', 'đực', 'boy'].includes(normalized)) return 'male';
  if (['female', 'f', 'cai', 'cái', 'girl'].includes(normalized)) return 'female';
  return 'unknown';
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizePetPayload = (body = {}) => ({
  name: body.name !== undefined ? body.name.toString().trim() : undefined,
  age: body.age !== undefined && body.age !== '' ? Number(body.age) : undefined,
  gender: body.gender !== undefined ? normalizeGender(body.gender) : undefined,
  image: body.image !== undefined ? body.image.toString().trim() : undefined,
  type: body.type !== undefined ? body.type.toString().trim().toLowerCase() : undefined,
  category: body.category !== undefined ? body.category.toString().trim() : undefined,
  sterilized: body.sterilized !== undefined ? toBoolean(body.sterilized) : undefined,
  vaccinated: body.vaccinated !== undefined ? toBoolean(body.vaccinated) : undefined,
  color: body.color !== undefined ? body.color.toString().trim() : undefined,
  description: body.description !== undefined ? body.description.toString().trim() : undefined,
  status: body.status !== undefined ? body.status.toString().trim() : undefined,
  adminNote: body.adminNote !== undefined ? body.adminNote.toString().trim() : undefined
});

exports.createPet = async (req, res, next) => {
  try {
    const payload = normalizePetPayload(req.body);

    if (!payload.name || !payload.category) {
      return res.status(400).json({
        success: false,
        message: 'Tên và danh mục thú cưng là bắt buộc'
      });
    }

    if (!isValidObjectId(payload.category)) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục không hợp lệ'
      });
    }

    const categoryExists = await Category.findById(payload.category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Danh mục không tồn tại'
      });
    }

    const pet = await Pet.create({
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      image: payload.image,
      type: payload.type || categoryExists.name?.toString().trim().toLowerCase() || '',
      category: payload.category,
      sterilized: payload.sterilized,
      vaccinated: payload.vaccinated,
      color: payload.color,
      description: payload.description,
      status: payload.status || 'available',
      createdBy: req.user?.userId || null,
      adminNote: payload.adminNote || ''
    });

    const createdPet = await Pet.findById(pet._id)
      .populate('createdBy', 'name email')
      .populate('category', 'name status');

    return res.status(201).json(createdPet);
  } catch (error) {
    next(error);
  }
};

exports.getAllPets = async (req, res, next) => {
  try {
    const {
      status,
      gender,
      minAge,
      maxAge,
      search,
      color,
      sterilized,
      vaccinated,
      type,
      category
    } = req.query;

    const filter = {};

    if (type) filter.type = type.toString().trim().toLowerCase();
    if (gender) filter.gender = normalizeGender(gender);
    if (color) filter.color = { $regex: color.toString().trim(), $options: 'i' };
    if (sterilized !== undefined) filter.sterilized = toBoolean(sterilized);
    if (vaccinated !== undefined) filter.vaccinated = toBoolean(vaccinated);
    if (status) filter.status = status;

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục không hợp lệ'
        });
      }
      filter.category = category;
    }

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge !== undefined) filter.age.$gte = parseInt(minAge, 10);
      if (maxAge !== undefined) filter.age.$lte = parseInt(maxAge, 10);
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { color: { $regex: search.trim(), $options: 'i' } },
        { type: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pets = await Pet.find(filter)
      .populate('createdBy', 'name email')
      .populate('category', 'name status')
      .sort({ createdAt: -1 });

    return res.json(pets);
  } catch (error) {
    next(error);
  }
};

exports.getPetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Pet id không hợp lệ'
      });
    }

    const pet = await Pet.findById(id)
      .populate('createdBy', 'name email')
      .populate('category', 'name status');

    if (!pet || !canViewPet(pet, req.user)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    return res.json(pet);
  } catch (error) {
    next(error);
  }
};

exports.updatePet = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Pet id không hợp lệ'
      });
    }

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    if (!canManagePet(pet, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật thú cưng này'
      });
    }

    const payload = normalizePetPayload(req.body);

    if (payload.category !== undefined) {
      if (!isValidObjectId(payload.category)) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục không hợp lệ'
        });
      }

      const categoryExists = await Category.findById(payload.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục không tồn tại'
        });
      }

      if (!payload.type || !payload.type.trim()) {
        payload.type = categoryExists.name?.toString().trim().toLowerCase() || '';
      }
    }

    const allowedFields = [
      'name',
      'age',
      'gender',
      'image',
      'type',
      'category',
      'sterilized',
      'vaccinated',
      'color',
      'description',
      'status',
      'adminNote'
    ];

    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) pet[field] = payload[field];
    });

    await pet.save();

    const updatedPet = await Pet.findById(pet._id)
      .populate('createdBy', 'name email')
      .populate('category', 'name status');

    return res.json(updatedPet);
  } catch (error) {
    next(error);
  }
};

exports.deletePet = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Pet id không hợp lệ'
      });
    }

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thú cưng'
      });
    }

    if (!canManagePet(pet, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thú cưng này'
      });
    }

    await pet.deleteOne();
    return res.json({ success: true, message: 'Xóa thú cưng thành công' });
  } catch (error) {
    next(error);
  }
};
