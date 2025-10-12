# Portfolio Server

Backend API for portfolio website built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Development

1. Install dependencies:
```bash
yarn install
```

2. Copy `.env.example` to `.env` and fill in your environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
yarn dev
```

### Production

1. Install dependencies:
```bash
yarn install --production
```

2. Set environment variables on your hosting platform

3. Start server:
```bash
yarn start
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

## 🛠️ API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

## 🔒 Security Notes

- Never commit `.env` file
- Use strong JWT_SECRET in production
- Enable MongoDB authentication
- Use HTTPS in production
- Keep dependencies updated
