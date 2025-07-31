The design of this project is inspired by [Runville.ai](https://runville.ai/), particularly the application screenshots found [here (1)](https://runville.ai/screenshots/1.png), [here (2)](https://runville.ai/screenshots/2.png), and [here (3)](https://runville.ai/screenshots/3.png).

# Run Tracker 🏃‍♂️

A modern, AI-powered web application for manual run tracking with photo uploads, interactive maps, comprehensive analytics, and intelligent insights.

## 🌟 Features

### Core Tracking
- **Manual Run Entry**: Distance, time, location, and optional photo uploads
- **Interactive Dashboard**: View all runs with stats, maps, and photos
- **Smart Location Search**: GPS integration and autocomplete via Nominatim
- **Personal Records**: Track and celebrate your best performances automatically
- **Unit Conversion**: Toggle between metric (km/min) and imperial (mi/min) units

### AI-Powered Insights ✨
- **Running Insights**: AI-generated analysis of your performance trends and patterns
- **Achievement Celebrations**: Personalized congratulations for new personal records
- **Smart Analytics**: OpenAI-powered insights based on your running history

### Visual & Interactive
- **Interactive Maps**: Leaflet maps with OpenStreetMap tiles showing run locations
- **Photo Management**: Upload run photos with S3 storage and lightbox gallery
- **Bulk Operations**: Edit and delete multiple runs efficiently
- **Dark Theme**: Modern, mobile-first responsive design

### Advanced Features
- **Location Autocomplete**: Smart search with GPS current location detection
- **Real-time Statistics**: Total runs, distance, average pace, and best times
- **Achievement Badges**: Visual indicators for personal records and milestones
- **Quick Edit**: Inline editing of run details with modal interface


### Test Credentials
```
Email: demo@runtracker.com
Password: password123
```

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **React Hook Form** + Zod validation
- **React Leaflet** for interactive maps
- **React Dropzone** for photo uploads
- **Lucide React** for icons

### Backend
- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with secure cookies
- **OpenAI API** for AI insights and celebrations
- **AWS S3** for photo storage
- **Nominatim** for geocoding
- **Rate limiting** and security middleware

### Database & Storage
- **PostgreSQL** (production: Neon.tech)
- **AWS S3** for photo storage
- **Prisma** for database management and migrations

### Testing & Quality
- **Jest** for unit and integration testing
- **GitHub Actions** for CI/CD
- **ESLint** for code quality
- **TypeScript** compilation checks

### Deployment
- **Frontend**: Vercel (automatic deployment)
- **Backend**: Render (automatic deployment)
- **Database**: Neon PostgreSQL
- **CI/CD**: GitHub Actions (testing and quality checks)

## 📦 Project Structure

```
runville/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # App Router pages & API routes
│   │   │   ├── components/ # React components
│   │   │   └── lib/       # Utilities, types, and helpers
│   │   └── package.json
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── auth/      # JWT authentication module
│       │   ├── runs/      # Run CRUD and statistics
│       │   ├── openai/    # AI insights service
│       │   ├── s3/        # File upload service
│       │   ├── upload/    # Upload controller
│       │   └── prisma/    # Database service
│       ├── prisma/        # Database schema & migrations
│       ├── test/          # E2E and integration tests
│       └── package.json
├── .github/workflows/     # CI/CD pipelines
├── package.json          # Root workspace config
└── README.md
```

## 🔧 Local Development

### Prerequisites
- **Node.js 20+**
- **npm** (comes with Node.js)
- **PostgreSQL** (or use Neon.tech)
- **OpenAI API Key** (for AI features)
- **AWS S3 Bucket** (for photo uploads)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/runville.git
   cd runville
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **Backend** (`apps/backend/.env`):
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/runtracker"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
   
   # AI Features (OpenAI)
   OPENAI_API_KEY="sk-your-openai-api-key-here"
   
   # File Storage (AWS S3)
   S3_BUCKET="your-s3-bucket-name"
   S3_REGION="us-east-1"
   S3_ACCESS_KEY_ID="your-aws-access-key"
   S3_SECRET_ACCESS_KEY="your-aws-secret-key"
   
   # Geocoding
   NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
   GEOCODE_USER_AGENT="run-tracker/1.0"
   ```
   
   **Frontend** (`apps/frontend/.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   NEXT_PUBLIC_NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
   NEXT_PUBLIC_GEOCODE_USER_AGENT="run-tracker/1.0 contact@example.com"
   ```

4. **Set up the database**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   npx prisma db seed
   cd ../..
   ```

5. **Start development servers**
   ```bash
   # Starts both frontend (3000) and backend (3001)
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health: http://localhost:3001/health

## 🤖 AI Features

### Running Insights
- **Performance Analysis**: AI-powered insights about your running patterns
- **Trend Detection**: Identifies improvements and areas for development
- **Personalized Recommendations**: Smart suggestions based on your data

### Achievement Celebrations
- **Personal Record Detection**: Automatically identifies new achievements
- **Custom Celebrations**: AI-generated congratulatory messages
- **Performance Milestones**: Recognition for distance and pace improvements


## 🔐 Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://user:pass@localhost:5432/runtracker` |
| `JWT_SECRET` | Secret for JWT token signing (32+ chars) | ✅ | `your-super-secret-jwt-key-32-characters-min` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | 🤖 | `sk-your-openai-api-key-here` |
| `S3_BUCKET` | AWS S3 bucket name for photos | 📸 | `run-tracker-photos` |
| `S3_REGION` | AWS S3 region | 📸 | `us-east-1` |
| `S3_ACCESS_KEY_ID` | AWS access key | 📸 | `AKIAXXXXXXXXXXXXX` |
| `S3_SECRET_ACCESS_KEY` | AWS secret key | 📸 | `xxxxxxxxxxxxxxxxxxxxx` |
| `NOMINATIM_BASE_URL` | Nominatim geocoding service URL | ❌ | `https://nominatim.openstreetmap.org` |
| `GEOCODE_USER_AGENT` | User agent for Nominatim | ✅ | `run-tracker/1.0 contact@example.com` |

### Frontend (`apps/frontend/.env.local`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ | `http://localhost:3001` |
| `NEXT_PUBLIC_NOMINATIM_BASE_URL` | Nominatim geocoding service URL | ❌ | `https://nominatim.openstreetmap.org` |
| `NEXT_PUBLIC_GEOCODE_USER_AGENT` | User agent for geocoding requests | ❌ | `run-tracker/1.0 contact@example.com` |

**Legend**: ✅ Required, 🤖 AI Features, 📸 Photo Uploads, ❌ Optional

## 📋 Available Scripts

### Root Level
```bash
npm run dev          # Start both frontend and backend in development
npm run build        # Build both applications for production
npm run start        # Start both applications in production mode
npm run lint         # Lint both applications
npm run test         # Run tests for both applications
```

### Frontend (`apps/frontend/`)
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (`apps/backend/`)
```bash
npm run dev          # Start NestJS development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run prisma:migrate:dev  # Run database migrations
npm run prisma:seed  # Seed database with demo data
```

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
npm run test         # Unit tests (AuthService, Controllers)
npm run test:e2e     # End-to-end tests
```

### CI/CD Pipeline
The GitHub Actions workflow automatically:
- Runs ESLint on both frontend and backend
- Executes the test suite with PostgreSQL test database
- Builds both applications to verify compilation
- Checks TypeScript type safety

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL
   - `NEXT_PUBLIC_NOMINATIM_BASE_URL`: Nominatim base URL (optional)
   - `NEXT_PUBLIC_GEOCODE_USER_AGENT`: User agent for geocoding (optional)

3. **Deploy**: Automatic deployment on push to main branch

### Backend (Render)

1. **Create Web Service**: Node.js environment on Render
2. **Configure Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string from Neon
   - `JWT_SECRET`: Strong secret for JWT signing (32+ characters)
   - `OPENAI_API_KEY`: Your OpenAI API key for AI features
   - `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: AWS S3 config
   - `NOMINATIM_BASE_URL`, `GEOCODE_USER_AGENT`: Geocoding config

3. **Deploy**: Automatic deployment on push to main branch

### Database (Neon)

1. Create a PostgreSQL database on [Neon.tech](https://neon.tech)
2. Get the connection string and add to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`

## 🗺️ API Documentation

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout  
- `GET /auth/me` - Get current user profile

### Runs Management
- `GET /runs` - Get user's runs with pagination
- `POST /runs` - Create new run entry
- `GET /runs/:id` - Get specific run details
- `PATCH /runs/:id` - Update run information
- `DELETE /runs/:id` - Delete run entry
- `GET /runs/stats` - Get comprehensive running statistics

### AI Features 🤖
- `POST /runs/insights` - Generate AI-powered running insights
- `POST /runs/generate-achievement` - Create achievement celebration

### File Management
- `POST /upload/presigned-url` - Get S3 upload URL for photos

### System
- `GET /health` - API health status and version

## 🏆 Key Features Showcase

### AI-Powered Analytics
- **Smart Insights**: OpenAI analyzes your running patterns and provides personalized feedback
- **Achievement Recognition**: Automatic detection and celebration of personal records
- **Performance Trends**: AI identifies improvements and suggests areas for development

### Advanced Run Management
- **Quick Actions**: Inline editing, bulk operations, and smart filtering
- **Visual Feedback**: Achievement badges, personal record indicators, and progress tracking
- **Location Intelligence**: GPS integration with smart address autocomplete

### Professional UI/UX
- **Mobile-First Design**: Optimized for mobile with responsive desktop experience
- **Dark Theme**: Modern aesthetic with carefully crafted color system
- **Intuitive Navigation**: Sticky header, smooth transitions, and accessible controls


**Built with ❤️ for runners everywhere** 🏃‍♀️🏃‍♂️✨
