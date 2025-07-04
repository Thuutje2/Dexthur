const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Verbonden met MongoDB');
  } catch (error) {
    console.error('❌ Fout bij verbinden met MongoDB:', error);
  }
};
