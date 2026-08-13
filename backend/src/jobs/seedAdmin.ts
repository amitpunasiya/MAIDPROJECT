// Seed script — creates a default super-admin user in MongoDB
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Credentials (change before production!) ─────────────────────────────────
const ADMIN_EMAIL = 'admin@maidproject.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'Super Admin';
const ADMIN_PHONE = '9000000000';
// ─────────────────────────────────────────────────────────────────────────────

const MONGODB_URI = 'mongodb://127.0.0.1:27017/maid_cook_db';
const SALT_ROUNDS = 12;

// Minimal schemas (strict: false so we can insert any fields)
const UserSchema = new Schema({}, { strict: false });
const AdminSchema = new Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema, 'users');
const Admin = mongoose.model('Admin', AdminSchema, 'admins');

void (async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL }).lean();
    if (existing) {
      console.log('\n⚠️  Admin user already exists:');
      console.log('  Email:', ADMIN_EMAIL);
      console.log('  Use the password you set, or delete the user and re-run.\n');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    // Create User document
    const user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'admin',
      isPhoneVerified: true,
      isEmailVerified: true,
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create linked Admin profile
    await Admin.create({
      userId: user._id,
      isSuperAdmin: true,
      isActive: true,
      permissions: [
        'manage_users',
        'manage_cooks',
        'manage_bookings',
        'manage_payments',
        'manage_withdrawals',
        'manage_coupons',
        'manage_settings',
        'manage_support',
        'view_audit_logs',
        'manage_documents',
      ],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('────────────────────────────────────');
    console.log('  Email    :', ADMIN_EMAIL);
    console.log('  Password :', ADMIN_PASSWORD);
    console.log('  Role     : admin (super)');
    console.log('  Phone    :', ADMIN_PHONE);
    console.log('────────────────────────────────────\n');
  } catch (err) {
    if (err instanceof Error && err.message.includes('ECONNREFUSED')) {
      console.error('\n❌ MongoDB is NOT running on localhost:27017');
      console.error('   Start it with:  mongod  or  net start MongoDB\n');
    } else {
      console.error('❌ Error:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
})();
