# Better Auth

Provides an integration layer for using Better Auth with Convex.

## Install

```bash
npm install @convex-dev/better-auth
```

## Links

- [npm package](https://www.npmjs.com/package/%40convex-dev%2Fbetter-auth)
- [GitHub repository](https://github.com/get-convex/better-auth)
- [Convex Components Directory](https://www.convex.dev/components/better-auth)

**Author:** get-convex

**Category:** Authentication

**Version:** 0.10.13  
**Weekly downloads:** 52,558

---

> Seamlessly integrate Better Auth with Convex databases for modern authentication patterns in full-stack TypeScript applications.

## Benefits

- Integrate Better Auth's flexible authentication system directly with Convex database operations
- Access user sessions and authentication state within Convex queries and mutations
- Eliminate custom authentication boilerplate by leveraging Better Auth's built-in providers
- Maintain type safety across authentication flows and database operations

## Use cases

### how to use Better Auth with Convex database

The @convex-dev/better-auth component provides adapters and utilities to connect Better Auth's authentication system with Convex's database layer. It handles session management and user data synchronization between Better Auth and your Convex schema.

### Convex authentication with social providers

This component enables you to use Better Auth's OAuth providers (Google, GitHub, etc.) while storing user data in Convex. It automatically syncs authentication events with your Convex database and provides type-safe access to user sessions in queries and mutations.

### Better Auth Convex integration setup

Install @convex-dev/better-auth and configure it to bridge Better Auth's authentication handlers with Convex's database operations. The component provides middleware and adapters that handle user creation, session management, and authentication state synchronization.

## FAQ

**Q: What authentication providers does Better Auth support with Convex?**

The @convex-dev/better-auth component supports all authentication providers that Better Auth offers, including OAuth providers like Google, GitHub, and Discord, as well as email/password and magic link authentication. The component handles syncing user data from any provider to your Convex database.

**Q: How does session management work with Better Auth and Convex?**

The @convex-dev/better-auth component automatically syncs Better Auth sessions with your Convex database. It provides utilities to access authenticated user data within Convex queries and mutations, maintaining session state consistency between the authentication layer and your database operations.

**Q: Can I customize user data storage when using Better Auth with Convex?**

Yes, the @convex-dev/better-auth component allows you to define custom Convex schemas for user data while maintaining compatibility with Better Auth's authentication flow. You can extend user profiles with additional fields and relationships specific to your application needs.

**Q: Does Better Auth with Convex support server-side rendering?**

The @convex-dev/better-auth component works with server-side rendering frameworks by providing utilities to validate sessions and access user data on the server. It integrates with Better Auth's SSR capabilities while maintaining access to Convex database operations.

## Resources

- [npm package](https://www.npmjs.com/package/%40convex-dev%2Fbetter-auth)
- [GitHub repository](https://github.com/get-convex/better-auth)
- [Convex Components Directory](https://www.convex.dev/components/better-auth)
- [Convex documentation](https://docs.convex.dev)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Convex Authentication Guide](https://docs.convex.dev/auth)

---

Convex + Better Auth 
Framework Agnostic
Support for popular frameworks.

Supports popular frameworks, including React, Vue, Svelte, Astro, Solid, Next.js, Nuxt, Tanstack Start, Hono, and more.

Authentication
Email & Password Authentication.

Built-in support for email and password authentication, with session and account management features.

Social Sign-on
Support multiple OAuth providers.

Allow users to sign in with their accounts, including GitHub, Google, Discord, Twitter, and more.

Two Factor
Multi Factor Authentication.

Secure your users accounts with two factor authentication with a few lines of code.

---

[![Convex Component](https://www.convex.dev/components/badge/better-auth)](https://www.convex.dev/components/better-auth)