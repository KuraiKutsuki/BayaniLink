<!-- prettier-ignore -->
<div align="center">

<img src="./public/BayaniLink.png" alt="BayaniLink Logo" align="center" height="72" />

# BayaniLink

### Ligao City Emergency Reporting System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A real-time emergency reporting web application for **Ligao City, Albay, Philippines**, connecting citizens directly to the City Disaster Risk Reduction and Management Office (CDRRMO).

[Overview](#overview) • [Features](#features) • [Project Structure](#project-structure) • [Development Roadmap](#development-roadmap) • [Getting Started](#getting-started) • [Tech Stack](#tech-stack) • [Emergency Hotlines](#emergency-hotlines)

</div>

---

## Overview

**BayaniLink** is a responsive full-stack web application designed to improve emergency response times in Ligao City. Citizens can submit geo-tagged incident reports from their mobile devices, while local government unit (LGU) personnel monitor and manage all incoming reports through a real-time admin dashboard.

The name *"BayaniLink"* is a portmanteau of the Filipino word **"Bayanihan"** (the community spirit of unity and cooperation) and **"link"** — representing the connection between citizens and their local government during critical situations.

## Features

- **📍 GPS Location Detection**: Automatically retrieves the reporter's current coordinates via the browser's Geolocation API.
- **🗺️ Interactive Map (Phase 3)**: Incorporates a Leaflet map with a draggable pin for precise incident location marking.
- **🗂️ Categorized Incidents**: Predefined incident categories (e.g., Flood, Fire, Crash, Dangling Wire, Medical, and Other).
- **🏘️ Searchable Barangay Selection**: Live search dropdown containing all 52 barangays of Ligao City.
- **📷 Photo Upload**: Allows citizens to upload incident photos directly to a public Supabase Storage bucket.
- **🌙 Theme Toggle**: Persistent dark and light mode toggle saved to local storage for usability in low-light environments.
- **📞 Quick Dial Panel**: Floating button with one-tap access to local emergency hotlines (CDRRMO, Fire, PNP, Red Cross, 911).

## Project Structure

```text
my-emergency-app/
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind CSS configuration and theme styles
│   │   ├── layout.tsx              # Application layout with next-themes provider
│   │   └── page.tsx                # Citizen reporting homepage (mobile-first)
│   ├── components/
│   │   ├── BarangaySelect.tsx      # Searchable barangay dropdown selection
│   │   ├── CitizenForm.tsx         # Main multi-step emergency reporting form
│   │   ├── QuickDial.tsx           # Floating speed dial for hotlines
│   │   ├── ReportMap.tsx           # Leaflet map component with draggable pin
│   │   ├── ThemeProvider.tsx       # next-themes integration provider
│   │   └── ThemeToggle.tsx         # Light/dark mode button
│   ├── lib/
│   │   └── supabaseClient.ts       # Supabase Client initialization
│   └── types/
│       └── database.types.ts       # Typed Supabase schema bindings
├── public/
│   └── BayaniLink.png              # App logo asset
└── package.json                    # Project scripts & dependencies
```

## Development Roadmap

| Phase | Component | Description | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Foundation** | Next.js boilerplate, Supabase client, DB schema, and TypeScript types | ✅ Complete |
| **2** | **Citizen Interface** | Report form, photo capture & upload, Quick Dial hotline buttons | ✅ Complete |
| **3** | **Mapping Component** | Leaflet interactive map integration with draggable pin positioning | 🔄 In Progress |
| **4** | **Landing Page & Navigation** | Dedicated Homepage, Hamburger Menu, Safety Guidelines, Hotlines | 🔲 Upcoming |
| **5** | **Authentication & Roles** | Secure access control for the upcoming admin dashboard | 🔲 Upcoming |
| **6** | **Data Validation** | Spam prevention and strict validation for reports | 🔲 Upcoming |
| **7** | **AI Triage Assistant** | Collapsible Gemini-powered chatbot for safety instructions | 🔲 Upcoming |
| **8** | **Admin Dashboard** | Real-time dashboard, fully responsive for desktop & mobile | 🔲 Upcoming |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher installed on your system.
- A **Supabase** account and project initialized.
- A **Google AI Studio** API key (needed for the upcoming Phase 4).

### 1. Clone the Repository

```bash
git clone https://github.com/KuraiKutsuki/BayaniLink.git
cd BayaniLink/my-emergency-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the `my-emergency-app` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# (Phase 4) Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# (Phase 5) Admin Auth Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

### 4. Set Up Supabase

#### Database Schema
Run the following SQL script in your Supabase SQL Editor to set up the reports table and real-time subscriptions:

```sql
-- Incident status enum
CREATE TYPE report_status AS ENUM ('Submitted', 'In Progress', 'Resolved');

-- Emergency reports table
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    barangay TEXT NOT NULL,
    image_url TEXT,
    status report_status DEFAULT 'Submitted'::report_status NOT NULL
);

-- Enable real-time replication for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
```

#### Row-Level Security (RLS) Policies
Apply the following policies to secure data access:

```sql
-- Allow anonymous inserts on reports
CREATE POLICY "Allow public inserts" ON public.reports FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous reads on reports
CREATE POLICY "Allow public reads" ON public.reports FOR SELECT TO anon USING (true);

-- Allow anonymous updates on reports (admin dashboard status changes)
CREATE POLICY "Allow public updates" ON public.reports FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anonymous uploads to the incident-photos storage bucket
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'incident-photos');
```

> [!IMPORTANT]
> Make sure to create a **Storage Bucket** named `incident-photos` inside your Supabase project dashboard and configure it as **Public**.

### 5. Run the Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, Routing, and API Handlers |
| **Language** | TypeScript | Strong typing and compiler safety |
| **Styling** | Tailwind CSS v4.0 | Modern utility-first layout styling |
| **Database** | Supabase (PostgreSQL) | Data persistence, real-time sync, and file storage |
| **Mapping** | Leaflet.js / React Leaflet | Interactive coordinate selection map |
| **Theming** | next-themes | Light/dark mode propagation |
| **Icons** | Lucide React | Clean, scalable vector iconography |

## Emergency Hotlines

For immediate voice contact with responders in Ligao City, Albay:

*   **CDRRMO Ligao City:** (052) 481-0012
*   **Ligao City Fire Station:** (052) 481-0624
*   **Ligao City PNP:** (052) 481-0035
*   **Emergency / Rescue:** 911
*   **Red Cross Albay:** (052) 820-3232

> [!WARNING]
> In life-threatening emergencies, do not wait for the application to process your report. Dial **911** or contact the CDRRMO directly.

---

<div align="center">
<i>Built with ❤️ for the people of Ligao City, designed and developed entirely by a solo developer.</i>
</div>
