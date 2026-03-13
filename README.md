# 🏥 Linda Mama - Maternal Healthcare Information and Management System

A comprehensive, professional-grade web-based maternal healthcare management system designed for tracking pregnancies, nutrition planning, immunizations, and emergency reporting.

![Linda Mama](https://img.shields.io/badge/Linda-Mama-EC4899?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge)

## ✨ Features

### 👩 For Mothers (Expectant/Nursing)
- **User Registration & Authentication** - Secure login with JWT tokens
- **Pregnancy Tracking** - Track pregnancy weeks, milestones, health metrics
- **Personalized Nutrition Guidance** - Custom meal plans by trimester
- **Immunization Scheduling** - Track child vaccination schedules with reminders
- **Emergency Reporting** - Report complications with instant alerts to providers

### 👨‍⚕️ For Healthcare Providers
- **Patient Dashboard** - View and manage patient records
- **Emergency Alerts** - Real-time notifications for critical cases
- **Patient History** - Access complete medical history
- **Case Management** - Track and respond to emergencies

### 👑 For Administrators
- **User Management** - Full CRUD operations for all users
- **System Monitoring** - Statistics and analytics dashboard
- **Role Management** - Assign and manage user roles
- **Data Overview** - Comprehensive system-wide view

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime environment |
| Express.js | Web framework |
| SQLite (better-sqlite3) | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| helmet | Security headers |
| express-rate-limit | Rate limiting |
| morgan | HTTP logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Navigation |
| Axios | HTTP client |
| react-hot-toast | Notifications |
| lucide-react | Icons |

## 📁 Project Structure

```
linda-mama/
├── backend/
│   ├── config/
│   │   └── database.js       # SQLite configuration
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── pregnancy.js      # Pregnancy tracking routes
│   │   ├── nutrition.js     # Nutrition planning routes
│   │   ├── immunization.js  # Immunization routes
│   │   ├── emergency.js     # Emergency reporting routes
│   │   └── admin.js         # Admin management routes
│   ├── seed/
│   │   └── seedData.js      # Sample data
│   ├── .env.example         # Environment template
│   ├── index.js             # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Main layout
│   │   │   ├── Loading.jsx      # Loading components
│   │   │   ├── EmptyState.jsx   # Empty state component
│   │   │   └── ConfirmDialog.jsx # Confirmation dialog
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   ├── PregnancyTracker.jsx
│   │   │   ├── Nutrition.jsx
│   │   │   ├── Immunization.jsx
│   │   │   ├── Emergency.jsx
│   │   │   ├── ProviderDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth context
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

#### 1. Clone and Setup

```bash
# Navigate to project directory
cd linda-mama

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Environment Configuration

```bash
# Copy environment template (backend)
cp backend/.env.example backend/.env
```

The default configuration works out of the box for local development.

#### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates the database and populates it with sample test data.

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📝 Demo Accounts

After running the seed script, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| 🏢 Admin | admin@lindamama.ke | password123 |
| 👨‍⚕️ Provider | provider@lindamama.ke | password123 |
| 🤰 Mother | grace@email.com | password123 |
| 🤰 Mother | faith@email.com | password123 |
| 🤰 Mother | mercy@email.com | password123 |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Pregnancy
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pregnancy/:userId` | Get pregnancy records |
| POST | `/api/pregnancy` | Create record |
| PUT | `/api/pregnancy/:id` | Update record |
| DELETE | `/api/pregnancy/:id` | Delete record |

### Nutrition
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nutrition/:userId` | Get nutrition plans |
| POST | `/api/nutrition` | Create plan |
| PUT | `/api/nutrition/:id` | Update plan |
| GET | `/api/nutrition/recommendations/:trimester` | Trimester recommendations |

### Immunization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/immunization/:userId` | Get schedules |
| POST | `/api/immunization` | Create schedule |
| PUT | `/api/immunization/:id` | Update schedule |
| GET | `/api/immunization/standards/schedule` | Standard schedule |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency` | Get all emergencies (provider/admin) |
| GET | `/api/emergency/user/:userId` | Get user emergencies |
| POST | `/api/emergency` | Create report |
| PUT | `/api/emergency/:id` | Update status |
| GET | `/api/emergency/stats/summary` | Emergency statistics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/stats` | System statistics |

## 🗄️ Database Schema

### Users
```sql
users(id, email, password, fullName, role, phone, dateOfBirth, address, isActive, createdAt, updatedAt)
```

### Pregnancy Records
```sql
pregnancy_records(id, userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms, createdAt, updatedAt)
```

### Nutrition Plans
```sql
nutrition_plans(id, userId, trimester, mealPlan, recommendations, calories, focusNutrients, isActive, createdAt, updatedAt)
```

### Immunization Schedules
```sql
immunization_schedules(id, userId, childName, dateOfBirth, vaccines, nextAppointment, completed, createdAt, updatedAt)
```

### Emergency Reports
```sql
emergency_reports(id, userId, type, description, severity, status, providerNotes, location, assignedProviderId, createdAt, resolvedAt)
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
```

## 🛡️ Security Features

- JWT authentication with expiration
- Password hashing with bcrypt (12 rounds)
- Helmet.js for security headers
- CORS configuration
- Rate limiting (general & auth-specific)
- Input validation with express-validator
- SQL injection prevention (parameterized queries)
- Request ID tracking for debugging

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📲 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🔄 Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes and test**
3. **Commit**: `git commit -m 'Add new feature'`
4. **Push**: `git push origin feature/your-feature`
5. **Create Pull Request**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Kenyan Ministry of Health for maternal healthcare guidelines
- Healthcare providers who tested the system
- Open source community for excellent tools

---

<p align="center">Made with ❤️ for maternal healthcare in Kenya</p>

# LINDA-MAMA
