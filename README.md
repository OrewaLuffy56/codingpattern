# INSECURE CODING PATTERN ANALYSER

A modern, visually branded tool for analyzing source code and files for insecure coding patterns, vulnerabilities, and code quality issues. Export professional PDF reports with your logo, watermark, and consistent dark-themed styling.

## Features
- **Advanced Code & File Scanning:** Detects insecure patterns, vulnerabilities, and risky code in multiple languages.
- **Branded PDF Export:** Generate visually appealing PDF reports with your logo, watermark, and modern layout.
- **Security & Risk Metrics:** Provides detailed metrics, security scores, and risk levels for each scan.
- **Actionable Recommendations:** Offers prioritized suggestions to improve code security and quality.
- **Consistent UI/UX:** Modern, dark-themed interface with clear, color-coded results and branding.

## How It Works
1. **Scan Code or Files:** Use the dashboard to analyze your codebase or upload files for scanning.
2. **Review Results:** View detailed metrics, vulnerabilities, and recommendations in the app.
3. **Export Reports:** Download branded PDF reports for sharing or compliance.

## Technologies Used
- React (TypeScript)
- jsPDF (PDF generation)
- Custom SVG branding and watermarking
- Static and ML-based code analysis

## Getting Started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` (or as indicated in the terminal).

## Customization
- **Branding:** Update `src/components/downloadsvg.svg` for your logo/watermark.
- **PDF Styling:** Adjust PDF export logic in `CodeAnalyzer.tsx` and `FileScanner.tsx` for custom layouts/colors.

## License
MIT

---

> Built for modern code security analysis and reporting.
---Created by Yashwanth Chandra Aradhya & Chinmay V