import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Mevcut admin var mı kontrol et
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('Admin kullanıcısı zaten mevcut!');
      console.log('Username: admin');
      process.exit(0);
    }

    // Yeni admin oluştur
    const admin = await User.create({
      username: 'admin',
      email: 'admin@testhodo.com',
      password: 'admin123', // Değiştirmeyi unutma!
      role: 'admin'
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('----------------------------------');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@testhodo.com');
    console.log('----------------------------------');
    console.log('⚠️  Güvenlik için şifreyi değiştirmeyi unutma!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
