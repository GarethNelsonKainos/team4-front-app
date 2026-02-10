# Kainos Frontend App

A modern frontend application built with Node.js, Express, Nunjucks templating, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev

# Build CSS in watch mode (auto-rebuilds on template changes)
npm run build-css
```

### Production Build
```bash
# Full production build (TypeScript + CSS)
npm run build

# Build optimized CSS for production only
npm run build-css-prod

# Start production server
npm start
```

### Code Quality & CI/CD
```bash
# Format code with Biome
npm run format

# Lint and fix code issues
npm run lint

# Run all checks and fixes
npm run check

# CI check (for GitHub Actions) - no fixes applied
npm run ci:check

# Deploy (runs build process)
npm run deploy
```

## 🗺️ Application Routes

- **`/`** - Homepage with company information
- **`/jobs`** - Job listings page (shows only open positions)
- **`/job-roles/:id`** - Job detail page for specific role (e.g., `/job-roles/1`)

### Job Detail Page
The job detail page (`/job-roles/:id`) displays comprehensive information about a specific job role including:
- Role title and description
- Requirements and qualifications
- Location and employment type
- Application process

## 🏗️ Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD pipeline
├── src/
│   ├── index.ts              # Main Express server with routes
│   ├── data/
│   │   └── mockData.ts       # Job roles mock data
│   ├── templates/
│   │   ├── layouts/
│   │   │   └── base.njk      # Base template for inheritance
│   │   ├── pages/
│   │   │   ├── home.njk      # Homepage template
│   │   │   ├── jobs.njk      # Jobs listing template
│   │   │   └── job-detail.njk # Individual job detail template
│   │   └── partials/
│   │       ├── nav.njk       # Navigation component
│   │       └── footer.njk    # Footer component
│   └── styles/
│       └── input.css         # Tailwind CSS input file
├── public/
│   ├── css/
│   │   └── styles.css        # Generated Tailwind CSS (git ignored)
│   └── images/               # Static assets
├── dist/                     # Compiled TypeScript output (git ignored)
├── biome.json                # Biome linter/formatter configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## 🛠️ Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **In another terminal, build CSS in watch mode:**
   ```bash
   npm run build-css
   ```

3. **Make changes to templates, TypeScript, or CSS**

4. **Before committing, check code quality:**
   ```bash
   npm run check
   ```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. **Installs dependencies** with `npm ci`
2. **Runs code quality checks** with `npm run ci:check`
3. **Builds the application** with `npm run build`
4. **Generates production CSS** (minified)

### Pipeline runs on:
- Push to `main` branch
- Pull requests to `main` branch

## 🎨 Styling

Using **Tailwind CSS** with custom Kainos brand colors:
- Primary: `kainos-500` (#61A83F)
- Hover: `kainos-600` (#569137)
- Active: `kainos-700` (#4b7f31)

## 🧪 Adding Tests

When you're ready to add tests, update the test script in `package.json` and uncomment the test step in the CI workflow.

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Templating:** Nunjucks
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting/Formatting:** Biome
- **CI/CD:** GitHub Actions