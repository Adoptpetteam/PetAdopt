const VaccinationSchedule = require('../models/VaccinationSchedule');
const Pet = require('../models/Pet');
const { sendEmail } = require('../utils/emailService');
const {
  computeReminderTypeForToday,
  sendReminderForSchedule,
  markReminderSent,
  buildHtml,
  subjectForType,
  shouldSendSimpleReminder,
  daysUntilScheduled
} = require('../utils/vaccinationReminderService');

exports.createSchedule = async (req, res, next) => {
  try {
    const {
      petId,
      ownerName,
      ownerEmail,
      ownerPhone,
      vaccineName,
      doseNumber,
      scheduledAt,
      status,
      reminderOffsetsDays,
      notes
    } = req.body;

    if (!petId || !ownerName || !ownerEmail || !vaccineName || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: petId, ownerName, ownerEmail, vaccineName, scheduledAt là bắt buộc'
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thú cưng' });
    }

    const doc = await VaccinationSchedule.create({
      pet: petId,
      petNameSnapshot: pet.name,
      ownerName: String(ownerName).trim(),
      ownerEmail: String(ownerEmail).toLowerCase().trim(),
      ownerPhone: ownerPhone ? String(ownerPhone).trim() : '',
      vaccineName: String(vaccineName).trim(),
      doseNumber: doseNumber ? Number(doseNumber) : 1,
      scheduledAt: new Date(scheduledAt),
      status: status && ['scheduled', 'completed', 'missed', 'cancelled'].includes(status) ? status : 'scheduled',
      reminderOffsetsDays: Array.isArray(reminderOffsetsDays) && reminderOffsetsDays.length
        ? reminderOffsetsDays.map(Number)
        : [7, 3, 1],
      notes: notes ? String(notes).trim() : '',
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Tạo lịch tiêm thành công',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = [
      'ownerName',
      'ownerEmail',
      'ownerPhone',
      'vaccineName',
      'doseNumber',
      'scheduledAt',
      'status',
      'reminderOffsetsDays',
      'notes',
      'petNameSnapshot'
    ];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    if (patch.ownerEmail) patch.ownerEmail = String(patch.ownerEmail).toLowerCase().trim();
    if (patch.scheduledAt) patch.scheduledAt = new Date(patch.scheduledAt);

    const doc = await VaccinationSchedule.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }
    res.json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const doc = await VaccinationSchedule.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }
    res.json({ success: true, message: 'Đã xóa lịch tiêm' });
  } catch (error) {
    next(error);
  }
};

exports.listAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      from,
      to,
      ownerEmail,
      vaccineName,
      search
    } = req.query;
    const q = {};
    if (status) q.status = status;
    if (ownerEmail) q.ownerEmail = new RegExp(ownerEmail.trim(), 'i');
    if (vaccineName) q.vaccineName = new RegExp(vaccineName.trim(), 'i');
    if (from || to) {
      q.scheduledAt = {};
      if (from) q.scheduledAt.$gte = new Date(from);
      if (to) q.scheduledAt.$lte = new Date(to);
    }
    if (search) {
      q.$or = [
        { ownerName: new RegExp(search, 'i') },
        { ownerEmail: new RegExp(search, 'i') },
        { petNameSnapshot: new RegExp(search, 'i') },
        { vaccineName: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      VaccinationSchedule.find(q)
        .populate('pet', 'name species images')
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      VaccinationSchedule.countDocuments(q)
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await VaccinationSchedule.findById(req.params.id).populate('pet', 'name species images');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

exports.listMine = async (req, res, next) => {
  try {
    const email = (req.user.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Tài khoản không có email' });
    }
    const data = await VaccinationSchedule.find({ ownerEmail: email })
      .populate('pet', 'name species images')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/** Gửi email nhắc theo loại (admin) — idempotent theo reminderSent */
exports.sendReminderManual = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, force } = req.body;
    const schedule = await VaccinationSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }
    const reminderType =
      type && ['before_7', 'before_3', 'before_1', 'due_day', 'overdue'].includes(type)
        ? type
        : computeReminderTypeForToday(schedule);

    if (!reminderType) {
      return res.status(400).json({
        success: false,
        message: 'Không có loại nhắc phù hợp hôm nay (hoặc đã gửi đủ). Thử gửi kèm type trong body.'
      });
    }

    if (!force && schedule.reminderSent && schedule.reminderSent[reminderType]) {
      return res.status(400).json({
        success: false,
        message: `Đã gửi nhắc loại ${reminderType} trước đó — bỏ qua để tránh spam`
      });
    }

    await sendReminderForSchedule(schedule, reminderType);
    if (!force) {
      markReminderSent(schedule, reminderType);
      await schedule.save();
    }

    res.json({ success: true, message: 'Đã gửi email nhắc lịch', sentType: reminderType });
  } catch (error) {
    next(error);
  }
};

/** Gửi email thông tin lịch (không đánh dấu reminder) — dùng khi cần gửi lại nội dung tổng quát */
exports.sendInfoEmail = async (req, res, next) => {
  try {
    const schedule = await VaccinationSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch tiêm' });
    }
    const html = buildHtml(schedule, 'due_day');
    await sendEmail(schedule.ownerEmail, subjectForType('due_day'), html);
    res.json({ success: true, message: 'Đã gửi email thông tin lịch' });
  } catch (error) {
    next(error);
  }
};

exports.bulkSendReminders = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Cần mảng ids' });
    }
    const results = { ok: 0, skip: 0, errors: [] };
    for (const id of ids) {
      try {
        const schedule = await VaccinationSchedule.findById(id);
        if (!schedule) {
          results.errors.push({ id, err: 'not found' });
          continue;
        }
        const reminderType = computeReminderTypeForToday(schedule);
        if (!reminderType) {
          results.skip += 1;
          continue;
        }
        if (schedule.reminderSent && schedule.reminderSent[reminderType]) {
          results.skip += 1;
          continue;
        }
        await sendReminderForSchedule(schedule, reminderType);
        markReminderSent(schedule, reminderType);
        await schedule.save();
        results.ok += 1;
      } catch (e) {
        results.errors.push({ id, err: e.message });
      }
    }
    res.json({ success: true, message: 'Hoàn tất gửi hàng loạt', results });
  } catch (error) {
    next(error);
  }
};

/** Gọi từ cron job — quét và gửi tự động */
exports.runDueReminders = async () => {
  const pets = await Pet.find({}, '_id');
  let processedPets = 0;
  let processedSchedules = 0;
  let sent = 0;

  for (const pet of pets) {
    processedPets += 1;
    const schedules = await VaccinationSchedule.find({ pet: pet._id, status: 'scheduled' });
    for (const schedule of schedules) {
      processedSchedules += 1;
      if (!shouldSendSimpleReminder(schedule)) continue;

      const diffDays = daysUntilScheduled(schedule.scheduledAt);
      const reminderType = diffDays === 0 ? 'due_day' : diffDays === 1 ? 'before_1' : 'before_3';

      try {
        await sendReminderForSchedule(schedule, reminderType);
        markReminderSent(schedule, reminderType);
        await schedule.save();
        sent += 1;
      } catch (e) {
        console.error('[VaccinationReminder] Lỗi gửi:', schedule._id, e.message);
      }
    }
  }
  return { processedPets, processedSchedules, sent };
};
