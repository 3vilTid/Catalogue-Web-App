# Diaporama Compact Layout - Exact CSS Fixes

## Summary

Two issues to fix:
1. **Desktop/Tablet Landscape**: Container resizes ✅ but is NOT centered ❌
2. **Mobile Landscape**: Container is NOT resizing ❌ (stays full-width)

---

## Fix #1: Add Centering for Compact Layout (All Devices)

### Location: After line 4952 in index.html

**Insert this new rule:**

```css
/* Center compact items horizontally */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}
```

### Context (current code around line 4944-4952):
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

/* ← INSERT NEW RULE HERE */

/* ========== SHARED DIAPORAMA ITEM DISPLAY STYLES ========== */
```

**What this does:**
- Uses modern `:has()` selector to detect when compact class is present
- Only centers when compact layout is active
- Applies to all devices (desktop, tablet, mobile)
- No side effects on non-compact layouts

---

## Fix #2: Make Mobile Landscape Compact Layout Resize

### Location: Line 5383-5386 in index.html

**Current code:**
```css
/* Compact layout: 4px margins for mobile landscape */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

**Replace with:**
```css
/* Compact layout: 4px margins for mobile landscape */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important; /* ← ADD THIS LINE */
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

**What this does:**
- Forces compact items to shrink to fit-content width on mobile landscape
- Uses !important to override grid layout's default full-width behavior
- Matches the pattern used for margins

---

## Optional Fix #3: Add Explicit Width for Tablet Landscape (for consistency)

### Location: After line 5517 in index.html

**Current code ends at line 5517:**
```css
/* Constrain caption width in compact layout for tablet landscape */
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact .diaporama-longtext-down-wrapper {
  width: auto !important;
  max-width: 100% !important;
}

/* ← INSERT NEW RULE HERE */

/* ==================== NEW: DIAPORAMA - LANDSCAPE TWO-COLUMN LAYOUT ... */
```

**Insert this new rule:**
```css
/* Ensure compact layout resizes on tablet landscape */
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

**Why this might be needed:**
- Desktop/Tablet currently work because the base rule (line 5025) applies
- Adding explicit override ensures consistency across all landscape devices
- Prevents future CSS cascade issues

---

## Optional Fix #4: Add Explicit Width for Desktop (for consistency)

### Location: After line 5643 in index.html

**Current code ends at line 5643:**
```css
/* Constrain caption width in compact layout for desktop */
body.desktop-device .diaporama-horizontal .diaporama-item.diaporama-compact .diaporama-longtext-down-wrapper {
  width: auto !important;
  max-width: 100% !important;
}

/* ← INSERT NEW RULE HERE */

/* Right column wrapper - contains scroll-up-2 and scroll-down-1... */
```

**Insert this new rule:**
```css
/* Ensure compact layout resizes on desktop */
body.desktop-device .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

**Why this might be needed:**
- Same reason as tablet - ensures consistency and prevents future cascade issues

---

## All Changes in One Place

### Change 1: Add centering (line ~4952)
```css
/* Center compact items horizontally */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}
```

### Change 2: Fix mobile landscape width (line 5383-5386)
```css
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;  /* ← ADD THIS LINE */
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

### Change 3 (Optional): Fix tablet landscape width (line ~5517)
```css
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

### Change 4 (Optional): Fix desktop width (line ~5643)
```css
body.desktop-device .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

---

## Alternative: If `:has()` Selector Compatibility is a Concern

If you need to support older browsers (pre-2022), use this alternative for Fix #1:

### Change 1 Alternative: Always center in horizontal mode (line 4944-4952)

**Current code:**
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

**Replace with:**
```css
.diaporama-horizontal .diaporama-item-container {
  /* Natural flow - no centering, content expands fully */
  display: flex;
  flex-direction: column;
  align-items: center; /* ← ADD THIS LINE */
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
}
```

**Note**: This will center ALL items in horizontal mode, not just compact ones. This might have side effects on non-compact layouts. Test thoroughly if you choose this approach.

---

## Expected Behavior After Fixes

### Desktop Landscape
- ✅ Compact layout resizes to fit image width
- ✅ Compact layout is centered horizontally
- ✅ Non-compact layout stays full-width
- ✅ 10px margins on compact items

### Tablet Landscape
- ✅ Compact layout resizes to fit image width
- ✅ Compact layout is centered horizontally
- ✅ Non-compact layout stays full-width
- ✅ 10px margins on compact items

### Mobile Landscape
- ✅ Compact layout resizes to fit image width (FIXED)
- ✅ Compact layout is centered horizontally (FIXED)
- ✅ Non-compact layout stays full-width
- ✅ 4px margins on compact items

### All Portrait Modes
- ✅ No compact layout (items stay full-width)
- ✅ Natural flow (no centering needed)

---

## Testing After Implementation

1. **Test on Desktop**: Open Diaporama horizontal view with items that have no "Long text Up" and no "Bottom"
   - Item should resize to image width ✅
   - Item should be centered ✅

2. **Test on Tablet Landscape**: Same as desktop
   - Item should resize ✅
   - Item should be centered ✅

3. **Test on Mobile Landscape**: Same items
   - Item should resize (currently broken) → ✅
   - Item should be centered (currently broken) → ✅

4. **Test Portrait Modes**: Items with same data
   - Items should be full-width (not compact) ✅
   - No centering applied ✅

5. **Test Non-Compact Items**: Items with "Long text Up" or "Bottom" content
   - Should stay full-width ✅
   - Should NOT be centered (or centered is OK if using alternative fix) ✅

---

## Browser DevTools Verification

After implementing, verify in browser DevTools:

### On Desktop/Tablet Landscape:
```css
.diaporama-item.diaporama-compact {
  width: fit-content; /* ← Should be present */
}

.diaporama-item-container {
  align-items: center; /* ← Should be present when :has() matches */
}
```

### On Mobile Landscape:
```css
.diaporama-item.diaporama-compact {
  width: fit-content; /* ← Should be present with !important */
  margin-left: 4px;   /* ← Should be present */
  margin-right: 4px;  /* ← Should be present */
}

.diaporama-item-container {
  align-items: center; /* ← Should be present when :has() matches */
}
```

---

## Risk Assessment

### Change 1 (Centering with `:has()`)
- **Risk**: Low
- **Impact**: Only affects compact layouts
- **Compatibility**: 95%+ browser support (2022+)
- **Rollback**: Easy - just remove the added rule

### Change 2 (Mobile width fix)
- **Risk**: Very Low
- **Impact**: Only affects mobile landscape compact layouts
- **Compatibility**: 100% (standard CSS)
- **Rollback**: Easy - remove the added `width` line

### Changes 3 & 4 (Optional tablet/desktop width)
- **Risk**: Very Low
- **Impact**: Reinforces existing behavior
- **Compatibility**: 100%
- **Rollback**: Easy - remove the added rules

**Recommendation**: Implement Change 1 and Change 2 as minimum. Changes 3 & 4 are optional but recommended for future-proofing.
