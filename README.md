# 🏗️ Fortune Construction — Building Malawi's Future

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

A premium, high-performance web application built for **Fortune Construction**, Malawi's leading civil engineering and construction firm. This project showcases two decades of excellence through a modern, interactive, and visually stunning interface.

---

## ✨ Features

- 🎬 **Dynamic Video Background**: A custom-built cross-fade slider in the Hero section featuring high-quality construction footage.
- 📱 **Fully Responsive**: Optimized for all devices, from mobile phones to large 4K displays.
- 🧭 **Interactive Timeline**: A visual journey through the company's 20-year history and landmark achievements.
- 📁 **Project Portfolio**: A categorized masonry grid showing completed roads, bridges, and buildings.
- ⚡ **Performance Optimized**: Built with Vite for lightning-fast HMR and optimized asset loading.
- 🎨 **Premium Aesthetic**: Custom navy and gold theme with smooth reveal animations and minimalist design.
- 📩 **Validated Contact System**: Advanced form handling with React Hook Form and Zod validation.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Form Handling**: React Hook Form + @hookform/resolvers
- **Validation**: Zod
- **Animations**: Custom Tailwind animations & Intersection Observer

---

## 📂 Project Structure

The project follows a clean, modular architecture:

```text
src/
├── components/   # Atomic UI components (Hero, Navbar, Impact, etc.)
├── lib/          # Utilities (cn, validation schemas)
├── store/        # Zustand stores for global state
├── styles/       # Global CSS & Tailwind configuration
└── assets/       # Static assets (moved to public/ for CDN-like access)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ (CI and production use Node 20)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Generate a production-ready bundle:
```bash
npm run build
```

### CI
Every pull request and every push to `main` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml) on Node 20: API typecheck + tests, dashboard build, and public site typecheck + build.

---

## 🏗️ Building with Excellence
*Fortune Construction Limited — Plot 123, Area 4, Lilongwe, Malawi.*
