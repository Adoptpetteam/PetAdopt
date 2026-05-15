const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const { sendEmail } = require('../utils/emailService');
const { notifyAdoptionApproved, notifyAdoptionRejected } = require('../utils/notificationService');
const mongoose = require('mongoose');

// @desc    Tạo đơn nhận nuôi mới
// @route   POST /api/adoption
// @access  Private
const createAdoptionRequest = async (req, res) => {
  try {
    console.log('=== CREATE ADOPTION REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User from token:', req.user);
    
    const {
      pet,
      fullName,
      phone,
      address,
      reason,
      experience,
      experienceDetails,
      housingType,
      hasYard,
      familyMembers,
      hasChildren,
      childrenAges,
      hasOtherPets,
      otherPetsDetails,
      monthlyIncome,
      commitment
    } = req.body;

    // Lấy user ID
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No user ID found');
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để gửi đơn nhận nuôi'
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!phone) missingFields.push('phone');
    if (!address) missingFields.push('address');
    if (!reason) missingFields.push('reason');
    if (!housingType) missingFields.push('housingType');
    if (!familyMembers) missingFields.push('familyMembers');
    if (!monthlyIncome) missingFields.push('monthlyIncome');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        missingFields
      });
    }

    if (!commitment) {
      console.log('Commitment not checked');
      return res.status(400).json({
        success: false,
        message: 'Bạn phải đồng ý với cam kết nhận nuôi'
      });
    }

    // Kiểm tra pet nếu có
    if (pet) {
      console.log('Checking pet:', pet);
      
      if (!mongoose.Types.ObjectId.isValid(pet)) {
        console.log('Invalid pet ID');
        return res.status(400).json({
          success: false,
          message: 'Pet ID không hợp lệ'
        });
      }

      const petExists = await Pet.findById(pet);
      if (!petExists) {
        console.log('Pet not found');
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thú cưng'
        });
      }

      if (petExists.status !== 'available') {
        console.log('Pet not available, status:', petExists.status);
        return res.status(400).json({
          success: false,
          message: 'Thú cưng này hiện không có sẵn để nhận nuôi'
        });
      }

      // Kiểm tra đơn trùng
      const existingRequest = await AdoptionRequest.findOne({
        pet,
        user: userId,
        status: 'pending'
      });

      if (existingRequest) {
        console.log('Duplicate request found');
        return res.status(400).json({
          success: false,
          message: 'Bạn đã gửi đơn nhận nuôi cho thú cưng này rồi'
        });
      }
    }

    console.log('Creating adoption request...');

    // Tạo đơn
    const adoptionRequest = new AdoptionRequest({
      pet: pet || null,
      user: userId,
      fullName,
      phone,
      address,
      reason,
      experience: experience || 'none',
      experienceDetails: experienceDetails || '',
      housingType,
      hasYard: hasYard || false,
      familyMembers,
      hasChildren: hasChildren || false,
      childrenAges: childrenAges || '',
      hasOtherPets: hasOtherPets || false,
      otherPetsDetails: otherPetsDetails || '',
      monthlyIncome,
      commitment: true,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Đơn nhận nuôi được tạo'
      }]
    });

    console.log('Saving adoption request...');
    await adoptionRequest.save();
    console.log('Adoption request saved:', adoptionRequest._id);

    // Gửi email (không block nếu lỗi)
    if (req.user?.email) {
      try {
        const petInfo = pet ? await Pet.findById(pet) : null;
        const subject = 'Xác nhận đơn nhận nuôi đã được gửi';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6272B6;">Cảm ơn bạn đã gửi đơn nhận nuôi!</h2>
            <p>Chào ${fullName},</p>
            <p>Đơn nhận nuôi thú cưng <strong>${petInfo?.name || 'của bạn'}</strong> đã được gửi thành công.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #6272B6; margin-top: 0;">Thông tin đơn nhận nuôi:</h3>
              <p><strong>Mã đơn:</strong> #${adoptionRequest._id.toString().slice(-8).toUpperCase()}</p>
              <p><strong>Thú cưng:</strong> ${petInfo?.name || 'N/A'}</p>
              <p><strong>Ngày gửi:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              <p><strong>Trạng thái:</strong> Đang chờ xử lý</p>
            </div>
            <p>Chúng tôi sẽ xem xét đơn của bạn và liên hệ trong vòng 2-3 ngày làm việc.</p>
            <p>Trân trọng,<br/>Đội ngũ PetAdopt</p>
          </div>
        `;
        await sendEmail(req.user.email, subject, html);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email error (non-blocking):', emailError.message);
      }
    }

    console.log('Sending success response');
    res.status(201).json({
      success: true,
      message: 'Đơn nhận nuôi đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
      data: adoptionRequest
    });

  } catch (error) {
    console.error('=== ERROR IN CREATE ADOPTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi đơn nhận nuôi',
      error: error.message
    });
  }
};

// @desc    Lấy danh sách đơn nhận nuôi (admin)
// @route   GET /api/adoption
// @access  Private (Admin)
const getAdoptionRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await AdoptionRequest.find(query)
      .populate({
        path: 'pet',
        select: 'name images species',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'user',
        select: 'name email phone',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AdoptionRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting adoption requests:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn nhận nuôi',
      error: error.message
    });
  }
};

// @desc    Lấy chi tiết đơn nhận nuôi
// @route   GET /api/adoption/:id
// @access  Private
const getAdoptionRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AdoptionRequest.findById(id)
      .populate('pet', 'name images species age gender description')
      .populate('user', 'name email phone')
      .populate('processedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error getting adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// @desc    Duyệt đơn nhận nuôi
// @route   PUT /api/adoption/:id/approve
// @access  Private (Admin)
const approveAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body || {};

    const request = await AdoptionRequest.findById(id)
      .populate('pet', 'name status')
      .populate('user', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Đơn này đã được xử lý (${request.status})`
      });
    }

    // Cập nhật trạng thái đơn
    request.status = 'approved';
    request.adminNote = adminNote || '';
    request.processedAt = new Date();
    request.processedBy = req.user?.id || null;
    
    // Thêm vào lịch sử trạng thái
    request.statusHistory.push({
      status: 'approved',
      timestamp: new Date(),
      note: adminNote || 'Đơn nhận nuôi được duyệt',
      processedBy: req.user?.id
    });
    
    await request.save();

    // Cập nhật trạng thái pet thành adopted
    if (request.pet) {
      await Pet.findByIdAndUpdate(request.pet._id, {
        status: 'adopted'
      });
    }

    // Gửi email thông báo duyệt
    if (request.user?.email) {
      try {
        const subject = '🎉 Đơn nhận nuôi của bạn đã được chấp thuận!';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6272B6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 Chúc mừng!</h1>
              <p style="color: white; margin: 10px 0 0 0;">Đơn nhận nuôi của bạn đã được chấp thuận</p>
            </div>
            <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p>Chào <strong>${request.user.name || request.fullName}</strong>,</p>
              <p>Chúng tôi rất vui thông báo rằng đơn nhận nuôi thú cưng <strong>${request.pet?.name}</strong> của bạn đã được <span style="color: #10b981; font-weight: bold;">CHẤP THUẬN</span>!</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6272B6;">
                <h3 style="color: #6272B6; margin-top: 0;">📋 Thông tin đơn nhận nuôi</h3>
                <p><strong>Mã đơn:</strong> #${request._id.toString().slice(-8).toUpperCase()}</p>
                <p><strong>Thú cưng:</strong> ${request.pet?.name}</p>
                <p><strong>Ngày duyệt:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                ${adminNote ? `<p><strong>Ghi chú:</strong> ${adminNote}</p>` : ''}
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #d97706; margin-top: 0;">📞 Bước tiếp theo</h4>
                <p style="margin: 0;">Chúng tôi sẽ liên hệ với bạn trong vòng 24h để sắp xếp buổi gặp mặt và hoàn tất thủ tục nhận nuôi.</p>
              </div>

              <p>Cảm ơn bạn đã tin tưởng và lựa chọn nhận nuôi thú cưng từ chúng tôi!</p>
              <p style="margin-bottom: 0;">Trân trọng,<br/><strong>Đội ngũ PetAdopt</strong></p>
            </div>
          </div>
        `;
        await sendEmail(request.user.email, subject, html);
      } catch (emailError) {
        console.error('Lỗi gửi email duyệt đơn:', emailError);
      }
    }

    // Tạo notification
    try {
      const userId = request.user._id || request.user;
      await notifyAdoptionApproved(userId, request._id, request.pet?.name || 'thú cưng');
    } catch (notifError) {
      console.error('Notification error (non-blocking):', notifError.message);
    }

    res.json({
      success: true,
      message: 'Đơn nhận nuôi đã được duyệt thành công!',
      data: request
    });

  } catch (error) {
    console.error('Error approving adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi duyệt đơn'
    });
  }
};

// @desc    Từ chối đơn nhận nuôi
// @route   PUT /api/adoption/:id/reject
// @access  Private (Admin)
const rejectAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body || {};

    const request = await AdoptionRequest.findById(id)
      .populate('user', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Đơn này đã được xử lý (${request.status})`
      });
    }

    request.status = 'rejected';
    request.adminNote = adminNote || '';
    request.processedAt = new Date();
    request.processedBy = req.user?.id || null;
    await request.save();

    if (request.user?.email) {
      try {
        const subject = 'Đơn nhận nuôi của bạn đã bị từ chối';
        const html = `
          <p>Chào ${request.user.name || request.fullName || 'bạn'},</p>
          <p>Rất tiếc, đơn nhận nuôi thú cưng của bạn đã bị <strong>từ chối</strong> bởi admin.</p>
          <p><strong>Ghi chú admin:</strong> ${adminNote || 'Không có ghi chú.'}</p>
          <p>Cảm ơn bạn đã quan tâm đến thú cưng của chúng tôi. Chúng tôi hy vọng sẽ có cơ hội hỗ trợ bạn trong tương lai.</p>
          <p>Trân trọng,<br/>PetAdopt Team</p>
        `;
        await sendEmail(request.user.email, subject, html);
      } catch (emailError) {
        console.error('Lỗi gửi email từ chối đơn nhận nuôi:', emailError.message || emailError);
      }
    }

    // Tạo notification
    try {
      const userId = request.user._id || request.user;
      await notifyAdoptionRejected(userId, request._id, request.pet?.name || 'thú cưng', adminNote || '');
    } catch (notifError) {
      console.error('Notification error (non-blocking):', notifError.message);
    }

    res.json({
      success: true,
      message: 'Đơn nhận nuôi đã bị từ chối',
      data: request
    });

  } catch (error) {
    console.error('Error rejecting adoption request:', error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi từ chối đơn'
    });
  }
};

