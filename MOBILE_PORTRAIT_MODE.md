# Mobile Portrait Mode - Development Guide

## 🚨 CRITICAL: How to Add Portrait-Only Styles

### The Correct Structure

All portrait-only styles MUST be placed inside the `@media (orientation: portrait)` block with **10-space indentation**.

**Location in index.html:** Starting at line ~1690

```css
@media (max-width: 1024px) {              /* Line ~1457, 6 spaces */
  /* Mobile base styles (both landscape and portrait) */

  @media (orientation: landscape) {        /* Line ~1556, 8 spaces */
    /* Landscape mobile only */
  }                                        /* Closes at 8 spaces */

  @media (orientation: portrait) {         /* Line ~1690, 8 spaces */
    /* Portrait mobile only - ADD YOUR STYLES HERE */

    .your-selector {                       /* 10 SPACES - inside portrait block */
      property: value !important;          /* 12 spaces */
    }

  }                                        /* Line ~1906, 8 spaces - closes portrait */
}                                          /* Closes mobile 1024px block */
```

### ⚠️ Common Mistake - What Went Wrong

**WRONG INDENTATION** (8 spaces) - Places styles OUTSIDE portrait block:
```css
@media (orientation: portrait) {         /* 8 spaces */
  ...
}                                        /* 8 spaces - closes portrait */

.dropdown-menu {                         /* 8 spaces - WRONG! Outside portrait block! */
  font-size: 36px !important;            /* This affects ALL devices under 1024px */
}
```

**CORRECT INDENTATION** (10 spaces) - Inside portrait block:
```css
@media (orientation: portrait) {         /* 8 spaces */

  .dropdown-menu {                       /* 10 spaces - CORRECT! Inside portrait block */
    font-size: 36px !important;          /* Only affects portrait mode */
  }

}                                        /* 8 spaces - closes portrait */
```

### 🔍 How to Verify Your Styles Are Portrait-Only

1. Count the spaces before your style rule - should be **10 spaces**
2. Check it's BEFORE the portrait closing brace `}` at line ~1906
3. Test on desktop - styles should NOT apply
4. Test on landscape mobile - styles should NOT apply
5. Test on portrait mobile - styles SHOULD apply

---

## 📱 Current Portrait Mode Settings (Mobile Portrait ONLY)

### Buttons
```css
/* All buttons (general) */
button, .btn, .btn-primary, .btn-secondary, .btn-danger, .back-btn, .sort-btn, .filter-pill {
  min-height: 80px !important;
  font-size: 64px !important;
  padding: 12px 24px !important;
}

/* Filter and Sort buttons specifically */
.btn-toolbar {
  font-size: 88px !important;  /* Even bigger for visibility */
}

/* Exception: Image Zoom Close Button */
#imgOverlayClose {
  font-size: 32px !important;
  padding: 8px 14px !important;
  min-width: 48px !important;
  min-height: 48px !important;
}
```

### Form Inputs
```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="url"],
textarea {
  font-size: 22px !important;
  min-height: 80px !important;
}
```

### Dropdown Selects
```css
select {
  font-size: 88px !important;
  min-height: 80px !important;
}
```

### Dropdown Menu Content
```css
/* Dropdown container */
.dropdown-menu {
  padding: 16px !important;
  max-height: 600px !important;
  min-width: 500px !important;
  width: auto !important;
}

/* Section titles (e.g., "PHYLUM", "SORT BY", "ORDER") */
.dropdown-section-title {
  font-size: 28px !important;
  padding: 12px 16px !important;
}

/* Dropdown items (the selectable options) */
.dropdown-item {
  font-size: 36px !important;
  padding: 16px 20px !important;
  gap: 16px !important;
}

/* Checkboxes and radio buttons */
.dropdown-item input[type="checkbox"],
.dropdown-item input[type="radio"] {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  min-height: 36px !important;
}

/* Checked indicator inside checkboxes */
.dropdown-item input[type="checkbox"]:checked::after {
  top: 6px !important;
  left: 6px !important;
  width: 20px !important;
  height: 20px !important;
}

/* Text inside dropdown items */
.dropdown-item span {
  font-size: 36px !important;
}

/* Clear Filters button */
.dropdown-btn {
  font-size: 20px !important;
  padding: 8px 16px !important;
}
```

