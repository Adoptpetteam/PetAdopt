const jwt = require('jsonwebtoken');

// Tạo admin token để test
const adminPayload = {
  userId: '507f1f77bcf86cd799439011', // Fake admin ID
  email: 'admin@petadopt.com',
  role: 'admin'
};

const token = jwt.sign(adminPayload, 'pawpalace_secret_key_2026_super_secure', {
  expiresIn: '1h'
});

console.log('Admin Token:', token);
console.log('\nTest command:');
console.log(`curl -X GET "http://localhost:5000/api/reviews/admin/all" -H "Authorization: Bearer ${token}"`);