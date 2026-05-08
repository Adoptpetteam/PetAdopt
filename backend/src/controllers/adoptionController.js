const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const { sendEmail } = require('../utils/emailService');
const mongoose = require('mongoose');

// @desc    Tạo đơn nhận nuôi mới
// @route   POST /api/adoption
// @access  Public (hoặc Private tùy yêu cầu)
const createAdoptionRequest = async (req, res) => {
  try {
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

    // Lấy user từ authentication
    const user = req.user?.userId;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng chưa đăng nhập'
      });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: 'User ID không hợp lệ'
      });
    }

    // Validate required fields
    if (!fullName || !phone || !address || !reason || !housingType || !familyMembers || !monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    if (!commitment) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải đồng ý với cam kết nhận nuôi'
      });
    }

    // Kiểm tra pet có tồn tại không
    if (pet) {
      const petExists = await Pet.findById(pet);
      if (!petExists) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thú cưng'
        });
      }

      // Kiểm tra pet có sẵn sàng nhận nuôi không
      if (petExists.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Thú cưng này hiện không có sẵn để nhận nuôi'
        });
      }
    }

    // Kiểm tra user đã gửi đơn pending cho pet này chưa
    if (pet && user) {
      const existingRequest = await AdoptionRequest.findOne({
        pet,
        user,
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã gửi đơn nhận nuôi cho thú cưng này rồi'
        });
      }
    }

    // Tạo đơn
    const adoptionRequest = new AdoptionRequest({
      pet,
      user: user || null,
      fullName,
      phone,
      address,
      reason,
      experience: experience || 'none',
      experienceDetails,
      housingType,
      hasYard: hasYard || false,
      familyMembers,
      hasChildren: hasChildren || false,
      childrenAges,
      hasOtherPets: hasOtherPets || false,
      otherPetsDetails,
      monthlyIncome,
      commitment: true
    });

    await adoptionRequest.save();

    res.status(201).json({
      success: true,
      message: 'Đơn nhận nuôi đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
      data: adoptionRequest
    });

  } catch (error) {
    console.error('Error creating adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi đơn nhận nuôi'
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
      .populate('pet', 'name images species')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
      message: 'Lỗi server khi lấy danh sách đơn nhận nuôi'
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

    console.log('Approving adoption request:', id);

    const request = await AdoptionRequest.findById(id)
      .populate('pet', 'name status')
      .populate('user', 'name email');

    console.log('Request found:', !!request);
    if (request) {
      console.log('Request pet:', request.pet);
      console.log('Request status:', request.status);
    }

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
    await request.save();

    // Cập nhật trạng thái pet thành adopted
    if (request.pet) {
      console.log('Updating pet status for pet:', request.pet._id);
      await Pet.findByIdAndUpdate(request.pet._id, {
        status: 'adopted'
      });
      console.log('Pet status updated successfully');
    } else {
      console.log('No pet associated with this request');
    }

    // Gửi email mời phỏng vấn cho user
    if (request.user?.email) {
      try {
        const subject = 'Yêu cầu nhận nuôi của bạn đã được chấp thuận';
        const html = `
          <p>Chào ${request.user.name || request.fullName || 'bạn'},</p>
          <p>Đơn nhận nuôi thú cưng <strong>${request.pet?.name || 'của bạn'}</strong> đã được <strong>chấp thuận</strong> bởi admin.</p>
          <p>Chúng tôi xin mời bạn đến phỏng vấn để hoàn tất quy trình nhận nuôi.</p>
          <p><strong>Ghi chú của admin:</strong> ${adminNote || 'Không có ghi chú.'}</p>
          <p>Xin vui lòng kiểm tra email này và phản hồi sớm nhất có thể để chúng tôi sắp xếp buổi gặp.</p>
          <p>Trân trọng,<br/>PetAdopt Team</p>
        `;
        await sendEmail(request.user.email, subject, html);
      } catch (emailError) {
        console.error('Lỗi gửi email duyệt đơn nhận nuôi:', emailError.message || emailError);
      }
    }

    res.json({
      success: true,
      message: 'Đơn nhận nuôi đã được duyệt thành công!',
      data: request
    });

  } catch (error) {
    console.error('Error approving adoption request:', error);
    console.error(error.stack);
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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    const requests = await AdoptionRequest.find({ user: userId })
      .populate('pet', 'name images species')
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

module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  deleteAdoptionRequest,
  cancelAdoptionRequest,
  getMyAdoptionRequests
};
