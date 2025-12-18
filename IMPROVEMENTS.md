# Catalogue Web App - Planned Improvements

This document tracks planned features and improvements for the Catalogue Web App, organized in implementation order.

---

## First - Implement These Features

### Mobile & Desktop Experience
- [x] **Explore best ways to add phone visual**
  - Linked to user screen size detection?
  - Or detect Android / iPhone specifically?
- [x] **Add phone visual interface**
  - Optimize layout for mobile devices
- [ ] **Add installation capability for phone/desktop**
  - PWA (Progressive Web App) functionality
  - Install prompts for mobile and desktop
- [x] **Add touch gestures for mobile**
  - Swipe left/right to navigate between items
  - Pull to refresh to reload data
  - Pinch to zoom on images
  - Long press for context menus

### Hierarchical Navigation (Layers)
- [x] **Add "Layer" possibility**
  - Not direct click → detail view
  - Example: Click "Category" → Click Item → Show Detail View
  - Multi-level navigation system
- [x] **Set up image support for layers**
  - Category images
  - Layer thumbnail support
  
### Alternative Visual Layouts
- [ ] **Different catalogue list views**
  - [x] **Cards** (current default - keep as option)
  - [x] **List view** (compact rows)
  - [x] **Table view** with filter and sort options
  - [ ] **Map view** with GPS pins
- [ ] **Horizontal card scrolling**
  - Option for cards to go left/right instead of down
  - Carousel-style navigation

### Multi-Table & Column Configuration
- [ ] **Add possibility of multiple Tables**
  - Each with separate column configurations
  - Table switching/selection UI
- [ ] **Multiple column configs per table**
  - Different layouts for different data types

  ### Advanced Layout Options
- [ ] **Multiple tabs support**
  - Tab-based navigation
  - Organize content across tabs
- [ ] **Multiple catalogues per page**
  - Display several lists/catalogues simultaneously
  - Grid or split-screen layouts

### User-Specific Data
- [ ] **Hidden columns with user-specific values**
  - Stored in script properties
  - Can differ between users
  - Personal notes, ratings, etc.

### Data Visualization
- [ ] **Add graph/chart capability**
  - Visualize catalogue data
  - Charts, graphs, statistics
  - Filter-based analytics

---

## Then - Implement After First Phase

### Visual Builder
- [ ] **Add drag-and-drop interface for Creators**
  - Similar to Glide or low-code platforms
  - Visual layout editor
  - No-code configuration

### Interactive Actions
- [ ] **Add custom buttons with actions**
  - Configurable button placement
  - Custom action triggers
  - Workflow automation

---

## Notes

- Features are organized in **chronological implementation order**
  - Work through "First" section completely before "Then" section
  - Within each section, implement features in the order listed (top to bottom)
  - Each feature builds context for the next
- Check items off as they're implemented
- Some features may require architecture changes
- Consider Google Apps Script limitations for each feature

---

**Last Updated:** 2025-11-25
