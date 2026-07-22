# EduTrack

A comprehensive school fees management and payment system built for modern educational institutions. EduTrack streamlines student registration, fee collection, academic results management, and school administration through a unified, role-based web platform.

## Features

### Student Management
- Online student registration with document upload
- Role-based access (student, admin, bursar, registrar, teacher)
- Profile management and password reset

### Finance & Payments
- Configurable fee structures per class and academic term
- Secure payment recording with receipt management
- Payment confirmation workflow for bursars
- Real-time payment status tracking

### Academics
- Class-wise result entry and management
- Automated class ranking
- Result publishing with draft/published states
- Timetable management per class/stream

### Administration
- Registration approval queue for admins
- Comprehensive complaint and support ticketing system
- Event management and school calendar
- In-app notifications and alerts

### Analytics & Reporting
- Interactive dashboards with financial and academic insights
- Excel export for payments, results, and registrations
- Google Analytics integration

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **State & Forms:** React Hook Form, Zod
- **Routing:** React Router DOM
- **Charts:** Recharts
- **Backend:** Firebase (Auth, Firestore, Cloud Storage, Cloud Functions, Analytics)
- **Utilities:** Lucide React, clsx, tailwind-merge, XLSX

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore, Auth, Storage, and Functions enabled

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Firebase Configuration

Update `.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  components/    # Reusable UI components
  contexts/      # React contexts (authentication)
  lib/           # Firebase service layer and utilities
  pages/         # Route-level pages by role
  types/         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.
