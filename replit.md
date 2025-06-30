# Public Records Request Generator

## Overview

The Public Records Request Generator is a client-side web application that helps users create professional public records requests with proper legal citations. The application provides templates for common request types, state-specific legal requirements, and generates both formatted letters and PDF documents.

## System Architecture

This is a pure client-side application built with vanilla JavaScript and modern web technologies. The architecture follows a simple static site pattern with no backend server requirements beyond basic file serving.

### Frontend Architecture
- **HTML5** with semantic markup for accessibility
- **Tailwind CSS** for responsive styling with custom CSS overrides
- **Alpine.js** for reactive UI components and state management
- **jsPDF** for client-side PDF generation
- **Font Awesome** for iconography

### Data Management
- JSON files for static data (states, templates)
- Local browser state management via Alpine.js
- No persistent storage or database requirements

## Key Components

### 1. Application Core (`js/app.js`)
- Main Alpine.js application controller
- Form data management and validation
- Template system for pre-filled request types
- State management for user preferences

### 2. PDF Generation (`js/pdf-generator.js`)
- Client-side PDF creation using jsPDF
- Document formatting and layout management
- Text wrapping and pagination handling
- Professional document styling

### 3. Static Data
- **States Data** (`data/states.json`): Basic state information for backward compatibility
- **Laws Data** (`data/laws.json`): Comprehensive legal citations, response times, fee structures, and appeal processes for all 50 states
- **Templates Data** (`data/templates.json`): Pre-configured request templates for common use cases

### 4. UI Styling
- Tailwind CSS for rapid UI development
- Custom CSS (`css/custom.css`) for specific form styling and print optimization
- Responsive design for mobile and desktop usage

## Data Flow

1. **Initialization**: Application loads state and template data from JSON files
2. **User Input**: Form data is captured and managed through Alpine.js reactive system
3. **Template Application**: Users can select pre-configured templates that populate form fields
4. **Letter Generation**: Form data is processed into a formatted legal request letter
5. **PDF Export**: Generated letter is converted to PDF for download/printing

## External Dependencies

### CDN-Based Libraries
- **Tailwind CSS**: UI framework for styling
- **Alpine.js**: Lightweight reactive framework
- **jsPDF**: Client-side PDF generation
- **Font Awesome**: Icon library

### Development Dependencies
- **Python HTTP Server**: Simple static file serving for development
- **Node.js Runtime**: Available but not actively used in current implementation

## Deployment Strategy

The application uses a simple static hosting approach:

### Development
- Python's built-in HTTP server (`python3 -m http.server 5000`)
- Port 5000 for local development
- Hot reload not implemented (manual refresh required)

### Production Considerations
- Can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages)
- No server-side processing required
- All assets are self-contained or CDN-delivered

### Current Limitations
- No build process or asset optimization
- CDN dependencies create external service dependencies
- No offline capability

## Recent Changes

- **June 30, 2025**: Enhanced legal citations system
  - ✓ Created comprehensive laws.json file with detailed legal information for all 50 states
  - ✓ Added prominent state selection dropdown at top of form with visual styling
  - ✓ Implemented dynamic legal information panel showing state-specific requirements
  - ✓ Enhanced legal citations with full law names, response details, fee information, and appeal processes
  - ✓ Added attorney general contact information for each state
  - ✓ Improved user experience with real-time legal guidance based on selected state

- **June 19, 2025**: Complete application development
  - ✓ Built full HTML interface with form validation
  - ✓ Implemented state-specific legal citations (all 50 states)
  - ✓ Added 8 pre-built templates for common request types
  - ✓ Created real-time letter preview with proper formatting
  - ✓ Added PDF and text export functionality
  - ✓ Implemented responsive design for mobile and desktop
  - ✓ Added accessibility features and print styles
  - ✓ Application tested and confirmed working

## Changelog

- June 19, 2025: Initial setup and complete development

## User Preferences

Preferred communication style: Simple, everyday language.