### Card Text
```css
.item-card {
  min-height: 180px;
  padding: 12px !important;
}

.item-name {
  font-size: 17px !important;
  line-height: 1.4;
  font-weight: 600 !important;
}

.item-subtitle {
  font-size: 16px !important;
  margin-top: 6px !important;
}
```

### Detail View Text
```css
.detail-name {
  font-size: 30px !important;
}

.detail-subtitle {
  font-size: 25px !important;
}

.detail-topcorner {
  font-size: 25px !important;
}

.detail-meta {
  font-size: 25px !important;
}

.detail-field,
.detail-field-label,
.detail-field-value {
  font-size: 22px !important;
}

.link-pill {
  font-size: 24px !important;
  padding: 10px 18px !important;
}
```

---

## 📝 Change History (This Session)

### Session: claude/check-session-progress-011iUrTujd2Ds1gQH3Abmd5Q

1. **Added `.btn-toolbar` to portrait button selector**
   - Commit: 201a018
   - Fixed Filter and Sort buttons not enlarging

2. **Enlarged dropdown menu content**
   - Commit: 64fb615
   - Section titles: 28px
   - Dropdown items: 36px
   - Checkboxes: 36px size
   - All text: 36px

3. **Fixed dropdown width**
   - Commit: 4033e81
   - Min-width: 500px
   - Width: auto (prevents text cutoff)

4. **CRITICAL FIX: Fixed indentation bug**
   - Commit: ba74c5a
   - All portrait styles were at 8-space indentation (OUTSIDE portrait block)
   - Moved to 10-space indentation (INSIDE portrait block)
   - This was causing styles to affect desktop and landscape mode

5. **Increased button text and reduced Clear Filters**
   - Commit: 7e0c133
   - Filter/Sort buttons: 88px font
   - Clear Filters: 20px font

6. **Added logo support from Settings C6**
   - Commit: a6652c7
   - Logo displayed in header before app name
   - Supports both regular URLs and Google Drive URLs
   - Auto-hides if no logo URL is set
   - Sized at 48px height for optimal display

---

## 🎯 Quick Reference

### Where to Make Changes

**File:** `index.html`

**Portrait Mode Block:** Lines ~1690 to ~1906

**Media Query Hierarchy:**
- Desktop: No media query (base styles)
- Mobile (all): `@media (max-width: 1024px)` - Line ~1457
  - Landscape: `@media (orientation: landscape)` - Line ~1556
  - Portrait: `@media (orientation: portrait)` - Line ~1690 ← **ADD PORTRAIT-ONLY STYLES HERE**

### How to Test

1. **Desktop:** Open in browser on desktop - portrait styles should NOT apply
2. **Landscape Mobile:** Rotate phone to landscape - portrait styles should NOT apply
3. **Portrait Mobile:** Phone in portrait mode - portrait styles SHOULD apply
4. **Clear Cache:** Always hard refresh (Ctrl+F5 or Cmd+Shift+R) after deployment

### Deployment Reminder

After making changes:
1. Save `index.html`
2. Deploy the Google Apps Script
3. Hard refresh the web app
4. Test in portrait mode on actual device

---

## 🐛 Troubleshooting

### "My portrait styles are affecting desktop/landscape!"
- Check indentation: Should be **10 spaces**, not 8
- Verify placement: Must be INSIDE the portrait `@media` block (before line ~1906)
- Use `!important` flags to override base styles

### "My changes aren't showing up"
- Clear browser cache (hard refresh)
- Redeploy the Google Apps Script
- Check for typos in selectors
- Verify the closing braces are correct

### "I can't find the portrait mode block"
- Search for: `@media (orientation: portrait)`
- Should be around line 1690 in index.html
- Comment says: `/* PORTRAIT MODE ONLY - Wrap in orientation query */`

---

**Last Updated:** 2025-12-01
**Branch:** claude/check-session-progress-011iUrTujd2Ds1gQH3Abmd5Q