// @desc    Xóa đơn nhận nuôi (Admin)
// @route   DELETE /api/adoption/:id
// @access  Private (Admin)
const deleteAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await AdoptionRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (request.status === 'approved' && request.pet) {
      await Pet.findByIdAndUpdate(request.pet, { status: 'available' });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa đơn nhận nuôi'
    });
  } catch (error) {
    console.error('Error deleting adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đơn'
    });
  }
};

// @desc    Hủy đơn nhận nuôi (bởi user)
// @route   PUT /api/adoption/:id/cancel
// @access  Private
const cancelAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AdoptionRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn đang chờ xử lý'
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Đơn nhận nuôi đã được hủy',
      data: request
    });

  } catch (error) {
    console.error('Error cancelling adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy đơn'
    });
  }
};

// @desc    Lấy đơn nhận nuôi của user hiện tại
// @route   GET /api/adoption/my-requests
// @access  Private
const getMyAdoptionRequests = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    const requests = await AdoptionRequest.find({ user: userId })
      .populate('pet', 'name images species age gender')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error getting my adoption requests:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// @desc    Thống kê đơn nhận nuôi (Admin)
// @route   GET /api/adoption/statistics
// @access  Private (Admin)
const getAdoptionStatistics = async (req, res) => {
  try {
    const totalRequests = await AdoptionRequest.countDocuments();
    const pendingRequests = await AdoptionRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await AdoptionRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await AdoptionRequest.countDocuments({ status: 'rejected' });
    const cancelledRequests = await AdoptionRequest.countDocuments({ status: 'cancelled' });

    // Thống kê theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await AdoptionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top pets được nhận nuôi nhiều nhất
    let topPets = [];
    try {
      topPets = await AdoptionRequest.aggregate([
        {
          $match: { 
            status: 'approved',
            pet: { $ne: null }
          }
        },
        {
          $group: {
            _id: '$pet',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'pets',
            localField: '_id',
            foreignField: '_id',
            as: 'petInfo'
          }
        },
        {
          $unwind: {
            path: '$petInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            petInfo: { $ne: null }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);
    } catch (aggError) {
      console.error('Error in topPets aggregation:', aggError);
      topPets = [];
    }

    res.json({
      success: true,
      data: {
        overview: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          cancelled: cancelledRequests,
          approvalRate: totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0
        },
        monthlyStats,
        topPets
      }
    });

  } catch (error) {
    console.error('Error getting adoption statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
};

// @desc    Đánh giá đơn nhận nuôi (User)
// @route   PUT /api/adoption/:id/rate
// @access  Private
const rateAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    const request = await AdoptionRequest.findOne({
      _id: id,
      user: userId,
      status: 'approved'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn nhận nuôi hoặc đơn chưa được duyệt'
      });
    }

    request.rating = rating;
    request.feedback = feedback || '';
    await request.save();

    res.json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá!',
      data: request
    });

  } catch (error) {
    console.error('Error rating adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh giá'
    });
  }
};

module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  deleteAdoptionRequest,
  cancelAdoptionRequest,
  getMyAdoptionRequests,
  getAdoptionStatistics,
  rateAdoptionRequest
};
