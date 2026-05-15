const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

async function checkSystemHealth() {
  console.log('🏥 CHECKING SYSTEM HEALTH...\n');
  
  let allPassed = true;

  // 1. Check MongoDB
  console.log('1️⃣ Checking MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petadopt');
    console.log('   ✅ MongoDB Connected');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   ✅ Found ${collections.length} collections`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ MongoDB Error:', error.message);
    allPassed = false;
  }

  // 2. Check Backend Server
  console.log('\n2️⃣ Checking Backend Server...');
  try {
    const res = await axios.get(BASE_URL);
    console.log('   ✅ Backend Server Running');
    console.log('   ✅ Version:', res.data.version);
  } catch (error) {
    console.log('   ❌ Backend Server Error:', error.message);
    console.log('   💡 Make sure backend is running: npm start');
    allPassed = false;
  }

  // 3. Check Category API
  console.log('\n3️⃣ Checking Category API...');
  try {
    const res = await axios.get(`${BASE_URL}/api/category`);
    console.log('   ✅ Category API Working');
    console.log(`   ✅ Found ${res.data.data.length} categories`);
  } catch (error) {
    console.log('   ❌ Category API Error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('   📄 Response:', JSON.stringify(error.response.data, null, 2));
    }
    allPassed = false;
  }

  // 4. Check Pet API
  console.log('\n4️⃣ Checking Pet API...');
  try {
    const res = await axios.get(`${BASE_URL}/api/pets?limit=5`);
    console.log('   ✅ Pet API Working');
    console.log(`   ✅ Found ${res.data.data.length} pets`);
  } catch (error) {
    console.log('   ❌ Pet API Error:', error.response?.status || error.message);
    allPassed = false;
  }

  // 5. Check Product API
  console.log('\n5️⃣ Checking Product API...');
  try {
    const res = await axios.get(`${BASE_URL}/api/products?limit=5`);
    console.log('   ✅ Product API Working');
    console.log(`   ✅ Found ${res.data.data.length} products`);
  } catch (error) {
    console.log('   ❌ Product API Error:', error.response?.status || error.message);
    allPassed = false;
  }

  // 6. Check News API
  console.log('\n6️⃣ Checking News API...');
  try {
    const res = await axios.get(`${BASE_URL}/api/news?limit=5`);
    console.log('   ✅ News API Working');
    console.log(`   ✅ Found ${res.data.data.length} news articles`);
  } catch (error) {
    console.log('   ❌ News API Error:', error.response?.status || error.message);
    allPassed = false;
  }

  // 7. Check Donation API
  console.log('\n7️⃣ Checking Donation API...');
  try {
    const res = await axios.get(`${BASE_URL}/api/donate/supporters?limit=5`);
    console.log('   ✅ Donation API Working');
    console.log(`   ✅ Found ${res.data.data.length} supporters`);
  } catch (error) {
    console.log('   ❌ Donation API Error:', error.response?.status || error.message);
    allPassed = false;
  }

  // 8. Check Environment Variables
  console.log('\n8️⃣ Checking Environment Variables...');
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];
  
  let envPassed = true;
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      envPassed = false;
      allPassed = false;
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED! System is healthy.');
    console.log('\n🚀 You can now:');
    console.log('   1. Start frontend: cd frontend && npm run dev');
    console.log('   2. Open browser: http://localhost:5173');
    console.log('   3. Login and test features');
  } else {
    console.log('❌ SOME CHECKS FAILED! Please fix the issues above.');
    console.log('\n💡 Common fixes:');
    console.log('   1. Start MongoDB: mongod');
    console.log('   2. Start Backend: cd backend && npm start');
    console.log('   3. Check .env file has all required variables');
    console.log('   4. Run seed script: npm run seed:all');
  }
  console.log('='.repeat(50));

  process.exit(allPassed ? 0 : 1);
}

checkSystemHealth().catch(error => {
  console.error('❌ Fatal Error:', error.message);
  process.exit(1);
});
