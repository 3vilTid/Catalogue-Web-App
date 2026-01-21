# Diaporama Compact Layout Issues - Deep Analysis

## Current Problems

### 1. Desktop/Tablet Landscape: Container Resizing Works BUT Not Centered
**Status**: Container resizes to `fit-content` but stays left-aligned instead of centered

### 2. Mobile Landscape: Container NOT Resizing At All
**Status**: Container stays full-width (`width: 100%`) even in compact layout

---

## Root Cause Analysis

### Issue #1: Desktop/Tablet Landscape - Missing Centering

**Previous Implementation (Working):**
```css
/* Commit 4c74969 - Fix Diaporama centering with CSS Grid place-content */
.diaporama-horizontal {
  display: grid;
  place-content: center; /* ← This centered the grid content */
}

.diaporama-item-container {
  align-items: center;    /* ← This centered horizontally */
  justify-content: center; /* ← This centered vertically */
}
```

**Current Implementation (Broken):**
```css
.diaporama-horizontal {
  position: relative;
  /* NO centering properties */
}

.diaporama-item-container {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* ← stretch instead of center */
  /* NO justify-content: center */
}
```

**Result**: Compact items (with `width: fit-content`) are left-aligned instead of centered.

---

### Issue #2: Mobile Landscape - Container Not Resizing

**What's Supposed to Happen:**

1. Base rule (line 5025-5029):
```css
.diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content;
  margin-left: 10px;
  margin-right: 10px;
}
```

2. Mobile landscape override (line 5383-5386):
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  margin-left: 4px !important;
  margin-right: 4px !important;
  /* ← Missing: width: fit-content !important; */
}
```

**The Problem:**

The landscape two-column grid layout (line 5545-5555) applies to ALL devices including mobile:

```css
body.mobile-device.landscape .diaporama-item,
body.tablet-device.landscape .diaporama-item,
body.desktop-device .diaporama-item {
  display: grid !important;
  grid-template-columns: 1fr minmax(150px, 50%);
  /* ... */
}
```

This **grid layout** makes the item fill 100% width by default. The base compact rule's `width: fit-content` gets overridden by this more specific grid rule.

**Why Desktop/Tablet Works But Mobile Doesn't:**

- **Desktop/Tablet**: The base rule `.diaporama-horizontal .diaporama-item.diaporama-compact` (specificity: 0-2-1) successfully overrides the grid width because there's no conflicting device-specific rule with higher specificity
- **Mobile**: The mobile landscape grid rule `body.mobile-device.landscape .diaporama-item` (specificity: 0-3-1) has HIGHER specificity than the base compact rule, so the item stays full-width even when compact class is present

**CSS Specificity Breakdown:**

| Selector | Classes | Elements | Total | Width Applied |
|----------|---------|----------|-------|---------------|
| `.diaporama-horizontal .diaporama-item.diaporama-compact` | 3 | 0 | 0-3-0 | `fit-content` |
| `body.mobile-device.landscape .diaporama-item` | 2 | 1 | 0-2-1 | `100%` (from grid) |

Wait, let me recalculate:
- `.diaporama-horizontal .diaporama-item.diaporama-compact` = 3 classes, 0 elements = (0,3,0)
- `body.mobile-device.landscape .diaporama-item` = 2 classes, 2 elements = (0,2,2)

Actually (0,3,0) beats (0,2,2), so the base rule SHOULD win...

**Real Problem**: The grid layout sets `display: grid !important` which forces the grid behavior. Even with `width: fit-content`, a grid container's behavior is different from a flexbox/block container.

---

## Detailed Code Locations

### Base Desktop Styles (Line 4891-5050)

**Container (Line 4915-4924):**
```css
.diaporama-horizontal {
  position: relative;
  display: flex;      /* ← Changed from 'grid' */
  flex-direction: column;
  height: auto;
  max-height: none;
  overflow: visible;
  border-radius: 16px;
}
```
**Missing**: `place-content: center;` (or equivalent centering)

**Item Container (Line 4944-4952):**
```css
.diaporama-horizontal .diaporama-item-container {
  /* Natural flow - no centering, content expands fully */
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
}
```
**Missing**: `align-items: center;` for horizontal centering

**Compact Item (Line 5025-5029):**
```css
.diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content;    /* ← This works */
  margin-left: 10px;
  margin-right: 10px;
}
```
**Present and working** for desktop/tablet, but not centered

---

### Mobile Landscape Styles (Line 5354-5404)

**Compact Margins (Line 5383-5386):**
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```
**Missing**: `width: fit-content !important;`

