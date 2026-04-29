const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ userId: '000000000000000000000000', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
console.log(token);
