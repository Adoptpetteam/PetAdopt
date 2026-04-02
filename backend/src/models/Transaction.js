const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    sepayId: {
        type: String,
        required: true,
        unique: true,
    },
    orderCode: {
        type: String,
        required: true,
        index: true,
    },
    gateway: {
        type: String,
        default: '',
    },
    accountNumber: {
        type: String,
        default: '',
    },
    transferAmount: {
        type: Number,
        required: true,
    },
    transferType: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    transactionDate: {
        type: String,
        default: '',
    },
    referenceCode: {
        type: String,
        default: '',
    },
    processedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);
