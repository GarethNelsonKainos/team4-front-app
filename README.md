# Kainos Frontend App

Team 4 Frontend Application Feb/March 2026

A modern frontend application built with Node.js, Express, Nunjucks templating, TypeScript, and Tailwind CSS.

## ✅ Requirements

- Node.js >= 20 (required for pa11y-ci 4.x)
- npm (bundled with Node.js)

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

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
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
│   └── __tests__/
│       └── index.test.ts     # API endpoint tests
├── views/
│   ├── layouts/
│   │   └── base.njk          # Base template for inheritance
│   ├── pages/
│   │   ├── home.njk          # Homepage template
│   │   ├── jobs.njk          # Jobs listing template
│   │   └── job-detail.njk    # Individual job detail template
│   └── partials/
│       ├── nav.njk           # Navigation component
│       └── footer.njk        # Footer component
├── src/styles/
│   └── input.css             # Tailwind CSS input file
├── public/
│   ├── css/
│   │   └── styles.css        # Generated Tailwind CSS (git ignored)
│   └── images/               # Static assets
├── dist/                     # Compiled TypeScript output (git ignored)
├── coverage/                 # Test coverage reports (git ignored)
├── biome.json                # Biome linter/formatter configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Vitest testing configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## 🛠️ Development Workflow

### First-Time Setup
After cloning the repository:

```bash
# Install dependencies
npm install

# Generate the CSS for the first time
npm run build-css-prod
```

**Note:** The generated `public/css/styles.css` file is excluded from source control and must be built locally or in CI/CD pipelines.

### Daily Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, build CSS in watch mode:**
   ```bash
   npm run build-css
   ```
   This watches for changes in templates and rebuilds CSS automatically.

3. **Make changes to templates, TypeScript, or CSS**

4. **Run tests to ensure everything works:**
   ```bash
   npm test
   ```

5. **Check test coverage:**
   ```bash
   npm run test:coverage
   ```

6. **Before committing, check code quality:**
   ```bash
   npm run check
   ```

## 🏗️ Build Process

### CSS Generation
Tailwind CSS styles are generated from `public/input.css`:

- **Development:** `npm run build-css` - Watches for changes and rebuilds
- **Production:** `npm run build-css-prod` - Minified one-time build

The output `public/css/styles.css` is a build artifact and is **not committed to source control**.

### TypeScript Compilation
TypeScript is compiled to JavaScript in the `dist/` directory:

- **Development:** `tsx` runs TypeScript directly without compilation
- **Production:** `npm run build` compiles to `dist/` for deployment

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. **Installs dependencies** with `npm ci`
2. **Runs code quality checks** with `npm run ci:check`
3. **Runs test suite** with `npm test`
4. **Generates coverage report** with `npm run test:coverage`
5. **Builds the application** with `npm run build`
6. **Generates production CSS** (minified)

### Pipeline runs on:
- Push to `main` branch
- Pull requests to `main` branch

## 🐳 ACR Image Publish (Manual)

Use the script in [scripts/acr-build-push.sh](scripts/acr-build-push.sh) to build and push images to ACR.

### Quick start

```bash
chmod +x scripts/acr-build-push.sh
scripts/acr-build-push.sh
```

By default this pushes three tags: `latest`, `dev`, and `sha-<shortSHA>`.

### Optional overrides

```bash
ACR_NAME=academyacrj3r5dv \
ACR_LOGIN_SERVER=academyacrj3r5dv.azurecr.io \
IMAGE_REPOSITORY=team4-front-app-cameron \
PLATFORM=linux/amd64 \
scripts/acr-build-push.sh
```

### Find immutable tags in ACR

```bash
az acr repository show-tags \
   --name academyacrj3r5dv \
   --repository team4-front-app-cameron \
   --orderby time_desc \
   --top 30 \
   --output table | grep '^sha-'
```

## 🧪 Testing

The project includes comprehensive API testing using **Vitest** and **Supertest**:

- **Test Coverage:** 81.25% statements, 100% functions
- **Test Runner:** Vitest with TypeScript support
- **HTTP Testing:** Supertest for API endpoint validation
- **Coverage Reports:** Generated in `coverage/` directory

### Running Tests
```bash
# Run tests once
npm test

# Run tests with coverage report
npm run test:coverage

# View coverage report (after running test:coverage)
open coverage/index.html
```

## 🎨 Styling

Using **Tailwind CSS** with custom Kainos brand colors:
- Primary: `kainos-500` (#61A83F)
- Hover: `kainos-600` (#569137)
- Active: `kainos-700` (#4b7f31)

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Templating:** Nunjucks
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Supertest
- **Linting/Formatting:** Biome
- **CI/CD:** GitHub Actions
