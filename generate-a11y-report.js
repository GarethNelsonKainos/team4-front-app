import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON results
const resultsPath = process.argv[2] || './output/accessibility/pa11y-results.json';
const rawData = readFileSync(resultsPath, 'utf8');

// Extract just the JSON (last line after any warnings)
const lines = rawData.trim().split('\n');
const jsonLine = lines[lines.length - 1];
const results = JSON.parse(jsonLine);

// Generate HTML report
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pa11y Accessibility Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { 
            color: #1f3a7d;
            margin-bottom: 2rem;
            font-size: 2.5rem;
        }
        .summary {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .passes { color: #22c55e; }
        .errors { color: #ef4444; }
        .total { color: #1f3a7d; }
        
        .url-section {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
        }
        .url-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 1rem;
        }
        .url-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1f3a7d;
            word-break: break-all;
        }
        .badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        .badge-error {
            background: #fee2e2;
            color: #991b1b;
        }
        .error-list {
            list-style: none;
        }
        .error-item {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
        }
        .error-message {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 0.5rem;
        }
        .error-details {
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.5rem;
        }
        .error-code {
            display: inline-block;
            background: #fff;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }
        .timestamp {
            text-align: center;
            color: #666;
            margin-top: 2rem;
            font-size: 0.9rem;
        }
        .no-errors {
            text-align: center;
            color: #166534;
            padding: 1rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 Pa11y Accessibility Report</h1>
        
        <div class="summary">
            <div class="stat">
                <div class="stat-value total">${results.total}</div>
                <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat">
                <div class="stat-value passes">${results.passes}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value errors">${results.errors}</div>
                <div class="stat-label">Errors</div>
            </div>
        </div>

        ${Object.entries(results.results).map(([url, errors]) => `
            <div class="url-section">
                <div class="url-header">
                    <div class="url-title">${url}</div>
                    <span class="badge ${errors.length === 0 ? 'badge-success' : 'badge-error'}">
                        ${errors.length === 0 ? '✓ Passed' : `${errors.length} Error${errors.length > 1 ? 's' : ''}`}
                    </span>
                </div>
                ${errors.length === 0 
                    ? '<div class="no-errors">✨ No accessibility issues found!</div>'
                    : `<ul class="error-list">
                        ${errors.map(error => `
                            <li class="error-item">
                                <div class="error-message">${error.message || 'Accessibility issue detected'}</div>
                                ${error.context ? `<div class="error-details"><strong>Context:</strong> ${error.context}</div>` : ''}
                                ${error.selector ? `<div class="error-details"><strong>Element:</strong> <code>${error.selector}</code></div>` : ''}
                                ${error.code ? `<div class="error-code">${error.code}</div>` : ''}
                                ${error.type ? `<div class="error-details"><strong>Type:</strong> ${error.type}</div>` : ''}
                            </li>
                        `).join('')}
                    </ul>`
                }
            </div>
        `).join('')}

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
`;

// Write HTML report
const outputDir = dirname(resultsPath);
const htmlPath = join(outputDir, 'index.html');
writeFileSync(htmlPath, html, 'utf8');

console.log(`✅ Accessibility report generated: ${htmlPath}`);
