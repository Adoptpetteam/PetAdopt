const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ===============================
// GET /api/statistics/overview
// Tổng quan thống kê đơn hàng
// ===============================
exports.getOrderOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments(filter);

    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totals.total' }
        }
      }
    ]);

    // Tổng doanh thu (chỉ tính đơn đã thanh toán)
    const paidFilter = { ...filter, status: 'paid' };
    const revenueResult = await Order.aggregate([
      { $match: paidFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totals.total' },
          avgOrderValue: { $avg: '$totals.total' }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const avgOrderValue = revenueResult[0]?.avgOrderValue || 0;

    // Thống kê theo phương thức thanh toán
    const paymentMethods = await Order.aggregate([
      { $match: paidFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totals.total' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            revenue: item.revenue
          };
          return acc;
        }, {}),
        paymentMethods: paymentMethods.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            revenue: item.revenue
          };
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error('GET OVERVIEW ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/statistics/revenue-by-time
// Thống kê doanh thu theo thời gian
// ===============================
exports.getRevenueByTime = async (req, res) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;

    // Build filter
    const filter = { status: 'paid' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Xác định format group theo period
    let dateFormat;
    switch (period) {
      case 'hour':
        dateFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        dateFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        dateFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
        dateFormat = {
          year: { $year: '$createdAt' }
        };
        break;
      default:
        dateFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const revenueByTime = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: dateFormat,
          totalRevenue: { $sum: '$totals.total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totals.total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.week': 1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: revenueByTime
    });
  } catch (err) {
    console.error('GET REVENUE BY TIME ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/statistics/top-products
// Top sản phẩm bán chạy
// ===============================
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    // Build filter
    const filter = { status: 'paid' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const topProducts = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          productImage: { $first: '$items.image' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: Number(limit) }
    ]);

    return res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (err) {
    console.error('GET TOP PRODUCTS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/statistics/customer-stats
// Thống kê khách hàng
// ===============================
exports.getCustomerStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter
    const filter = { status: 'paid' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Top khách hàng theo số đơn hàng
    const topCustomersByOrders = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          avgOrderValue: { $avg: '$totals.total' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          userName: '$userInfo.name',
          userEmail: '$userInfo.email'
        }
      }
    ]);

    // Top khách hàng theo doanh thu
    const topCustomersByRevenue = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          avgOrderValue: { $avg: '$totals.total' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          userName: '$userInfo.name',
          userEmail: '$userInfo.email'
        }
      }
    ]);

    // Tổng số khách hàng đã mua hàng
    const totalCustomers = await Order.distinct('user', filter);

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers: totalCustomers.length,
        topCustomersByOrders,
        topCustomersByRevenue
      }
    });
  } catch (err) {
    console.error('GET CUSTOMER STATS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/statistics/recent-orders
// Đơn hàng gần đây
// ===============================
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('_id status paymentMethod totals createdAt customer');

    return res.status(200).json({
      success: true,
      data: recentOrders
    });
  } catch (err) {
    console.error('GET RECENT ORDERS ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET /api/statistics/comparison
// So sánh thống kê giữa 2 khoảng thời gian
// ===============================
exports.getComparison = async (req, res) => {
  try {
    const { 
      currentStart, 
      currentEnd, 
      previousStart, 
      previousEnd 
    } = req.query;

    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cần cung cấp đầy đủ currentStart, currentEnd, previousStart, previousEnd' 
      });
    }

    // Helper function để lấy stats cho một khoảng thời gian
    const getStats = async (startDate, endDate) => {
      const filter = {
        status: 'paid',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const result = await Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totals.total' },
            avgOrderValue: { $avg: '$totals.total' }
          }
        }
      ]);

      return result[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
    };

    const currentStats = await getStats(currentStart, currentEnd);
    const previousStats = await getStats(previousStart, previousEnd);

    // Tính % thay đổi
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return res.status(200).json({
      success: true,
      data: {
        current: currentStats,
        previous: previousStats,
        changes: {
          ordersChange: calculateChange(currentStats.totalOrders, previousStats.totalOrders),
          revenueChange: calculateChange(currentStats.totalRevenue, previousStats.totalRevenue),
          avgOrderValueChange: calculateChange(currentStats.avgOrderValue, previousStats.avgOrderValue)
        }
      }
    });
  } catch (err) {
    console.error('GET COMPARISON ERROR:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
