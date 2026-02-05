# Litera Software - Complete Feature Analysis
**Research Phase - Documenting all features for rebuild**

## What is Litera?
Litera is document lifecycle management software for legal professionals. The core product is **Litera Compare** (formerly Workshare Compare) - a document comparison/redlining tool.

---

## Core Features to Implement

### 1. DOCUMENT COMPARISON (REDLINING)
**What it does:** Compare two versions of a document and highlight differences

**Specific Features:**
- **Text Comparison:** Line-by-line diff of document content
- **Word-level highlighting:** Show exactly which words changed
- **Formatting Detection:** Track changes in formatting (bold, italic, font, size)
- **Table Comparison:** Compare table structures and content
- **Image/Graphic Detection:** Note when images are added/removed/modified
- **Headers/Footers:** Compare across all sections

**How it looks:**
- Left side: Original document (pale/gray text)
- Right side: Revised document (color-coded changes)
- OR Unified view: Single column with redlining
- Changed text: Red strikethrough for deletions, blue underline for additions
- Margin markers: Red line in margin for changed sections

### 2. NAVIGATION & REVIEW
**Features:**
- **Change Navigator:** Sidebar list of all changes
- **Jump to Next/Previous:** Arrow buttons to navigate changes
- **Change Counter:** Shows "Change 5 of 47"
- **Line Numbers:** Display line numbers alongside changes
- **Scroll Sync:** Both panes scroll together in split view

### 3. CHANGE TYPES DISPLAYED
**Visual Indicators:**
- ➕ **Insertions:** Blue underline, blue text, blue margin bar
- ➖ **Deletions:** Red strikethrough, red text, red margin bar  
- ✏️ **Modifications:** Combination - red strikethrough + blue underline
- 🔄 **Moved Text:** Green highlighting (when text moved location)
- 📝 **Formatting Changes:** Yellow/gold highlighting
- 📊 **Table Changes:** Special table cell highlighting

### 4. FILTERING & SEARCH
**Features:**
- Filter by: All changes, Insertions only, Deletions only, Formatting only
- Search within changes
- Filter by reviewer/author (if tracked changes)
- Hide/show specific change types

### 5. ACCEPT/REJECT WORKFLOW
**Features:**
- ✅ Accept individual change
- ✅ Accept all changes
- ❌ Reject individual change
- ❌ Reject all changes
- 🔁 Accept change and move to next
- 💬 Add comment to change
- 🏷️ Mark change as reviewed

### 6. DOCUMENT IMPORT/EXPORT
**Supported Formats:**
- DOCX (Word) - PRIMARY
- PDF
- RTF
- TXT
- Word Perfect (legacy)

**Export Options:**
- Export redlined version as PDF
- Export clean version (with changes applied)
- Export summary report of changes
- Export change list as spreadsheet

### 7. UI LAYOUT (MODERN VERSION)
**Screen Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  LOGO     [Upload] [Compare] [Export]     [Help] [Settings] │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────────────────────┐│
│  │ CHANGES LIST │  │ DOCUMENT VIEW (Split or Unified)     ││
│  │              │  │                                      ││
│  │ • Change 1   │  │ ┌────────────────┬────────────────┐ ││
│  │ • Change 2   │  │ │   ORIGINAL     │    REVISED     │ ││
│  │ • Change 3   │  │ │                │                │ ││
│  │              │  │ │  [red text]    │ [blue text]    │ ││
│  │ Stats: 15    │  │ │                │                │ ││
│  └──────────────┘  └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Toolbar Elements:**
- Zoom in/out buttons (+/-)
- View toggle: Split View | Unified View
- Change navigation: ← Previous | Next →
- Filter buttons: All | Additions | Deletions | Formatting
- Search box
- Export dropdown

### 8. ADVANCED FEATURES
- **Batch Compare:** Compare multiple document pairs at once
- **Folder Watch:** Auto-compare when new versions saved
- **Integration:** Works with iManage, NetDocuments, SharePoint
- **Collaboration:** Multiple reviewers, comment threads
- **Version History:** Compare across multiple versions (v1→v2→v3)
- **Summary Report:** Generate executive summary of changes
- **Ignore Options:** Ignore whitespace, case, formatting

### 9. MODERN UI DESIGN ELEMENTS
**Colors:**
- Background: Clean white/off-white
- Deletions: #DC2626 (red-600)
- Insertions: #2563EB (blue-600)
- Highlights: Soft pastels
- Sidebar: Light gray #F8FAFC
- Borders: Light gray #E2E8F0

**Typography:**
- Sans-serif font (Inter, system-ui)
- Changes: Monospace for alignment
- Size: 14-16px base, scalable

**Spacing:**
- Generous padding (16-24px)
- Clear visual hierarchy
- Card-based UI elements
- Shadow for elevation

---

## IMPLEMENTATION PRIORITY

### MUST HAVE (MVP):
1. Document upload (TXT format first)
2. Text comparison engine (diff algorithm)
3. Unified view with redlining (red/blue)
4. Changes sidebar list
5. Filter by type (all/add/remove)
6. Export results

### SHOULD HAVE:
1. Split view mode
2. Navigation between changes
3. Accept/reject buttons
4. Zoom controls
5. Word-level diff highlighting
6. Modern CSS styling

### NICE TO HAVE:
1. DOCX parsing
2. PDF support
3. Real-time collaboration
4. Comments on changes
5. Batch processing
6. Firebase backend for storage

---

## RESEARCH NOTES
- Litera acquired Workshare (original comparison tech)
- Main competitor: DeltaView (also legal comparison)
- Target users: Lawyers, legal assistants, contract managers
- Use case: Reviewing contract revisions, checking edits from opposing counsel
