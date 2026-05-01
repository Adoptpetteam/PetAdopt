require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const volunteers = await mongoose.connection.collection('volunteers')
      .find({})
      .project({ name:1, status:1, email:1, reason:1 })
      .toArray();
    console.log(JSON.stringify(volunteers, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
