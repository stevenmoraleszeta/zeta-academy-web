# 🎓 ZETA Academia

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.13-orange?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

**A modern educational platform for online and live courses with integrated payment processing**

[Features](#-features) • [Technologies](#-technologies-used) • [Installation](#-installation) • [Project Structure](#-project-structure) • [Deployment](#-deployment) • [License](#-license)

</div>

---

## ✨ Introduction

ZETA Academia is a comprehensive full-stack educational platform built with Next.js and Firebase. The platform enables students to enroll in online and live courses, access recorded classes, manage their profiles, and process payments securely through PayPal integration. Administrators can manage users, courses, and student projects through a dedicated admin panel.

### 🎯 Key Features

- **User Authentication**: Secure authentication with Firebase Auth, including Google Sign-In
- **Course Management**: Online courses (`cursos-en-linea`) and live courses (`cursos-en-vivo`) with modular content structure
- **Payment Processing**: Integrated PayPal payment gateway for course enrollment
- **Admin Dashboard**: Comprehensive admin panel for managing students, courses, and projects
- **User Profiles**: Personalized user profiles with enrollment tracking
- **Responsive Design**: Modern, responsive UI built with CSS Modules
- **Real-time Updates**: Firebase Firestore for real-time data synchronization

---

## 🚀 Technologies Used

### Frontend
- **Next.js 14.2** - React framework with App Router
- **React 18.3** - UI library
- **CSS Modules** - Scoped styling
- **React Icons** - Icon library
- **Typed.js** - Animated typing effects
- **React Beautiful DnD** - Drag and drop functionality
- **React Syntax Highlighter** - Code syntax highlighting

### Backend & Services
- **Firebase 10.13**
  - Authentication (Google Sign-In, Email/Password)
  - Firestore Database
  - Cloud Storage
- **PayPal API** - Payment processing
- **Vercel Analytics** - Performance monitoring

### Development Tools
- **ESLint** - Code linting
- **Sharp** - Image optimization
- **Date-fns** - Date manipulation
- **UUID** - Unique identifier generation

---

## ⚙️ Installation

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Firebase project with Authentication, Firestore, and Storage enabled
- PayPal Developer account (for payment processing)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zeta-academia.git
   cd zeta-academia
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

   Update the following variables in `.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # PayPal Configuration
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_SECRET=your_paypal_secret
   ```

4. **Update Firebase configuration**
   
   Replace the hardcoded Firebase config in `src/firebase/firebase.js` with environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   };
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🧩 Project Structure

```
zeta-academia/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── students/       # Student management
│   │   │   ├── usuarios/       # User management
│   │   │   └── students-proyects/  # Student projects
│   │   ├── cursos-en-linea/    # Online courses
│   │   ├── cursos-en-vivo/     # Live courses
│   │   ├── login/              # Authentication page
│   │   ├── payment/            # Payment processing
│   │   ├── perfil-usuario/     # User profile
│   │   └── ...
│   ├── components/             # Reusable React components
│   │   ├── alert/
│   │   ├── courseCardMenu/
│   │   ├── cursoCard/
│   │   ├── footer/
│   │   ├── navbar/
│   │   └── ...
│   ├── context/                # React Context providers
│   │   └── AuthContext.js      # Authentication context
│   ├── firebase/               # Firebase configuration
│   │   └── firebase.js
│   ├── assets/                 # Static assets
│   │   ├── img/
│   │   └── cursors/
│   └── pages/
│       └── api/                # API routes
│           └── create-order.js # PayPal order creation
├── public/                     # Public static files
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

### Key Directories

- **`src/app/`**: Contains all Next.js pages using the App Router
- **`src/components/`**: Reusable UI components
- **`src/context/`**: React Context for global state management
- **`src/firebase/`**: Firebase initialization and configuration
- **`src/pages/api/`**: Server-side API routes

---

## 🚢 Deployment

### Recommended Platforms

#### Vercel (Recommended)
The easiest way to deploy a Next.js application:

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/zeta-academia)

#### Other Options

- **Netlify**: Similar to Vercel, supports Next.js with serverless functions
- **AWS Amplify**: Full-stack deployment with AWS services
- **Render**: Simple deployment with automatic SSL
- **Railway**: Modern platform with database support

### Environment Variables for Production

Ensure all environment variables from `.env.example` are configured in your deployment platform's environment settings.

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration follows Next.js recommended settings
- CSS Modules for component styling
- Functional components with React Hooks

---

## 🔒 Security Notes

- **Never commit** `.env.local` or any file containing sensitive credentials
- Use environment variables for all API keys and secrets
- Keep Firebase security rules updated
- Regularly update dependencies for security patches

---

## 📜 License

**Proprietary License - All Rights Reserved**

Copyright (c) 2024 Steven Morales Fallas

All rights reserved. Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

For licensing inquiries, please contact: Steven Morales Fallas

---

## 👨‍💻 Developer

**Steven Morales Fallas**  
Full Stack Developer

---

## 🤝 Contributing

This is a proprietary project. Contributions are not accepted without explicit authorization from the project owner.

---

## 📧 Contact

For questions or inquiries about this project, please contact the developer directly.

---

<div align="center">

**Built with ❤️ by Steven Morales Fallas**

[⬆ Back to Top](#-zeta-academia)

</div>
