require('dotenv').config();

console.log('🔍 Kiểm tra VNPay config cho Donate:\n');

const required = ['VNP_TMNCODE', 'VNP_HASHSECRET', 'VNP_URL', 'VNP_RETURN_URL'];

required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: MISSING!`);
  }
});

console.log('\n📝 Nếu thiếu, thêm vào file .env:');
console.log('VNP_TMNCODE=QGU8DD3O');
console.log('VNP_HASHSECRET=92WHJHRWDVQMV486ARR2S3HKUU3JIUJ1');
console.log('VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
console.log('VNP_RETURN_URL=http://localhost:5000/api/donate/vnpay-return');

console.log('\n🔄 Sau đó restart backend: Ctrl+C → node server.js');
