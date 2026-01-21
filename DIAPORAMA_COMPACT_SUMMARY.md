# Diaporama Compact Layout Issues - Investigation Summary

## Current Behavior (as reported)

### ✅ Desktop/Tablet Landscape
- **Container resizing**: WORKS (item shrinks to fit-content)
- **Centering**: BROKEN (item is left-aligned instead of centered)

### ❌ Mobile Landscape
- **Container resizing**: BROKEN (item stays full-width)
- **Centering**: N/A (can't test until resizing works)

---

## Root Causes Identified

### 1. Desktop/Tablet Landscape - Missing Centering

**Historical Context:**
- Commit `4c74969` had: `.diaporama-horizontal { display: grid; place-content: center; }`
- Commit `30c5881` had: `.diaporama-item-container { align-items: center; justify-content: center; }`
- These were removed in later refactoring to natural document flow

**Current State (Line 4944-4952):**
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

**Missing**: `align-items: center;` to horizontally center the fit-content item

---

### 2. Mobile Landscape - Container Not Resizing

**CSS Rule Application Order:**

1. **Line 5545-5555**: Apply grid layout to ALL landscape diaporama items
   ```css
   body.mobile-device.landscape .diaporama-item {
     display: grid !important;
     grid-template-columns: 1fr minmax(150px, 50%);
     /* NO width property set */
   }
   ```

2. **Line 5558-5562**: When no right column, switch to single-column grid
   ```css
   body.mobile-device.landscape .diaporama-item:not(:has(...)):not(:has(...)) {
     grid-template-columns: 1fr;  /* Single column, but still full-width */
   }
   ```

3. **Line 5025-5029**: BASE compact rule (should apply to all devices)
   ```css
   .diaporama-horizontal .diaporama-item.diaporama-compact {
     width: fit-content;  /* ← Should apply to mobile */
     margin-left: 10px;
     margin-right: 10px;
   }
   ```
   - Specificity: (0, 3, 0) - 3 classes
   - Should WIN over mobile grid rule (0, 2, 2)

4. **Line 5383-5386**: Mobile-specific compact margins
   ```css
   body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
     margin-left: 4px !important;
     margin-right: 4px !important;
     /* NO width property - base rule's width should still apply */
   }
   ```

**Theory**: The base compact rule's `width: fit-content` SHOULD apply to mobile due to higher specificity (3 classes vs 2 classes + 1 element).

**Possible Issues:**
1. **CSS Specificity**: Despite the base rule having higher specificity, something might be preventing it from applying
2. **Grid Behavior**: Even with `width: fit-content`, the grid's `1fr` column might be expanding to fill available space
3. **JavaScript Issue**: The compact class might not be applied on mobile devices
4. **Parent Container**: The `.diaporama-item-container` or `.diaporama-horizontal` might be forcing full width

---

## Investigation Needed

### Test 1: Verify Compact Class is Applied on Mobile
Check in browser DevTools on mobile landscape:
```javascript
document.querySelector('.diaporama-item').classList.contains('diaporama-compact')
```
Expected: `true` for items with no Long text Up and no Bottom

### Test 2: Verify width: fit-content is Applied
Check computed styles in DevTools:
```javascript
getComputedStyle(document.querySelector('.diaporama-item.diaporama-compact')).width
```
Expected: Should be the width of the image, not 100% of viewport

### Test 3: Check Parent Container Width
```javascript
getComputedStyle(document.querySelector('.diaporama-horizontal')).width
```
Expected: Should match viewport width (this is correct)

---

## Proposed Solutions

### Solution 1: Fix Centering (Desktop/Tablet/Mobile - Once resizing works)

**Option A: Conditional Flexbox Centering (Recommended)**
```css
/* Add after line 4952 */
/* Center item-container only when compact layout is active */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}
```

**Pros**:
- Only centers when needed (no side effects)
- Works across all devices
- Minimal code change
- Uses modern CSS `:has()` selector

**Cons**:
- `:has()` selector not supported in very old browsers (but supported in all modern browsers since 2022)

---

**Option B: Always Center in Horizontal Mode**
```css
/* Modify line 4944-4952 */
.diaporama-horizontal .diaporama-item-container {
  display: flex;
  flex-direction: column;
  align-items: center;  /* ← ADD THIS */
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
}
```

**Pros**:
- Simple change
- No browser compatibility concerns

**Cons**:
- Centers all items, even non-compact ones (might not be desired)
- Could have unintended side effects on full-width layouts

---

### Solution 2: Fix Mobile Landscape Container Resizing

**Option A: Add Explicit width: fit-content to Mobile Rule (Recommended)**
```css
/* Modify line 5383-5386 */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;  /* ← ADD THIS */
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

**Pros**:
- Explicit and clear
- Uses !important to guarantee override
- Matches the existing pattern (margins use !important)

**Cons**:
- Duplicates the base rule's width property
- Requires maintenance in two places

---

**Option B: Increase Base Rule Specificity**
```css
/* Modify line 5025-5029 to be more specific */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact,
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact,
body.desktop-device .diaporama-horizontal .diaporama-item.diaporama-compact,
.diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content;
  margin-left: 10px;
  margin-right: 10px;
}
```

**Pros**:
- Single source of truth for width
- Explicit device targeting

**Cons**:
- Verbose selector
- Doesn't explain WHY this is needed

---

**Option C: Use !important in Base Rule**
```css
/* Modify line 5025-5029 */
.diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;  /* ← ADD !important */
  margin-left: 10px;
  margin-right: 10px;
}
```

**Pros**:
- Simple change
- Guarantees override across all devices

**Cons**:
- Uses !important which is generally discouraged
- Might make it harder to override in the future

---

## Recommended Implementation

### Step 1: Fix Mobile Landscape Resizing
```css
/* Line 5383-5386: Add width property */
body.mobile-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;  /* ← ADD THIS LINE */
  margin-left: 4px !important;
  margin-right: 4px !important;
}
```

### Step 2: Fix Centering (All Devices)
```css
/* Add after line 4952 */
/* Center compact items horizontally */
.diaporama-horizontal:has(.diaporama-item.diaporama-compact) .diaporama-item-container {
  align-items: center;
}
```

### Step 3: Optional - Add Tablet Landscape Explicit Width (for consistency)
```css
/* Add after line 5517 */
body.tablet-device.landscape .diaporama-horizontal .diaporama-item.diaporama-compact {
  width: fit-content !important;
}
```

---

## Testing Checklist

After implementing fixes:

### Desktop
- [ ] Compact layout resizes to fit image ✅ (already works)
- [ ] Compact layout is centered horizontally ❌ → ✅ (fix needed)
- [ ] Non-compact layout stays full-width
- [ ] Non-compact layout is NOT centered (stays left-aligned or full-width)

### Tablet Landscape
- [ ] Compact layout resizes to fit image ✅ (already works)
- [ ] Compact layout is centered horizontally ❌ → ✅ (fix needed)
- [ ] Non-compact layout stays full-width
- [ ] 10px margins are applied to compact items

### Tablet Portrait
- [ ] All items are full-width (no compact layout)
- [ ] Layout is NOT centered (natural flow)

### Mobile Landscape
- [ ] Compact layout resizes to fit image ❌ → ✅ (fix needed)
- [ ] Compact layout is centered horizontally ❌ → ✅ (fix needed)
- [ ] 4px margins are applied to compact items
- [ ] Non-compact layout stays full-width

### Mobile Portrait (Apps Script)
- [ ] All items are full-width (no compact layout)
- [ ] Layout is NOT centered (natural flow)

### Mobile Portrait (GitHub Pages)
- [ ] All items are full-width (no compact layout)
- [ ] Layout is NOT centered (natural flow)

---

## Code Locations Reference

| Issue | File | Line Range | Current State | Fix Needed |
|-------|------|------------|---------------|------------|
| Missing centering container | index.html | 4944-4952 | No centering | Add `align-items: center` conditionally |
| Base compact layout | index.html | 5025-5029 | Works for desktop/tablet | No change needed (or add !important) |
| Mobile landscape compact | index.html | 5383-5386 | Only margins, no width | Add `width: fit-content !important` |
| Tablet landscape compact | index.html | 5502-5517 | Only left-column overrides | Add `width: fit-content !important` (optional) |
| Desktop compact | index.html | 5627-5643 | Left-column overrides only | Add `width: fit-content !important` (optional) |

---

## Browser Compatibility

### `:has()` Selector (for conditional centering)
- ✅ Chrome 105+ (Aug 2022)
- ✅ Edge 105+ (Sep 2022)
- ✅ Safari 15.4+ (Mar 2022)
- ✅ Firefox 121+ (Dec 2023)

**Conclusion**: Safe to use in 2025-2026. Covers 95%+ of users.

**Fallback**: If `:has()` support is a concern, use Option B (always center) instead.
