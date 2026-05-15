const VaccinationSchedule = require('../models/VaccinationSchedule');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendVaccinationReminder, sendVaccinationConfirmation } = require('../utils/emailService');

// ===============================
// GET /api/vaccinations/me - Lấy lịch tiêm của user
// ===============================
exports.getMyVaccinations = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('Getting vaccinations for user:', userId);

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { owner: userId };
    
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await VaccinationSchedule.countDocuments(filter);
    
    const schedules = await VaccinationSchedule.find(filter)
      .populate('pet', 'name breed age images')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    console.log('Found vaccinations:', schedules.length);

    return res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Error in getMyVaccinations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// POST /api/vaccinations - Tạo lịch tiêm mới
// ===============================
exports.createVaccination = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('Creating vaccination for user:', userId);
    console.log('Request body:', req.body);

    const {
      petId,
      vaccineName,
      vaccineType,
      scheduledDate,
      description,
      veterinarian,
      doseNumber,
      totalDoses
    } = req.body;

    // Validate required fields
    if (!petId || !vaccineName || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Pet ID, vaccine name và scheduled date là bắt buộc'
      });
    }

    // Kiểm tra pet có tồn tại không
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thú cưng' });
    }

    console.log('Found pet:', pet.name);

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    console.log('Found user:', user.name);

    // Kiểm tra user có quyền tạo lịch tiêm cho pet này không (đã nhận nuôi)
    const AdoptionRequest = require('../models/AdoptionRequest');
    const adoption = await AdoptionRequest.findOne({
      user: userId,
      pet: petId,
      status: 'approved'
    });

    if (!adoption) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn chỉ có thể tạo lịch tiêm cho thú cưng đã nhận nuôi' 
      });
    }

    console.log('User has adopted this pet');

    // Tạo lịch tiêm mới
    const vaccination = await VaccinationSchedule.create({
      pet: petId,
      petName: pet.name,
      owner: userId,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone || '',
      vaccineName,
      vaccineType: vaccineType || 'basic',
      scheduledDate: new Date(scheduledDate),
      description: description || '',
      veterinarian: veterinarian || {},
      doseNumber: doseNumber || 1,
      totalDoses: totalDoses || 1
    });

    console.log('Created vaccination:', vaccination._id);

    // Populate để trả về đầy đủ thông tin
    const populatedVaccination = await VaccinationSchedule.findById(vaccination._id)
      .populate('pet', 'name breed age images');

    // Gửi email xác nhận
    try {
      await sendVaccinationConfirmation(user.email, {
        ownerName: user.name,
        petName: pet.name,
        vaccineName,
        scheduledDate: new Date(scheduledDate),
        veterinarian: veterinarian || {}
      });
      console.log('Confirmation email sent');
    } catch (emailErr) {
      console.error('Failed to send vaccination confirmation email:', emailErr);
      // Không fail request nếu email lỗi
    }

    return res.status(201).json({
      success: true,
      message: 'Đã tạo lịch tiêm phòng thành công',
      data: populatedVaccination
    });
  } catch (err) {
    console.error('Error in createVaccination:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/vaccinations/:id - Cập nhật lịch tiêm
// ===============================
exports.updateVaccination = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    // Tìm lịch tiêm
    const vaccination = await VaccinationSchedule.findOne({ _id: id, owner: userId });
    if (!vaccination) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }

    // Cập nhật
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        vaccination[key] = updates[key];
      }
    });

    await vaccination.save();

    const updatedVaccination = await VaccinationSchedule.findById(vaccination._id)
      .populate('pet', 'name breed age images');

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật lịch tiêm thành công',
      data: updatedVaccination
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// PUT /api/vaccinations/:id/complete - Đánh dấu hoàn thành
// ===============================
exports.completeVaccination = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { completedDate, notes } = req.body;

    const vaccination = await VaccinationSchedule.findOne({ _id: id, owner: userId });
    if (!vaccination) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }

    vaccination.status = 'completed';
    vaccination.completedDate = completedDate ? new Date(completedDate) : new Date();
    if (notes) vaccination.notes = notes;

    await vaccination.save();

    const updatedVaccination = await VaccinationSchedule.findById(vaccination._id)
      .populate('pet', 'name breed age images');

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu hoàn thành tiêm phòng',
      data: updatedVaccination
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// DELETE /api/vaccinations/:id - Xóa lịch tiêm
// ===============================
exports.deleteVaccination = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    const vaccination = await VaccinationSchedule.findOne({ _id: id, owner: userId });
    if (!vaccination) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }

    await VaccinationSchedule.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa lịch tiêm thành công'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/vaccinations/upcoming - Lịch tiêm sắp tới
// ===============================
exports.getUpcomingVaccinations = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingVaccinations = await VaccinationSchedule.find({
      owner: userId,
      status: 'scheduled',
      scheduledDate: {
        $gte: today,
        $lte: nextWeek
      }
    })
    .populate('pet', 'name breed age images')
    .sort({ scheduledDate: 1 });

    return res.status(200).json({
      success: true,
      data: upcomingVaccinations
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADMIN ROUTES
// ===============================

// GET /api/vaccinations/admin/all - Tất cả lịch tiêm (admin)
exports.getAllVaccinations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { petName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { vaccineName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await VaccinationSchedule.countDocuments(filter);
    
    const schedules = await VaccinationSchedule.find(filter)
      .populate('pet', 'name breed age images')
      .populate('owner', 'name email phone')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vaccinations/admin/send-reminders - Gửi nhắc nhở (admin)
exports.sendReminders = async (req, res) => {
  try {
    const schedulesNeedingReminder = await VaccinationSchedule.findSchedulesNeedingReminder();
    
    let sentCount = 0;
    let errorCount = 0;

    for (const schedule of schedulesNeedingReminder) {
      try {
        await sendVaccinationReminder(schedule.ownerEmail, {
          ownerName: schedule.ownerName,
          petName: schedule.petName,
          vaccineName: schedule.vaccineName,
          scheduledDate: schedule.scheduledDate,
          daysUntil: schedule.daysUntilVaccination,
          veterinarian: schedule.veterinarian
        });

        // Đánh dấu đã gửi reminder
        schedule.reminderSent = true;
        schedule.reminderSentAt = new Date();
        schedule.status = 'reminded';
        await schedule.save();

        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send reminder for schedule ${schedule._id}:`, emailErr);
        errorCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã gửi ${sentCount} email nhắc nhở. ${errorCount} email lỗi.`,
      data: {
        sent: sentCount,
        errors: errorCount,
        total: schedulesNeedingReminder.length
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
