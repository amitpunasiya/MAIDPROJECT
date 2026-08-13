// Quick admin check script — reads admin users from local MongoDB
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/maid_cook_db';

void (async () => {
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', UserSchema, 'users');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    const admins = await User.find({ role: 'admin' }).lean();

    if (admins.length === 0) {
      console.log('\n⚠️  No admin users found in the database.\n');
      console.log('Run: npx tsx src/jobs/seedAdmin.ts  to create one.\n');
    } else {
      console.log(`\n✅ Found ${admins.length} admin user(s):\n`);
      for (const admin of admins as Record<string, unknown>[]) {
        console.log('────────────────────────────────────');
        console.log('  _id     :', admin['_id']);
        console.log('  Name    :', admin['name']);
        console.log('  Email   :', admin['email']);
        console.log('  Phone   :', admin['phone']);
        console.log('  Role    :', admin['role']);
        console.log('  Verified:', admin['isVerified']);
        console.log('  Active  :', admin['isActive']);
        console.log('  Created :', admin['createdAt']);
        console.log('────────────────────────────────────\n');
      }
    }
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
