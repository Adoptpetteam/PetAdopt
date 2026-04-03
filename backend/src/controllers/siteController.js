const ContactMessage = require('../models/ContactMessage');
const Donation = require('../models/Donation');
const VolunteerApplication = require('../models/VolunteerApplication');
const siteContent = require('../data/siteContent');
const { sendVolunteerInterviewEmail } = require('../utils/emailService');

// =========================
// Lấy nội dung website
// =========================
exports.getSiteContent = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: siteContent
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// Gửi liên hệ
// =========================
exports.submitContactMessage = async (req, res, next) => {
  try {
    const { fullName, email, phone = '', subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email, tiêu đề và nội dung'
      });
    }

    const contact = await ContactMessage.create({
      fullName,
      email,
      phone,
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Đã gửi góp ý thành công',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// User gửi đơn tình nguyện viên
// =========================
exports.submitVolunteerApplication = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      experience = '',
      availability = '',
      reason
    } = req.body;

    const age =
      req.body.age !== undefined &&
      req.body.age !== '' &&
      !Number.isNaN(Number(req.body.age))
        ? Number(req.body.age)
        : undefined;

    if (!name || !email || !phone || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và lý do tham gia'
      });
    }

    const application = await VolunteerApplication.create({
      name,
      email,
      phone,
      age,
      experience,
      availability,
      reason,
      status: 'pending_review'
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tình nguyện viên thành công',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// User gửi ý định ủng hộ
// =========================
exports.submitDonationIntent = async (req, res, next) => {
  try {
    const { fullName, method = 'bank_transfer' } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên là bắt buộc'
      });
    }

    const donation = await Donation.create({
      ...req.body,
      method
    });

    return res.status(201).json({
      success: true,
      message:
        'Đã ghi nhận thông tin ủng hộ. Vui lòng chuyển khoản theo thông tin hệ thống trả về.',
      donationInfo: siteContent.donation.accounts,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// Admin lấy inbox
// =========================
exports.getAdminInbox = async (req, res, next) => {
  try {
    const [messages, volunteers, donations] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).limit(20),
      VolunteerApplication.find().sort({ createdAt: -1 }).limit(20),
      Donation.find().sort({ createdAt: -1 }).limit(20)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        volunteers,
        donations
      }
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// Admin duyệt đơn tình nguyện viên
// approved -> gửi email mời phỏng vấn
// rejected -> chỉ cập nhật trạng thái
// =========================
exports.reviewVolunteerApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      action,
      adminNote = '',
      interviewAt,
      interviewLocation = ''
    } = req.body;

    // Kiểm tra action hợp lệ
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action chỉ được là approved hoặc rejected'
      });
    }

    // Tìm đơn
    const application = await VolunteerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn tình nguyện viên'
      });
    }

    // =========================
    // Nếu duyệt đơn
    // =========================
    if (action === 'approved') {
      if (!interviewAt || !interviewLocation) {
        return res.status(400).json({
          success: false,
          message: 'Khi chấp thuận cần có interviewAt và interviewLocation'
        });
      }

      application.status = 'approved';
      application.interviewAt = new Date(interviewAt);
      application.interviewLocation = interviewLocation;
      application.adminNote = adminNote;
      application.reviewedAt = new Date();

      await application.save();

      // Gửi email
      try {
        await sendVolunteerInterviewEmail({
          to: application.email,
          name: application.name,
          interviewAt: application.interviewAt,
          interviewLocation: application.interviewLocation,
          adminNote: application.adminNote
        });
      } catch (emailError) {
        return res.status(200).json({
          success: true,
          message: 'Đã chấp thuận đơn nhưng gửi email thất bại',
          emailError: emailError.message,
          data: application
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã chấp thuận đơn và gửi email mời phỏng vấn',
        data: application
      });
    }

    // =========================
    // Nếu từ chối đơn
    // =========================
    application.status = 'rejected';
    application.adminNote = adminNote;
    application.interviewAt = null;
    application.interviewLocation = '';
    application.reviewedAt = new Date();

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Đã từ chối đơn tình nguyện viên',
      data: application
    });
  } catch (error) {
    next(error);
  }
};