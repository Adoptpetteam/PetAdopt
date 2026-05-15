const HealthRecord = require('../models/HealthRecord');
const AdoptionRequest = require('../models/AdoptionRequest');

// Get all health records for a pet
exports.getHealthRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    console.log('Getting health records for pet:', petId, 'user:', userId);

    // Verify user owns this pet
    const adoption = await AdoptionRequest.findOne({
      pet: petId,
      user: userId,
      status: 'approved'
    });

    if (!adoption) {
      console.log('No approved adoption found for user:', userId, 'pet:', petId);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hồ sơ của thú cưng này'
      });
    }

    const records = await HealthRecord.find({ pet: petId, user: userId })
      .sort({ date: -1 })
      .populate('pet', 'name breed');

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching health records:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải hồ sơ sức khỏe'
    });
  }
};

// Create health record
exports.createHealthRecord = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.userId || req.user?.id;
    const { type, date, veterinarian, description, nextCheckup, weight, temperature, notes } = req.body;

    console.log('Creating health record for pet:', petId, 'user:', userId);

    // Verify user owns this pet
    const adoption = await AdoptionRequest.findOne({
      pet: petId,
      user: userId,
      status: 'approved'
    });

    if (!adoption) {
      console.log('No approved adoption found for user:', userId, 'pet:', petId);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm hồ sơ cho thú cưng này'
      });
    }

    const record = await HealthRecord.create({
      pet: petId,
      user: userId,
      type,
      date,
      veterinarian,
      description,
      nextCheckup,
      weight,
      temperature,
      notes
    });

    await record.populate('pet', 'name breed');

    res.status(201).json({
      success: true,
      message: 'Đã thêm hồ sơ sức khỏe',
      data: record
    });
  } catch (error) {
    console.error('Error creating health record:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm hồ sơ sức khỏe'
    });
  }
};

// Update health record
exports.updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const record = await HealthRecord.findOne({ _id: recordId, user: userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
      });
    }

    Object.assign(record, req.body);
    await record.save();
    await record.populate('pet', 'name breed');

    res.json({
      success: true,
      message: 'Đã cập nhật hồ sơ',
      data: record
    });
  } catch (error) {
    console.error('Error updating health record:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hồ sơ'
    });
  }
};

// Delete health record
exports.deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const record = await HealthRecord.findOneAndDelete({ _id: recordId, user: userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa hồ sơ'
    });
  } catch (error) {
    console.error('Error deleting health record:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hồ sơ'
    });
  }
};

// Get health statistics for a pet
exports.getHealthStats = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    // Verify user owns this pet
    const adoption = await AdoptionRequest.findOne({
      pet: petId,
      user: userId,
      status: 'approved'
    });

    if (!adoption) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thống kê của thú cưng này'
      });
    }

    const records = await HealthRecord.find({ pet: petId, user: userId });

    const stats = {
      totalRecords: records.length,
      vaccinations: records.filter(r => r.type === 'vaccination').length,
      checkups: records.filter(r => r.type === 'checkup').length,
      treatments: records.filter(r => r.type === 'treatment').length,
      lastCheckup: records.find(r => r.type === 'checkup')?.date || null,
      nextCheckup: records.find(r => r.nextCheckup)?.nextCheckup || null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching health stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê sức khỏe'
    });
  }
};

// Get comprehensive pet health profile
exports.getPetHealthProfile = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    console.log('Getting health profile for pet:', petId, 'user:', userId);

    // Verify user owns this pet
    const adoption = await AdoptionRequest.findOne({
      pet: petId,
      user: userId,
      status: 'approved'
    }).populate('pet', 'name breed age weight images createdAt');

    if (!adoption) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hồ sơ của thú cưng này'
      });
    }

    // Get health records
    const healthRecords = await HealthRecord.find({ pet: petId, user: userId })
      .sort({ date: -1 });

    // Get vaccination records from VaccinationSchedule
    const VaccinationSchedule = require('../models/VaccinationSchedule');
    const vaccinations = await VaccinationSchedule.find({ 
      pet: petId, 
      owner: userId 
    }).sort({ scheduledDate: -1 });

    // Calculate vaccination statistics
    const vaccinationStats = {
      total: vaccinations.length,
      completed: vaccinations.filter(v => v.status === 'completed').length,
      scheduled: vaccinations.filter(v => v.status === 'scheduled').length,
      missed: vaccinations.filter(v => v.status === 'missed').length,
      completionRate: vaccinations.length > 0 ? 
        Math.round((vaccinations.filter(v => v.status === 'completed').length / vaccinations.length) * 100) : 0
    };

    // Calculate health record statistics
    const healthStats = {
      totalRecords: healthRecords.length,
      vaccinations: healthRecords.filter(r => r.type === 'vaccination').length,
      checkups: healthRecords.filter(r => r.type === 'checkup').length,
      treatments: healthRecords.filter(r => r.type === 'treatment').length,
      lastCheckup: healthRecords.find(r => r.type === 'checkup')?.date || null,
      nextCheckup: healthRecords.find(r => r.nextCheckup && new Date(r.nextCheckup) > new Date())?.nextCheckup || null
    };

    // Get weight history
    const weightHistory = healthRecords
      .filter(r => r.weight)
      .map(r => ({
        date: r.date,
        weight: r.weight
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate days since adoption
    const daysSinceAdoption = Math.floor((new Date() - new Date(adoption.createdAt)) / (1000 * 60 * 60 * 24));

    const profile = {
      pet: adoption.pet,
      adoption: {
        date: adoption.createdAt,
        daysSince: daysSinceAdoption
      },
      healthRecords,
      vaccinations,
      statistics: {
        vaccination: vaccinationStats,
        health: healthStats
      },
      weightHistory,
      upcomingTasks: [
        ...vaccinations
          .filter(v => v.status === 'scheduled' && new Date(v.scheduledDate) > new Date())
          .slice(0, 3)
          .map(v => ({
            type: 'vaccination',
            title: `Tiêm ${v.vaccineName}`,
            date: v.scheduledDate,
            priority: new Date(v.scheduledDate) - new Date() < 3 * 24 * 60 * 60 * 1000 ? 'high' : 'medium'
          })),
        ...healthRecords
          .filter(r => r.nextCheckup && new Date(r.nextCheckup) > new Date())
          .slice(0, 2)
          .map(r => ({
            type: 'checkup',
            title: 'Tái khám',
            date: r.nextCheckup,
            priority: new Date(r.nextCheckup) - new Date() < 7 * 24 * 60 * 60 * 1000 ? 'high' : 'low'
          }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date))
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching pet health profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải hồ sơ sức khỏe'
    });
  }
};
