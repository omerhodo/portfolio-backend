import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

      // Kullanıcıyı bul ve request'e ekle (şifre hariç)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı, yetkilendirme reddedildi' });
  }
};

// Admin kontrolü
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin yetkisi gerekli' });
  }
};
