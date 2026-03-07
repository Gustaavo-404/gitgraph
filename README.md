<div align="center">

<img src="public/logo.png" width="120"/>

# GitGraph

**Modern SaaS platform for analyzing repository health, tracking development metrics, and generating actionable insights for engineering teams. GitGraph is written in Typescript, React/Next.js and PostgreSQL**

![Build Status](https://img.shields.io/badge/build-passing-00C49F)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)

</div>

---

# ⚓ Overview

GitGraph is a **high-end analytics platform for GitHub repositories** designed to help developers and teams understand the health of their projects.

The platform evaluates multiple aspects of a repository, including:

- Technical debt indicators
- Codebase health metrics
- Development activity
- Repository structure insights
- Language distribution
- AI-driven analysis

All results are aggregated into a **Health Score** that reflects the overall condition of a repository.

The platform also provides **exportable reports**, allowing teams to share insights and track improvements over time.

---

# ⚓ Tech Stack

GitGraph was built using a modern full-stack architecture focused on performance, scalability, and a polished user experience.

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=gsap&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge)

### Backend

![Next.js API](https://img.shields.io/badge/Next.js_API-000000?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![GitHub OAuth](https://img.shields.io/badge/GitHub_OAuth-181717?style=for-the-badge&logo=github&logoColor=white)

### Data & Analytics

![AI Analysis](https://img.shields.io/badge/AI_Analysis-FF6B6B?style=for-the-badge)
![Repository Metrics](https://img.shields.io/badge/Metrics_Engine-4CAF50?style=for-the-badge)
![D3 Visualizations](https://img.shields.io/badge/D3_Data_Viz-F9A03C?style=for-the-badge)

### Export & Reports

![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge)
![PDF Export](https://img.shields.io/badge/PDF_Export-E34F26?style=for-the-badge)
![CSV Export](https://img.shields.io/badge/CSV_Export-2ECC71?style=for-the-badge)
![JSON Export](https://img.shields.io/badge/JSON_Export-000000?style=for-the-badge)

---

## 1️⃣ Connect GitHub Account

Users begin by connecting their GitHub profile securely using OAuth authentication.

<img src="public/steps/step1.png" width="900"/>

> **Start by connecting your GitHub profile.**  
> GitGraph uses this connection to access your repositories and provide a personalized analysis of your development workflow.

---

## 2️⃣ Select Repositories

Choose which repositories should be monitored.

<img src="public/steps/step2.png" width="900"/>

> **Select specific repositories** to generate a complete overview of your projects.

---

## 3️⃣ AI Repository Analysis

GitGraph scans the selected repository and calculates the **Health Score**.

<img src="public/steps/step3.png" width="900"/>

The analysis evaluates:

- Technical debt signals
- Security risks
- Community adoption
- Structural issues

All results contribute to the repository **health score**.

---

## 4️⃣ Review Insights

Detailed reports help developers understand what needs attention.

<img src="public/steps/step4.png" width="900"/>

Insights are categorized by severity so developers can quickly prioritize improvements.

---

## 5️⃣ Reports & Export

Repositories can be analyzed through comprehensive reports and exported for external use.

<img src="public/steps/step5.png" width="900"/>

Available exports:

- **PDF Reports**
- **CSV Metrics**
- **JSON Data**

These exports allow teams to:

- track technical debt reduction
- share analytics with stakeholders
- archive repository health snapshots

---

# 📦 Installation

Clone the repository:

```
git clone https://github.com/Gustaavo-404/gitgraph.git
cd gitgraph
```

Install dependencies:

```
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

Example configuration:

```
DATABASE_URL="postgresql://user:password@localhost:5432/gitgraph"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

---

# 🗄 Database Setup (Prisma)

Generate Prisma client:

```
npx prisma generate
```

Run migrations:

```
npx prisma migrate dev
```

This will:

* create the database schema
* generate the Prisma client
* sync models with PostgreSQL

You can also open Prisma Studio:

```
npx prisma studio
```

---

# ▶️ Running the Development Server

Start the development server:

```
npm run dev
```

Then open:

```
http://localhost:3000
```

The application will automatically reload when changes are made.

---

# 📊 Key Features

- **GitHub Repository Connection** – Secure OAuth integration to connect personal repositories or entire organizations.

- **Repository Metrics Dashboard** – View essential project metrics such as stars, forks, open issues, contributors, and repository activity.

- **AI-Powered Health Score** – Composite score based on activity, development processes, maintainability, PR load, and repository popularity.

- **Development Activity Insights** – Analyze commit frequency and development trends over the last 7, 30, and 90 days.

- **Language Distribution** – Visualize the composition of the codebase with detailed language usage charts.

- **Developer Insights** – Understand contributor activity, team participation, and approximate development lead time.

- **Exportable Reports** – Generate downloadable analytics reports in **PDF, CSV, and JSON** formats.

---

# 🧱 Architecture

GitGraph follows a modular architecture.

```
Next.js (App Router)
│
├── Authentication (GitHub OAuth)
├── Repository Analytics Engine
├── Metrics Processing
├── Visualization Layer (D3)
├── Export Engine (Puppeteer)
└── Database Layer (Prisma + PostgreSQL)
```

---

# 🎯 Use Cases

GitGraph is designed for:

* engineering teams
* tech leads
* open-source maintainers
* SaaS teams
* individual developers tracking project health

---

# 📈 Future Roadmap

Planned improvements:

* complete documentation site
* full responsive interface (mobile & tablet support)
* improved dashboard and analytics experience
* landing page enhancements
* historical repository analytics
* CI/CD integrations
* automated health alerts

---

# 📄 License

GitGraph is licensed under the MIT License.

---

⚓ GitGraph — Understand, measure, and improve the health of your codebase.
