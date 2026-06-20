# 🆘 Bayanilink — Ligao City Emergency Reporting System

> A real-time emergency reporting web application for **Ligao City, Albay, Philippines**, connecting citizens directly to the City Disaster Risk Reduction and Management Office (CDRRMO).

---

## 📋 Overview

**Bayanilink** is a responsive full-stack web application built to improve emergency response times in Ligao City. Citizens can submit geo-tagged incident reports from their mobile devices, while LGU personnel monitor and manage all incoming reports through a real-time admin dashboard.

The name *"Bayanilink"* comes from the Filipino word **"Bayanihan"** (community spirit of helping one another) and **"link"** — representing the connection between citizens and their local government during emergencies.

---

## ✨ Features

### 👥 Citizen Interface (Mobile-First)
- 📍 **GPS Location Detection** — Automatically fetches the reporter's current coordinates via the browser Geolocation API
- 🗂️ **Incident Categories** — Flood, Fire, Crash, Dangling Wire, Medical, Other
- 🏘️ **Barangay Selection** — All 52 barangays of Ligao City are listed
- 📷 **Photo Upload** — Upload incident photos directly to Supabase Storage
- 🌙 **Dark / Light Mode** — Smooth theme toggle saved to local storage
- 📞 **Quick Dial** — Floating button with one-tap access to Ligao City emergency hotlines (CDRRMO, Fire, PNP, Red Cross, 911)

### 🗺️ Mapping Component *(Phase 3 — In Progress)*
- Interactive Leaflet map with a draggable pin for precise incident location marking

### 🤖 AI Triage Assistant *(Phase 4 — Upcoming)*
- Collapsible chatbot powered by the **Gemini API**
- Provides first aid guidance and app usage instructions
- Enforced safety prompt: always directs life-threatening situations to Quick Dial

### 🖥️ LGU Admin Dashboard *(Phase 5 — Upcoming)*
- Secured login for CDRRMO personnel
- Real-time split-screen: filterable report list + live map with colored status pins
- One-click status updates (Submitted → In Progress → Resolved) with Supabase real-time subscriptions
- Incident analytics summary

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + Real-time) |
| **Storage** | Supabase Storage Buckets |
| **Maps** | [Leaflet.js](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| **AI** | [Google Gemini API](https://ai.google.dev/) via Next.js Route Handlers |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🗄️ Database Schema

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

-- Enable real-time replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project with the schema above
- (Phase 4) A [Google AI Studio](https://aistudio.google.com/app/apikey) API key

### 1. Clone the repository
```bash
git clone https://github.com/KuraiKutsuki/BayaniLink.git
cd BayaniLink/my-emergency-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Added in Phase 4
GEMINI_API_KEY=your_gemini_api_key

# Added in Phase 5
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

### 4. Set up Supabase
Run the database schema SQL in your Supabase SQL Editor, then:
- Create a **Storage Bucket** named `incident-photos` (set to public)
- Add the following **RLS Policies**:

```sql
-- Allow public inserts on reports
CREATE POLICY "Allow public inserts" ON public.reports FOR INSERT TO anon WITH CHECK (true);

-- Allow public reads on reports
CREATE POLICY "Allow public reads" ON public.reports FOR SELECT TO anon USING (true);

-- Allow public updates on reports (for admin status changes)
CREATE POLICY "Allow public updates" ON public.reports FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anonymous uploads to incident-photos bucket
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'incident-photos');
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
my-emergency-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with ThemeProvider
│   │   ├── page.tsx                # Citizen reporting home page (mobile-first)
│   │   ├── globals.css             # Tailwind v4 + dark mode styles
│   │   ├── admin/
│   │   │   ├── page.tsx            # Admin dashboard (Phase 5)
│   │   │   └── login/
│   │   │       └── page.tsx        # LGU admin login (Phase 5)
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts        # Gemini AI route handler (Phase 4)
│   ├── components/
│   │   ├── CitizenForm.tsx         # Main report submission form
│   │   ├── QuickDial.tsx           # Floating emergency hotlines button
│   │   ├── ThemeProvider.tsx       # next-themes wrapper
│   │   ├── ThemeToggle.tsx         # Dark/light mode toggle button
│   │   ├── ReportMap.tsx           # Leaflet map component (Phase 3)
│   │   ├── Chatbot.tsx             # AI triage assistant UI (Phase 4)
│   │   ├── AdminDashboard.tsx      # Report management panel (Phase 5)
│   │   └── AnalyticsCharts.tsx     # Incident analytics charts (Phase 5)
│   ├── lib/
│   │   └── supabaseClient.ts       # Supabase client instance
│   └── types/
│       └── database.types.ts       # TypeScript DB interfaces
└── .env.local                      # Environment variables (gitignored)
```

---

## 📞 Emergency Hotlines (Ligao City)

| Agency | Number |
|---|---|
| CDRRMO Ligao City | (052) 481-0012 |
| Ligao City Fire Station | (052) 481-0624 |
| Ligao City PNP | (052) 481-0035 |
| Emergency / Rescue | 911 |
| Red Cross Albay | (052) 820-3232 |

---

## 🗺️ Development Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation — Next.js setup, Supabase client, DB types | ✅ Complete |
| 2 | Citizen Interface — Report form, photo upload, Quick Dial | ✅ Complete |
| 3 | Mapping Component — Leaflet map with draggable pin | 🔄 In Progress |
| 4 | AI Triage Assistant — Gemini chatbot route + UI | 🔲 Upcoming |
| 5 | Admin Dashboard — Real-time management, analytics | 🔲 Upcoming |

---

## 📄 License

This project was developed as a prototype for Ligao City, Albay, Philippines. All rights reserved.

---

*Built with ❤️ for the people of Ligao City.*
