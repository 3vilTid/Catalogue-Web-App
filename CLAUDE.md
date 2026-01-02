# Claude Code Instructions for Catalogue-Web-App

## Important Workflow Rules

1. **Always create a Pull Request after editing code** - After making any code changes, always create a PR and provide the PR link to the user.

---

## index.html UI Structure Documentation

The `index.html` file has **6 UI displays** for different device/orientation combinations:

### 1. DESKTOP (Default code)
- Section: `"DESKTOP DEVICE STYLES"`
- Same for GitHub Pages and Apps Script

### 2. TABLET PORTRAIT ORIENTATION
- Section: `"TABLET PORTRAIT - Reduced sizes (75% of mobile portrait)"`
- Same for GitHub Pages and Apps Script

### 3. TABLET LANDSCAPE ORIENTATION
- Section: Combined in `"LANDSCAPE MODE"` with tablet-specific selectors
- Same for GitHub Pages and Apps Script

### 4. MOBILE PORTRAIT ORIENTATION - Apps Script
- Sections:
  - `"DEVICE-BASED MOBILE & TABLET STYLES"`
  - `"PORTRAIT MODE - Larger text, bigger buttons"`

### 5. MOBILE PORTRAIT ORIENTATION - GitHub Pages
- Section: `"GITHUB PAGES MOBILE PORTRAIT - 50% scaled down"`
- **This is the MAIN UI difference between GitHub Pages and Apps Script**

### 6. MOBILE LANDSCAPE ORIENTATION
- Section: Combined in `"LANDSCAPE MODE"` with mobile-specific selectors
- GitHub Pages has minor fixes (padding, flex-direction) in a separate area
- Essentially same UI for GitHub Pages and Apps Script

---

## Important Notes

### Combined Landscape Section
The `LANDSCAPE MODE` section is **COMBINED** for both Mobile and Tablet. They share one section with different CSS selectors:
- Mobile: `body.mobile-device.landscape`
- Tablet: `body.tablet-device.landscape`

### Detection System (Working Correctly)
The code includes detection for:
- **Device detection**: `mobile-device` / `tablet-device` / `desktop-device` classes
- **GitHub Pages detection**: `html.github-pages` class
- **Orientation detection**: `portrait` / `landscape` classes

---

## When Editing index.html

1. Identify which UI display(s) your changes affect
2. Find the correct section(s) using the section names above
3. Remember that landscape styles are combined for mobile and tablet
4. The only major GitHub Pages difference is Mobile Portrait - other modes have only minor fixes
