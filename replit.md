# Overview

This is a PPOB (Payment Point Online Bank) platform with AI-powered transaction processing. The system allows users to purchase digital products like mobile credit (pulsa), electricity tokens, game vouchers, and e-wallet top-ups through natural language commands processed by Google's Gemini AI. It features both a customer-facing interface and an admin dashboard for transaction monitoring.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Migration Completed (Aug 2, 2025)
- ✓ Successfully migrated PPOB platform from Replit Agent to standard Replit environment
- ✓ Created PostgreSQL database and pushed schema (transactions, products, admin_stats tables)
- ✓ Configured API credentials: Digiflazz (PPOB services) and Gemini AI (natural language processing)
- ✓ Application running successfully on port 5000
- ✓ All external service integrations operational: Digiflazz API, Gemini AI, Paydisini payment gateway

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type checking and validation
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

## Database Design
- **Primary Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **Tables**:
  - `transactions`: Order records with payment status, AI commands, and external service references
  - `products`: Available digital products with pricing and categories
  - `admin_stats`: Daily aggregated statistics for admin dashboard
- **Schema Management**: Drizzle Kit for migrations and schema synchronization

## AI Integration
- **Provider**: Google Gemini AI via @google/genai
- **Purpose**: Natural language processing for order commands in Indonesian
- **Features**: 
  - Command parsing with confidence scoring
  - Product type and provider extraction
  - Target number validation
  - Error message generation in Indonesian

## External Service Integrations
- **Digital Product Provider**: Digiflazz API for product fulfillment
- **Payment Gateway**: Paydisini for payment processing and checkout URLs
- **Webhook Endpoint**: `/api/webhook/paydisini` for payment status callbacks
- **Services Handle**:
  - Product catalog synchronization
  - Transaction processing and status updates
  - Payment link generation and validation
  - Real-time payment status updates via webhooks

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development Environment**: Replit-optimized with runtime error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **CSS Framework**: PostCSS with Tailwind CSS and Autoprefixer

# External Dependencies

## Core Dependencies
- **@google/genai**: Google Gemini AI integration for natural language processing
- **@neondatabase/serverless**: PostgreSQL database connection for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web server framework for REST API

## UI Framework
- **@radix-ui**: Comprehensive set of accessible UI primitives (30+ components)
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting in development
- **@replit/vite-plugin-cartographer**: Replit environment integration

## Third-Party Services
- **Digiflazz API**: Digital product provider for pulsa, tokens, and vouchers
- **Paydisini API**: Payment gateway for transaction processing
- **Gemini AI**: Natural language command processing in Indonesian
- **Neon Database**: Managed PostgreSQL database hosting