# Overview

This is a PPOB (Payment Point Online Bank) platform with AI-powered transaction processing. The system allows users to purchase digital products like mobile credit (pulsa), electricity tokens, game vouchers, and e-wallet top-ups through natural language commands processed by Google's Gemini AI. It features both a customer-facing interface and an admin dashboard for transaction monitoring.

# User Preferences

Preferred communication style: Simple, everyday language.
UI preferences: User requested dropdown interface for AI chat instead of manual text input. User wants structured dropdown with Brand > Harga hierarchy for better organization of many product variants.

# Recent Changes

## Migration Completed Successfully (Aug 2, 2025)
- ✅ **Berhasil migrasi dari Replit Agent ke environment standar**
- ✅ **API Keys dikonfigurasi dan aktif**: Digiflazz + Gemini AI
- ✅ **1157 produk real berhasil diambil dari Digiflazz API**
- ✅ **In-memory storage berfungsi sempurna**
- ✅ **Aplikasi berjalan di port 5000 tanpa error**
- ✅ **Paydisini dihapus sesuai permintaan user**
- ✅ **UI cleanup: Footer disederhanakan, teks promosi dihapus**
- ✅ **Quick action buttons: 12 shortcut kategori sesuai API Digiflazz**
- ✅ **Semua produk dan brand diambil tanpa batasan: 1,178 produk dari 51 brand**

# Recent Changes

## Migration Completed Successfully (Aug 2, 2025)
- ✅ **Berhasil migrasi dari Replit Agent ke environment standar**
- ✅ **API Keys dikonfigurasi dan aktif**: Digiflazz + Gemini AI
- ✅ **1157 produk real berhasil diambil dari Digiflazz API**
- ✅ **In-memory storage berfungsi sempurna**
- ✅ **Aplikasi berjalan di port 5000 tanpa error**
- ✅ **Paydisini dihapus sesuai permintaan user**
- ✅ **UI cleanup: Footer disederhanakan, teks promosi dihapus**
- ✅ **Quick action buttons: 12 shortcut kategori sesuai API Digiflazz**
- ✅ **Semua produk dan brand diambil tanpa batasan: 1,178 produk dari 51 brand**

## Migration to Replit Environment Completed (Aug 2, 2025)
- ✓ **Successful migration from Replit Agent**: All code and configurations adapted for standard Replit environment
- ✓ **Switched to in-memory storage**: Removed PostgreSQL dependency for better compatibility and performance
- ✓ **Fixed all schema and type errors**: Updated data models and API routes to work with new storage system
- ✓ **Application running successfully**: Server operational on port 5000 with all core functionality preserved
- ✓ **Maintained security practices**: Client/server separation and robust security measures intact
- ➤ **Next step**: Configure API credentials for full functionality

## Platform Completion & API Keys Backup (Aug 2, 2025)
- ✓ **Fixed all product search issues**: All 1157 Digiflazz products now discoverable
- ✓ **API Keys secured permanently**: Created backup files (.env.example, API_KEYS_BACKUP.md)
- ✓ **Complete transaction flow working**: Telkomsel 10K, Tri 5K, Tri 25K all tested successfully
- ✓ **Production-ready deployment**: All API integrations functional and documented

## Migration & Integration Completed (Aug 2, 2025)
- ✓ Successfully migrated PPOB platform from Replit Agent to standard Replit environment
- ✓ Created PostgreSQL database and pushed schema (transactions, products, admin_stats tables)
- ✓ Configured API credentials: Digiflazz (PPOB services) and Gemini AI (natural language processing)
- ✓ Application running successfully on port 5000
- ✓ **Enhanced Digiflazz API Integration:**
  - Real-time product sync (1157 products from live API)
  - Intelligent product matching with AI
  - Authentic transaction processing with proper sign generation
  - Real-time price checking and product discovery
- ✓ **Advanced Gemini AI Integration:**
  - Enhanced natural language command parsing in Indonesian
  - AI-powered product analysis and recommendations
  - Smart transaction advice with price comparisons
  - Context-aware error messages and suggestions
- ✓ **Seamless API Integration:**
  - Digiflazz API calls with proper authentication (md5 signatures)
  - Gemini AI processing for command interpretation and response generation
  - Real-time product availability checking
  - Integrated fallback systems for robust operation

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