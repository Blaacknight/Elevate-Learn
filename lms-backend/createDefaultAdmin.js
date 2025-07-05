const bcrypt = require('bcrypt');
const User = require('./models/user.model'); // adjust path based on your folder structure

async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@lms.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 10);

      const adminUser = new User({
        name: 'Super Admin',
        email: 'admin@lms.com',
        password: hashedPassword,
        role: 'admin',
        bio: 'Default system admin',
      });

      await adminUser.save();
      console.log('✅ Default admin user created: admin@lms.com / password: admin');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
}

module.exports = createDefaultAdmin;
