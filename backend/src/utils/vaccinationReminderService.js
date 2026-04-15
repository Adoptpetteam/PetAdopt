const moment = require('moment');
const { sendEmail } = require('./emailService');

const REMINDER_KEYS = ['before_7', 'before_3', 'before_1', 'due_day', 'overdue'];

function daysUntilScheduled(scheduledAt) {
  const d = moment(scheduledAt).startOf('day');
  const today = moment().startOf('day');
  return d.diff(today, 'days');
}

function subjectForType(type) {
  const map = {
    before_7: '[PetAdopt] Nhắc lịch tiêm phòng — còn 7 ngày',
    before_3: '[PetAdopt] Nhắc lịch tiêm phòng — còn 3 ngày',
    before_1: '[PetAdopt] Nhắc lịch tiêm phòng — ngày mai',
    due_day: '[PetAdopt] Hôm nay là lịch tiêm phòng',
    overdue: '[PetAdopt] Nhắc: lịch tiêm phòng đã quá hạn'
  };
  return map[type] || '[PetAdopt] Thông báo lịch tiêm phòng';
}

function buildHtml(schedule, type) {
  const pet = schedule.petNameSnapshot || 'Thú cưng';
  const dateStr = moment(schedule.scheduledAt).format('DD/MM/YYYY');
  const lines = {
    before_7: `Lịch tiêm <strong>${schedule.vaccineName}</strong> (mũi ${schedule.doseNumber}) cho <strong>${pet}</strong> sẽ diễn ra vào <strong>${dateStr}</strong> — còn khoảng 7 ngày.`,
    before_3: `Lịch tiêm <strong>${schedule.vaccineName}</strong> (mũi ${schedule.doseNumber}) cho <strong>${pet}</strong> sẽ diễn ra vào <strong>${dateStr}</strong> — còn khoảng 3 ngày.`,
    before_1: `Lịch tiêm <strong>${schedule.vaccineName}</strong> (mũi ${schedule.doseNumber}) cho <strong>${pet}</strong> sẽ diễn ra vào <strong>${dateStr}</strong> — ngày mai.`,
    due_day: `Hôm nay (<strong>${dateStr}</strong>) là lịch tiêm <strong>${schedule.vaccineName}</strong> (mũi ${schedule.doseNumber}) cho <strong>${pet}</strong>.`,
    overdue: `Lịch tiêm <strong>${schedule.vaccineName}</strong> (mũi ${schedule.doseNumber}) cho <strong>${pet}</strong> dự kiến <strong>${dateStr}</strong> đã quá hạn. Vui lòng liên hệ để đặt lịch lại.`
  };
  const body = lines[type] || lines.due_day;
  return `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <p>Xin chào <strong>${schedule.ownerName}</strong>,</p>
      <p>${body}</p>
      ${schedule.notes ? `<p><em>Ghi chú:</em> ${schedule.notes}</p>` : ''}
      <p>Trân trọng,<br/>PetAdopt</p>
    </div>
  `;
}

/**
 * Xác định loại nhắc cần gửi hôm nay (chỉ 1 loại / ngày theo thứ tự ưu tiên).
 */
function computeReminderTypeForToday(schedule) {
  if (schedule.status !== 'scheduled') return null;
  const days = daysUntilScheduled(schedule.scheduledAt);
  const sent = schedule.reminderSent || {};

  if (days === 7 && !sent.before_7) return 'before_7';
  if (days === 3 && !sent.before_3) return 'before_3';
  if (days === 1 && !sent.before_1) return 'before_1';
  if (days === 0 && !sent.due_day) return 'due_day';
  if (days < 0 && !sent.overdue) return 'overdue';
  return null;
}

async function sendReminderForSchedule(schedule, type) {
  if (!schedule.ownerEmail) {
    throw new Error('Thiếu email chủ nuôi');
  }
  const html = buildHtml(schedule, type);
  const subject = subjectForType(type);
  await sendEmail(schedule.ownerEmail, subject, html);
  return { type, subject };
}

function markReminderSent(schedule, type) {
  if (!schedule.reminderSent) schedule.reminderSent = {};
  if (REMINDER_KEYS.includes(type)) {
    schedule.reminderSent[type] = true;
  }
  schedule.isReminderSent = true;
  schedule.lastReminderAt = new Date();
}

/**
 * Luồng đơn giản cho scheduler:
 * chỉ gửi 1 lần khi còn từ 0 đến 3 ngày.
 */
function shouldSendSimpleReminder(schedule) {
  const diffDays = daysUntilScheduled(schedule.scheduledAt);
  return diffDays <= 3 && diffDays >= 0 && !schedule.isReminderSent;
}

module.exports = {
  daysUntilScheduled,
  computeReminderTypeForToday,
  sendReminderForSchedule,
  markReminderSent,
  shouldSendSimpleReminder,
  REMINDER_KEYS,
  buildHtml,
  subjectForType
};
