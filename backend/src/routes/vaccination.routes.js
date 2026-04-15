const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const vaccinationController = require('../controllers/vaccinationController');

router.get('/me', authenticate, vaccinationController.listMine);

router.get('/admin', authenticate, isAdmin, vaccinationController.listAdmin);
router.get('/admin/:id', authenticate, isAdmin, vaccinationController.getById);
router.post('/admin', authenticate, isAdmin, vaccinationController.createSchedule);
router.put('/admin/:id', authenticate, isAdmin, vaccinationController.updateSchedule);
router.delete('/admin/:id', authenticate, isAdmin, vaccinationController.deleteSchedule);
router.post(
  '/admin/:id/send-reminder',
  authenticate,
  isAdmin,
  vaccinationController.sendReminderManual
);
router.post(
  '/admin/:id/send-info',
  authenticate,
  isAdmin,
  vaccinationController.sendInfoEmail
);
router.post(
  '/admin/bulk-send-reminders',
  authenticate,
  isAdmin,
  vaccinationController.bulkSendReminders
);

module.exports = router;
