// Test script để kiểm tra auto voucher sau khi donate
require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./src/models/Donation');
const Voucher = require('./src/models/Voucher');

async function testAutoVoucher() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm donation gần nhất có status success
        const latestDonation = await Donation.findOne({ status: 'success' })
            .sort({ paidAt: -1 });

        if (!latestDonation) {
            console.log('❌ Không tìm thấy donation nào có status success');
            console.log('💡 Hãy donate một lần để test');
            process.exit(0);
        }

        console.log('\n📦 Donation gần nhất:');
        console.log('  ID:', latestDonation._id);
        console.log('  Name:', latestDonation.name);
        console.log('  Email:', latestDonation.email);
        console.log('  Amount:', latestDonation.amount.toLocaleString('vi-VN') + 'đ');
        console.log('  Status:', latestDonation.status);
        console.log('  Paid At:', latestDonation.paidAt);

        // Kiểm tra voucher tier
        let expectedVoucher;
        if (latestDonation.amount >= 500000) {
            expectedVoucher = '15%';
        } else if (latestDonation.amount >= 100000) {
            expectedVoucher = '10%';
        } else if (latestDonation.amount >= 50000) {
            expectedVoucher = '5%';
        } else {
            expectedVoucher = 'Không có (< 50k)';
        }

        console.log('\n🎁 Voucher tier dự kiến:', expectedVoucher);

        // Tìm voucher được tạo cho donation này
        const vouchers = await Voucher.find({
            description: { $regex: latestDonation.amount.toString() }
        }).sort({ createdAt: -1 }).limit(5);

        if (vouchers.length === 0) {
            console.log('\n❌ CHƯA CÓ VOUCHER NÀO được tạo tự động');
            console.log('💡 Có thể:');
            console.log('   1. Backend chưa restart sau khi sửa code');
            console.log('   2. Donation này được tạo trước khi có auto voucher');
            console.log('   3. Email không có trong donation');
        } else {
            console.log('\n✅ Voucher đã tạo:');
            vouchers.forEach((v, i) => {
                console.log(`\n  ${i + 1}. Code: ${v.code}`);
                console.log(`     Type: ${v.type}`);
                console.log(`     Value: ${v.value}${v.type === 'percent' ? '%' : 'đ'}`);
                console.log(`     Description: ${v.description}`);
                console.log(`     Start: ${v.startDate?.toLocaleDateString('vi-VN')}`);
                console.log(`     End: ${v.endDate?.toLocaleDateString('vi-VN')}`);
                console.log(`     Active: ${v.isActive}`);
                console.log(`     Used: ${v.usedCount}/${v.usageLimit || '∞'}`);
            });
        }

        console.log('\n📊 Tổng số voucher trong DB:', await Voucher.countDocuments());
        console.log('📊 Voucher active:', await Voucher.countDocuments({ isActive: true }));

        await mongoose.disconnect();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAutoVoucher();
