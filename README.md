# PaynesDashboard

A Dev Hustler's Dashboard - A customizable, modular dashboard website that integrates multiple data sources and services for tracking analytics, social media, affiliate marketing, and AI-powered content generation.

## 🚀 Features

### Current (Phase 1)
- **Modular Widget System**: Draggable, resizable widget grid using react-grid-layout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **User Authentication**: Basic login/logout functionality with JWT tokens
- **User Preferences**: Theme settings and dashboard layout persistence
- **Placeholder Widgets**: Ready for Phase 2 integrations
  - Analytics Widget (App Store, Google Play, Book Sales)
  - Social Media Widget (Facebook, YouTube, TikTok)
  - Affiliate Marketing Widget (Amazon Associates)
  - RSS Feed Widget
  - AI Content Widget (OpenAI)

### Planned (Phase 2)
- **Analytics Integrations**: Apple App Store Connect, Google Play Developer Console, IngramSpark, Draft2Digital
- **Social Media Tracking**: Facebook likes, YouTube subscribers, TikTok likes/follows
- **Campaign Management**: OnlySocial and Postly integration for scheduling posts
- **Affiliate Marketing**: Amazon Associates tracking
- **Content Feeds**: RSS feed aggregation
- **AI Content Generation**: OpenAI API for app write-ups, release notes, and marketing copy

## 📁 Project Structure

```
PaynesDashboard/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Header, DashboardGrid
│   │   │   └── widgets/     # Widget components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, utilities
│   │   └── types/           # TypeScript type definitions
│   └── ...
│
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── api/
│   │   │   └── routes/      # API route handlers
│   │   ├── config/          # Configuration management
│   │   ├── integrations/    # External service integrations
│   │   │   ├── analytics/   # App Store, Google Play, book sales
│   │   │   ├── social-media/# Facebook, YouTube, TikTok
│   │   │   ├── affiliate/   # Amazon Associates
│   │   │   ├── rss/         # RSS feed handling
│   │   │   └── ai/          # OpenAI integration
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic services
│   │   └── types/           # TypeScript type definitions
│   └── ...
│
├── README.md                 # This file
└── LICENSE                   # Apache 2.0 License
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ (recommended: 20.x)
- npm 9+ or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and configure your settings:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-secure-secret-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |

## 📜 Available Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run format` | Format code with Prettier |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `PUT /api/preferences/layout` - Update dashboard layout

### Widgets
- `GET /api/widgets/available` - List available widgets
- `GET /api/widgets/:widgetId/data` - Get widget data

### Health
- `GET /api/health` - API health check

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] Project structure setup
- [x] Next.js frontend with TypeScript
- [x] React-grid-layout widget system
- [x] Express.js backend API
- [x] Basic authentication
- [x] User preferences storage
- [x] Placeholder widgets
- [x] Documentation

### Phase 2 (Planned)
- [ ] Apple App Store Connect integration
- [ ] Google Play Console integration
- [ ] IngramSpark integration
- [ ] Draft2Digital integration
- [ ] Facebook API integration
- [ ] YouTube API integration
- [ ] TikTok API integration
- [ ] Amazon Associates integration
- [ ] RSS feed aggregation
- [ ] OpenAI API integration
- [ ] OnlySocial integration
- [ ] Postly integration
- [ ] Database integration (PostgreSQL)
- [ ] Real-time updates (WebSockets)
