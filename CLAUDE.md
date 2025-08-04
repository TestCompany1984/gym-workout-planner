# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx convex dev` - Start Convex development server

## Project Architecture

This is a Next.js 15 SaaS starter application with the following key integrations:

### Core Stack
- **Next.js 15** with App Router and Turbopack
- **Convex** - Real-time serverless database and backend functions
- **Clerk** - Authentication and billing management
- **TailwindCSS v4** - Styling with shadcn/ui components

### Database Schema (Convex)
Located in `convex/schema.ts`:
- `users` table with `name` and `externalId` (Clerk ID)
- `paymentAttempts` table for tracking subscription payments
- Indexes: `byExternalId`, `byPaymentId`, `byUserId`, `byPayerUserId`

### Authentication Flow
- Clerk handles authentication with automatic user sync to Convex
- Middleware in `middleware.ts` protects `/dashboard` routes
- Webhooks in `convex/http.ts` handle user lifecycle and payment events
- JWT template setup required for Clerk-Convex integration

### Route Structure
- `/` - Landing page components in `app/(landing)/`
- `/dashboard` - Protected dashboard with sidebar navigation
- `/dashboard/payment-gated` - Subscription-protected content
- `/clerk-users-webhook` - Webhook endpoint for Clerk events

### Key Components
- Landing page blocks (hero, features, pricing, testimonials, FAQ)
- Dashboard with interactive charts (Recharts), data tables, and sidebar
- Custom Clerk pricing component in `components/custom-clerk-pricing.tsx`
- Theme provider with dark/light mode support

### Convex Development Patterns

#### Function Guidelines
**New Function Syntax**
- ALWAYS use the new function syntax for Convex functions:
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
export const f = query({
    args: {},
    returns: v.null(),
    handler: async (ctx, args) => {
    // Function body
    },
});
```

**HTTP Endpoint Syntax**
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator:
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
const http = httpRouter();
http.route({
    path: "/echo",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
    }),
});
```

**Validators**
- Always use the `v.null()` validator when returning a null value
- Array validator example: `v.array(v.union(v.string(), v.number()))`
- Always include argument and return validators for all Convex functions
- If a function doesn't return anything, include `returns: v.null()`

**Function Registration**
- Use `internalQuery`, `internalMutation`, and `internalAction` for private functions
- Use `query`, `mutation`, and `action` for public functions
- CANNOT register a function through the `api` or `internal` objects

**Function Calling**
- Use `ctx.runQuery` to call a query from a query, mutation, or action
- Use `ctx.runMutation` to call a mutation from a mutation or action
- Use `ctx.runAction` to call an action from an action
- All calls take a `FunctionReference` - do NOT pass the function directly

**Function References**
- Use the `api` object for public functions registered with `query`, `mutation`, or `action`
- Use the `internal` object for private functions registered with `internalQuery`, `internalMutation`, or `internalAction`
- File-based routing: function in `convex/example.ts` named `f` has reference `api.example.f`

#### Schema Guidelines
- Always define schema in `convex/schema.ts`
- System fields `_creationTime` and `_id` are automatically added
- Include all index fields in the index name (e.g., "by_field1_and_field2")
- Index fields must be queried in the same order they are defined

#### Query Guidelines
- Do NOT use `filter` in queries - define an index and use `withIndex` instead
- Convex queries do NOT support `.delete()` - use `.collect()` and iterate with `ctx.db.delete(row._id)`
- Use `.unique()` to get a single document from a query
- Default order is ascending `_creationTime`
- Use `.order('asc')` or `.order('desc')` to specify order

#### Mutation Guidelines
- Use `ctx.db.replace` to fully replace an existing document
- Use `ctx.db.patch` to shallow merge updates into an existing document

#### Action Guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules
- Never use `ctx.db` inside of an action - actions don't have database access

#### TypeScript Guidelines
- Use `Id<'tableName'>` type from './_generated/dataModel' for document IDs
- Be strict with types, particularly around document IDs
- Always use `as const` for string literals in discriminated union types
- Define arrays as `const array: Array<T> = [...];`
- Define records as `const record: Record<KeyType, ValueType> = {...};`

### Environment Setup
Required environment variables:
- Convex: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
- Webhook: `CLERK_WEBHOOK_SECRET` (set in Convex dashboard)

### Payment Integration
- Clerk Billing handles subscriptions automatically
- Payment attempts tracked via webhook events
- Subscription status controls access to gated content

The codebase emphasizes minimal setup complexity while providing production-ready authentication, payments, and real-time data sync.