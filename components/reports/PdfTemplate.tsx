// components/reports/PdfTemplate.tsx
import { RepoReport } from '@/types/reports';

interface PdfTemplateProps {
  report: RepoReport;
  projectId: string;
  generatedAt: string;
  logoUrl?: string;
}

export function generatePdfHtml({ report, projectId, generatedAt, logoUrl }: PdfTemplateProps): string {
  // Funções auxiliares (mantidas iguais)
  const renderLanguageBars = () => {
    const languages = Object.entries(report.languages)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([lang, percentage]) => `
        <div key="${lang}" class="language-bar">
          <span class="language-name">${lang}</span>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="language-percent">${percentage.toFixed(1)}%</span>
        </div>
      `).join('');
    return languages;
  };

  const renderInsights = () => {
    return report.health.insights.map(insight => `
      <li>${insight}</li>
    `).join('');
  };

  const renderHealthFactors = () => {
    return Object.entries(report.health.factors).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      return `
        <div key="${key}" class="factor-item">
          <div class="factor-value">${Math.round(value * 100)}%</div>
          <div class="factor-label">${label}</div>
        </div>
      `;
    }).join('');
  };

  const avgCommitsPerContributor = report.contributors > 0
    ? Math.round(report.commits.commits90d / report.contributors)
    : 0;
  const totalIssues = report.openIssues + report.closedIssues;
  const issueClosureRate = totalIssues > 0
    ? Math.round((report.closedIssues / totalIssues) * 100)
    : 0;

  const last10Commits = report.commits.daily.slice(-10).reverse();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GitGraph Report - ${projectId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      line-height: 1.3;
      font-size: 8.5px; /* ligeiramente menor */
      padding: 24px;
    }
    .mt-32{
      margin-top: 32px;
    }
    .report {
      max-width: 100%;
      margin: 0;
      background: #0a0a0a;
      padding: 8px; /* padding interno para não colar nas bordas */
    }

    /* Cabeçalho */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #57e071;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-img {
      height: 20px;
      width: auto;
      object-fit: contain;
      background: transparent;
    }
    .logo-placeholder {
      width: 30px;
      height: 30px;
      background: #57e071;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
      font-weight: bold;
      font-size: 16px;
    }
    .title h1 {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin-bottom: 2px;
    }
    .title p {
      font-size: 8px;
      color: #a0a0a0;
    }
    .meta {
      text-align: right;
    }
    .meta .project-id {
      font-family: monospace;
      color: #57e071;
      font-size: 10px;
      font-weight: 600;
    }
    .meta .date {
      color: #a0a0a0;
      font-size: 7px;
      margin-top: 3px;
    }

    /* Seções */
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #57e071;
      margin-bottom: 6px;
      padding-bottom: 2px;
      border-bottom: 1px solid #333;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }
    .card {
      background: #111;
      border: 1px solid #222;
      border-radius: 5px;
      padding: 8px;
    }
    .metric-card .label {
      font-size: 7px;
      text-transform: uppercase;
      color: #888;
      letter-spacing: 0.2px;
      margin-bottom: 3px;
    }
    .metric-card .value {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    .metric-card .icon {
      color: #57e071;
      font-size: 12px;
      margin-bottom: 4px;
    }

    /* Health Score */
    .health-score-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .score-ring {
      width: 60px;
      height: 60px;
      position: relative;
    }
    .score-ring svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .score-ring circle {
      fill: none;
      stroke-width: 7;
    }
    .score-ring .bg {
      stroke: #222;
    }
    .score-ring .progress {
      stroke: #57e071;
      stroke-linecap: round;
    }
    .score-number {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    .health-details {
      flex: 1;
    }
    .grade-badge {
      display: inline-block;
      background: #57e071;
      color: black;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 10px;
      font-size: 10px;
      margin-bottom: 3px;
    }
    .insights-list {
      list-style: none;
      margin-top: 4px;
    }
    .insights-list li {
      font-size: 7px;
      color: #ccc;
      margin-bottom: 2px;
      padding-left: 8px;
      position: relative;
    }
    .insights-list li::before {
      content: "•";
      color: #57e071;
      position: absolute;
      left: 0;
    }

    /* Fatores */
    .factor-item {
      text-align: center;
      padding: 4px 1px;
      background: #1a1a1a;
      border-radius: 4px;
    }
    .factor-value {
      font-size: 12px;
      font-weight: 700;
      color: #57e071;
      margin-bottom: 2px;
    }
    .factor-label {
      font-size: 6px;
      text-transform: uppercase;
      color: #888;
    }

    /* Tabela de commits */
    .table-responsive {
      max-height: 140px;
      overflow-y: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7px;
    }
    th {
      background: #1a1a1a;
      color: #57e071;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 3px;
      text-align: left;
      border-bottom: 1px solid #333;
    }
    td {
      padding: 3px;
      border-bottom: 1px solid #222;
      color: #ccc;
    }
    tr:last-child td {
      border-bottom: none;
    }

    /* Linguagens */
    .languages-container {
      max-height: 140px;
      overflow-y: auto;
    }
    .language-bar {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 4px;
    }
    .language-name {
      width: 55px;
      font-size: 7px;
      font-weight: 500;
      color: #ddd;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-container {
      flex: 1;
      height: 4px;
      background: #222;
      border-radius: 2px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: #57e071;
      border-radius: 2px;
    }
    .language-percent {
      width: 32px;
      font-size: 7px;
      color: #57e071;
      font-weight: 600;
      text-align: right;
    }

    /* Rodapé */
    .footer {
      margin-top: 12px;
      padding-top: 6px;
      border-top: 1px solid #222;
      text-align: center;
      font-size: 6px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="report">
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        ${logoUrl 
          ? `<img src="${logoUrl}" alt="GitGraph Logo" class="logo-img" />`
          : `<div class="logo-placeholder">G</div>`
        }
        <div class="title">
          <h1>GitGraph Repository Report</h1>
          <p>Detailed analytics and health overview</p>
        </div>
      </div>
      <div class="meta">
        <div class="project-id">${projectId}</div>
        <div class="date">Generated: ${generatedAt}</div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="section mt-32">
      <h2 class="section-title">Key Metrics</h2>
      <div class="grid-4">
        <div class="card metric-card">
          <div class="icon">⭐</div>
          <div class="label">Stars</div>
          <div class="value">${report.stars.toLocaleString()}</div>
        </div>
        <div class="card metric-card">
          <div class="icon">🔀</div>
          <div class="label">Forks</div>
          <div class="value">${report.forks.toLocaleString()}</div>
        </div>
        <div class="card metric-card">
          <div class="icon">⚠️</div>
          <div class="label">Open Issues</div>
          <div class="value">${report.openIssues.toLocaleString()}</div>
        </div>
        <div class="card metric-card">
          <div class="icon">👥</div>
          <div class="label">Contributors</div>
          <div class="value">${report.contributors.toLocaleString()}</div>
        </div>
      </div>
    </div>

    <!-- Health Overview -->
    <div class="section">
      <h2 class="section-title">Health Overview</h2>
      <div class="grid-2">
        <!-- Health Score -->
        <div class="card health-score-container">
          <div class="score-ring">
            <svg viewBox="0 0 100 100">
              <circle class="bg" cx="50" cy="50" r="42" />
              <circle 
                class="progress" 
                cx="50" 
                cy="50" 
                r="42" 
                stroke-dasharray="263.89"
                stroke-dashoffset="${263.89 - (263.89 * report.health.score / 100)}"
              />
            </svg>
            <div class="score-number">${report.health.score}</div>
          </div>
          <div class="health-details">
            <span class="grade-badge">Grade ${report.health.grade}</span>
            <div style="font-size: 8px; color: #aaa;">Overall health score</div>
          </div>
        </div>

        <!-- Key Insights -->
        <div class="card">
          <h3 style="font-size: 10px; margin-bottom: 4px; color: #57e071;">Key Insights</h3>
          <ul class="insights-list">
            ${renderInsights()}
          </ul>
        </div>
      </div>
    </div>

    <!-- Health Factors -->
    <div class="section">
      <h2 class="section-title">Health Factors</h2>
      <div class="grid-5">
        ${renderHealthFactors()}
      </div>
    </div>

    <!-- Commit Activity Summary -->
    <div class="section">
      <h2 class="section-title">Commit Activity Summary</h2>
      <div class="grid-2" style="margin-bottom: 8px;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600;">Last 7 days</span>
            <span style="color: #57e071; font-weight: 700;">${report.commits.commits7d}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600;">Last 30 days</span>
            <span style="color: #57e071; font-weight: 700;">${report.commits.commits30d}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Last 90 days</span>
            <span style="color: #57e071; font-weight: 700;">${report.commits.commits90d}</span>
          </div>
        </div>
        <div class="card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600;">Avg commits/contributor</span>
            <span style="color: #57e071; font-weight: 700;">${avgCommitsPerContributor}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600;">Issue closure rate</span>
            <span style="color: #57e071; font-weight: 700;">${issueClosureRate}%</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Open PRs</span>
            <span style="color: #57e071; font-weight: 700;">${report.openPRs}</span>
          </div>
        </div>
      </div>

      <!-- Daily Commits + Languages (side by side) -->
      <div class="grid-2">
        <!-- Daily Commits Table -->
        <div class="card" style="padding: 6px;">
          <h3 style="font-size: 9px; margin-bottom: 4px; color: #57e071;">Daily Commits (last 10)</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commits</th>
                </tr>
              </thead>
              <tbody>
                ${last10Commits.map(day => `
                  <tr>
                    <td>${day.date}</td>
                    <td>${day.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Language Distribution -->
        <div class="card" style="padding: 6px;">
          <h3 style="font-size: 9px; margin-bottom: 4px; color: #57e071;">Language Distribution</h3>
          <div class="languages-container">
            ${renderLanguageBars()}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      Generated by GitGraph · Confidential
    </div>
  </div>
</body>
</html>`;
}