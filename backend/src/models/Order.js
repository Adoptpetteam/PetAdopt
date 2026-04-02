const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1000,
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
        default: 'PENDING',
    },
    paidAt: {
        type: Date,
        default: null,
    },
    transactionId: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
});

orderSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Order', orderSchema);