**Grid Layout Override (Line 5545-5555):**
```css
body.mobile-device.landscape .diaporama-item,
body.tablet-device.landscape .diaporama-item,
body.desktop-device .diaporama-item {
  display: grid !important;
  grid-template-columns: 1fr minmax(150px, 50%);
  grid-template-rows: auto minmax(0, 1fr) auto;
  /* ... */
}
```

This forces grid behavior on ALL landscape items, including compact ones.

**Compact Override for Left Column (Line 5389-5393):**
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact .diaporama-left-column {
  grid-column: auto !important;
  width: fit-content !important;
  align-items: center !important;
}
```

This tries to make the left column fit-content, but the PARENT `.diaporama-item` is still a grid container spanning full width.

---

### Tablet Landscape Styles (Line 5473-5517)

**Compact Override (Line 5502-5506):**
```css
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact .diaporama-left-column {
  grid-column: auto !important;
  width: fit-content !important;
  align-items: center !important;
}
```

Same as mobile - only affects the left column, not the item container.

---

## Why Desktop/Tablet Works (Partially) But Mobile Doesn't

| Device | Compact Item Width | Why |
|--------|-------------------|-----|
| **Desktop** | `fit-content` ✅ | Base rule applies, but NOT centered (missing `align-items: center` on container) |
| **Tablet Landscape** | `fit-content` ✅ | Base rule applies, but NOT centered |
| **Mobile Landscape** | `100%` ❌ | Grid layout forces full width; no `width: fit-content !important` override exists |

---

## Required Fixes

### Fix #1: Restore Centering for Desktop/Tablet Landscape

**Option A: Restore Grid Centering (Original Approach)**
```css
.diaporama-horizontal {
  display: grid;
  place-content: center; /* Centers grid content */
}
```

**Option B: Use Flexbox Centering (Current Approach)**
```css
.diaporama-item-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* ← ADD THIS */
  /* or align-items: center when .diaporama-item has fit-content */
}
```

**Option C: Conditional Centering (Most Flexible)**
```css
/* Center only when compact layout is active */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}
```

---

### Fix #2: Make Mobile Landscape Compact Layout Work

**Required Addition:**
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important; /* ← ADD THIS */
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

This needs `!important` to override the grid layout's default width behavior.

**Alternative**: Don't use grid layout for compact items:
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  display: flex !important; /* Override grid */
  flex-direction: column !important;
  width: fit-content !important;
  /* ... */
}
```

---

## Same Fixes Needed for Tablet Landscape

Add explicit `width: fit-content` override:
```css
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important; /* ← ADD THIS */
}
```

---

## Summary of All Required Changes

### 1. Desktop/Tablet Centering (Apply to Base Styles)
```css
/* Option A: Add to .diaporama-item-container */
.diaporama-horizontal .diaporama-item-container {
  align-items: center; /* or conditional with :has() */
}

/* Option B: Restore grid centering to .diaporama-horizontal */
.diaporama-horizontal {
  display: grid;
  place-content: center;
}
```

### 2. Mobile Landscape Compact Width
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

### 3. Tablet Landscape Compact Width (if not working)
```css
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
  /* margins already set to 10px via base rule */
}
```

---

## Testing Strategy

1. **Desktop Landscape**:
   - Compact layout should resize ✅
   - Compact layout should be **centered** ❌ (currently left-aligned)

2. **Tablet Landscape**:
   - Same as desktop

3. **Mobile Landscape**:
   - Compact layout should resize ❌ (currently full-width)
   - Compact layout should be centered ❌

4. **All Portrait Modes**:
   - Should NOT use compact layout (always full-width)
   - Should work as-is ✅

---

## Recommended Solution

Use **conditional centering** for maximum control:

```css
/* Base: Center container only when compact layout is active */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}

/* Mobile landscape: Force compact item to fit-content */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
  margin-left: 4px !important;
  margin-right: 4px !important;
}

/* Tablet landscape: Force compact item to fit-content (if needed) */
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

This approach:
- ✅ Only centers when compact layout is active (no side effects)
- ✅ Works across all devices
- ✅ Minimal code changes
- ✅ Preserves all existing behavior for non-compact layouts
