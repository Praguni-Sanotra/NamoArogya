# NAMOAROGYA - Healthcare Platform

A modern Progressive Web Application (PWA) for healthcare management, integrating AYUSH (NAMASTE) and ICD-11 medical coding systems.

## 🚀 Features

- **Dual Medical Coding System**: Seamlessly map NAMASTE (AYUSH) codes to ICD-11 international standards
- **Patient Management**: Complete CRUD operations for patient records
- **Analytics Dashboard**: Real-time insights with interactive charts and visualizations
- **Role-Based Access**: Support for Doctor and Admin roles
- **Progressive Web App**: Installable, offline-capable, and mobile-friendly
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **State Management**: Redux Toolkit for predictable state updates
- **API Ready**: Centralized Axios service with interceptors

## 🛠️ Tech Stack

### Core
- **React 18.3** - UI library
- **Vite 5.4** - Build tool and dev server
- **React Router 6** - Client-side routing

### State & Data
- **Redux Toolkit** - State management
- **Axios** - HTTP client with interceptors

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### PWA
- **vite-plugin-pwa** - PWA configuration
- **Workbox** - Service worker and caching strategies

## 📁 Project Structure

```
namoarogya/
├── public/
│   ├── icons/              # PWA icons (to be added)
│   └── manifest.json       # PWA manifest (auto-generated)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Header.jsx
│   │   ├── Input.jsx
│   │   ├── Sidebar.jsx
│   │   └── Table.jsx
│   ├── layouts/            # Layout components
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── pages/              # Page components
│   │   ├── Analytics.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── DualCoding.jsx
│   │   ├── Login.jsx
│   │   └── PatientRecords.jsx
│   ├── routes/             # Routing configuration
│   │   └── ProtectedRoute.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── diagnosisService.js
│   │   └── patientService.js
│   ├── store/              # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── diagnosisSlice.js
│   │   │   └── patientSlice.js
│   │   └── index.js
│   ├── utils/              # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   ├── index.css           # Global styles
│   └── registerSW.js       # Service worker registration
├── .env.example            # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/pragunisanotra/Desktop/NamoArogya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Authentication

The app includes a login system with role-based access control.

**Demo Credentials:**
- Email: `demo@namoarogya.com`
- Password: `demo123`
- Role: Doctor or Admin

## 📱 PWA Features

### Installation
- Click the install button in your browser's address bar
- Or use the "Add to Home Screen" option on mobile

### Offline Support
- Service worker caches static assets
- API responses are cached with NetworkFirst strategy
- Offline fallback page for network errors

### Update Notifications
- Automatic service worker updates
- User prompt to reload for new versions

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the healthcare theme:

```javascript
colors: {
  primary: { ... },    // Medical teal
  secondary: { ... },  // Medical green
  accent: { ... },     // Alert red
}
```

### API Configuration
Update the base URL in `.env`:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

## 🔌 API Integration

The app is ready for backend integration. All API services are in `src/services/`:

- **authService.js** - Login, logout, token management
- **patientService.js** - Patient CRUD operations
- **diagnosisService.js** - NAMASTE/ICD-11 code search and dual coding

### Expected API Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh

GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id

GET    /api/namaste/search?q=query
GET    /api/namaste/:code
GET    /api/icd11/search?q=query
GET    /api/icd11/:code

POST   /api/dual-coding
GET    /api/dual-coding/mapping

GET    /api/analytics/overview
GET    /api/analytics/patients
GET    /api/analytics/diagnosis
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components with props
- **Pages**: Route-level components
- **Services**: API call abstractions
- **Store**: Redux slices for state management
- **Utils**: Helper functions and constants

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is proprietary software for NAMOAROGYA healthcare platform.

## 🤝 Contributing

This is a private healthcare application. For access or contributions, please contact the development team.

## 📞 Support

For technical support or questions:
- Email: support@namoarogya.com
- Documentation: [Internal Wiki]

---

**Built with ❤️ for better healthcare management**
# NamoArogya
# NamoArogya
