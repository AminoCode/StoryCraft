# Writing Assistant Application

## Overview

This is a full-stack writing assistance application built to help authors accelerate their writing process and maintain consistency. The application combines intelligent AI-powered features with a rich text editor and contextual sidebar for managing story elements like characters, locations, and timeline events.

## User Preferences

Preferred communication style: Simple, everyday language.
Force light mode only - dark mode disabled due to readability issues.

## Recent Changes (August 15, 2025)

### Codebase Optimization and Technical Debt Resolution
- Fixed all TypeScript errors in storage.ts including null safety improvements for database operations
- Resolved infinite re-render issues in RelationshipGraph component with optimized useEffect dependencies  
- Enhanced error handling with proper null checks and type safety improvements throughout
- Added missing DialogDescription components to all dialog modals for accessibility compliance
- Consolidated duplicate mutation patterns into reusable helper functions
- Removed unused imports and optimized component performance across the application
- Implemented systematic code quality improvements with consolidated API request patterns

### Scrolling System Overhaul
- Completely rebuilt scrolling architecture using inline styles and CSS !important overrides
- Fixed rich text editor scrolling with proper overflow-y: auto containers
- Resolved contextual sidebar scrolling issues in both sidebar and bottom panel layouts
- Applied nuclear approach to override all Tailwind CSS constraints preventing scrolling

### UI/Layout Improvements  
- Fixed bottom panel layout visibility and proper flex direction switching
- Rebuilt horizontal timeline with proper horizontal scrolling and constrained height (140px)
- Resolved dialog transparency issues with solid white backgrounds
- Fixed missing Lucide React icons (Users, MapPin, Clock) in story elements
- Eliminated 404 error flash by improving document loading logic conditions

### Technical Architecture
- Enhanced contextual sidebar to properly adapt between sidebar/bottom layouts
- Improved timeline component with flex-shrink: 0 and consistent card sizing
- Applied global CSS overrides to ensure scrolling works throughout the application
- Optimized query conditions to prevent unnecessary API calls on page load

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and API routes
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle config)
- **Development**: Hot reload with Vite dev server integration

### Project Structure
- `client/` - Frontend React application
- `server/` - Backend Express.js server
- `shared/` - Shared TypeScript types and database schema
- `components/` - Reusable UI components using shadcn/ui

## Key Components

### Core Writing Features
1. **Rich Text Editor** - Main writing interface with real-time content editing
2. **AI Writing Assistant** - OpenAI GPT-4o integration for:
   - Synonym suggestions
   - Grammar and style corrections
   - Entity extraction (characters, locations, events)
   - Writing prompts and suggestions
3. **Floating Toolbar** - Quick access to formatting tools and AI features
4. **Contextual Sidebar** - Tabbed interface for managing story elements

### Database Schema
The application uses five main tables:
- `documents` - Store writing documents with content and metadata
- `characters` - Character profiles with traits, relationships, and appearance
- `locations` - Location details with descriptions and key features
- `timeline_events` - Story events organized by chapters and order
- `ai_suggestions` - AI-generated suggestions for text improvements

### UI Components
- **Modular Design**: Uses shadcn/ui component library for consistent styling
- **Responsive Layout**: Mobile-first design with adaptive interfaces
- **Dark/Light Mode**: CSS custom properties support theme switching
- **Accessibility**: Built on Radix UI primitives for keyboard navigation and screen readers

## Data Flow

1. **Document Management**: Documents are created/updated through REST API endpoints
2. **Real-time Analysis**: Text changes trigger debounced AI analysis for suggestions
3. **Entity Tracking**: AI automatically extracts and tracks story elements
4. **Contextual Information**: Sidebar displays relevant characters, locations, and events
5. **Export System**: Documents can be exported in multiple formats

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4o for intelligent writing assistance
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management and caching

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling
- **Drizzle Kit**: Database migration and schema management
- **Vite**: Development server and build tool

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle migrations create PostgreSQL schema

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Development/production environment flag

### Production Deployment
- Backend serves as Express.js application
- Frontend assets served statically by Express
- Database connections handled via Neon serverless PostgreSQL
- Environment variables managed through hosting platform

The application is designed as a monorepo with shared TypeScript types, making it easy to maintain consistency between frontend and backend while enabling rapid development of writing assistance features.