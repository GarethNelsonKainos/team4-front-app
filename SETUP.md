# Kainos Frontend App

## 🛠️ Tailwind Commands

### Development
```bash
# Build CSS in watch mode (auto-rebuilds on template changes)
npm run build-css

# Build optimized CSS for production
npm run build-css-prod
```

## 🏗️ Project Structure

```
src/
├── index.ts              # Main Express server
├── templates/
│   ├── layouts/
│   │   └── base.njk      # Base template for inheritance
│   ├── pages/
│   │   ├── home.njk      # Homepage template
│   │   └── jobs.njk      # Jobs listing template
│   └── partials/
│       ├── nav.njk       # Navigation component
│       └── footer.njk    # Footer component
└── styles/
    └── input.css         # Tailwind CSS input file

public/
└── css/
    └── styles.css        # Generated Tailwind CSS

tailwind.config.js        # Tailwind CSS configuration
postcss.config.js         # PostCSS configuration
```