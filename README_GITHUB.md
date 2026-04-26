# 🛸 AeroTactical: 3D Global UFO Sighting Dashboard

**Developed By:** Ruby Poddar (Lead Systems Architect)

AeroTactical is a professional-grade, cinematic 3D data application designed to explore and analyze over 80,000 global UFO sighting reports. Built using React, Three.js, and Python, it provides a high-tech tactical interface for phenomena research.

## 🚀 Key Features
- **3D Cinematic Visuals:** Real-time floating 3D UFO craft and interactive star-field backgrounds.
- **Interactive Tactical Map:** Geospatial visualization of sighting hotspots with custom glowing markers.
- **Global Telemetry Filters:** Filter the massive archive by Year, Craft Shape, and Region.
- **Intelligence Stats:** High-level analytics showing regional hotspots and shape distributions.
- **Signal Feed:** A real-time scrolling feed of the latest declassified intercepts.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Three.js (R3F).
- **Backend:** Python, SQLite.
- **Visuals:** Cinematic lighting, Glassmorphism UI, and custom GLSL effects.

## 📦 Deployment Guide

### Frontend (Vercel)
This project is configured for one-click deployment to Vercel.
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `apps/ufo_tracker/frontend`.
3. Vercel will automatically read the `vercel.json` and deploy your site.

### Backend (Render/Railway)
1. Deploy the `apps/ufo_tracker/backend` folder to a Python host.
2. Ensure the `ufo_sightings.db` is present in the database path.
3. Update the `api.ts` in your frontend with your live backend URL.

---
© 2026 Ruby Poddar. All Rights Reserved.
