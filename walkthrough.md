# Walkthrough of the Codebase:
The project is structured to effectively organize and manage various components of a Node.js application using Fastify, Prisma, and other utilities to handle operations related to social media functionalities like user authentication, post management, and user relationships.

# Directory Structure & Key Components:
1. /components:

    Purpose: Houses the business logic for handling specific functionalities.
    Contents: Divided into subdirectories like auth, posts, and users. Each subdirectory contains files that handle specific API endpoints.

    `auth`: Includes login.js and signup.js for user authentication processes.
    `posts`: Manages post creation and retrieval through files like `createPost.controller.ts` and `getUserFeed.controller.ts`.
    `users`: Handles user-related functionalities such as `followUser.controller.ts`.

2. /core:

    Purpose: Contains essential utilities and middleware that are used across the application.
    Contents:
    `fastifyPlugin.ts`: A plugin that uses AsyncLocalStorage to manage request tracing.
    `withSchema.ts`: A utility for integrating TypeBox schema validation with Fastify routes.

3. /loaders:

    Purpose: Responsible for the initialization and configuration of core components and external services.
    Contents:
    `index.ts`: Manages the sequential initialization of external services like the Prisma client, with retry logic for robust startup.
    `prisma.ts`: Initializes the PrismaClient with detailed query logging.

4. /services:

    Purpose: Includes reusable logic that can be invoked across various parts of the application.
    Contents:
    `redis.ts`: Manages Redis clients with unique key prefixes for different parts of the application, handling connections and errors to ensure robust caching support.
    `token.ts`: Provides functionality to generate authentication tokens using JWT, integrated with Prisma.

5. /utils:

    Purpose: Provides utility functions and helpers that offer additional functionalities.
    Contents:
    `logger.ts`: Configures a pino logger with context-aware capabilities and different logging levels based on the environment.
    `error.ts`: Handles operational and programmer errors robustly by logging them and gracefully shutting down the application to avoid inconsistent states.
    `sleep.ts`: Provides a promise-based delay function that can be used to pause execution for a set amount of time, useful in simulations and timeout operations.
    `withCache.ts`: Implements caching logic using Redis, supporting serialization with MessagePack to optimize performance for frequently accessed data.
    `withStaleWhileRevalidate.ts`: Applies the stale-while-revalidate caching strategy to functions, fetching data from cache and revalidating it in the background to keep it fresh.

6. /hooks:

    Purpose: Utilizes Fastify hooks to perform actions at different stages of the request lifecycle.
    Contents:
    `authRequired.hook.ts`: Verifies JWT tokens from request headers to authenticate users and attaches user details to the request object.

7. index.ts and app/index.ts:

    Purpose: Serve as the entry points for initializing and starting the Fastify server, setting up routes, plugins, and middleware.
    Details:
    `index.ts`: Configures global settings, imports all necessary modules, and launches the server.
    `app/index.ts`: Aggregates all application routes and middleware, applying them to the Fastify instance.

## Database:
1. /prisma:

    Contents:
    `schema.prisma`: Provides all the tables that the database system will have.

2. /scripts:

    Purpose: This directory contains scripts that are used for data generation, text creation, and token management.
    Contents:
    `generate.ts`: Automates the creation of large volumes of user, follow, and post data in the database using Prisma and Faker.
    `ipsum.ts`: Generates pseudo-random, contextually rich text based on a predefined vocabulary.
    `token.ts:` Generates an authentication token for a specified user using JWT.

### Endpoints

API Versioning is used.

`routes.ts` in each component hosts the APIs for each key component
- `/api/v1/login` and `/api/v1/signup`: User authentication and new user signup.
- `/api/v1/posts/create`: Creates new posts for each user with visibility setting.
- `/api/v1/posts/feed`: User's feed is retrieved.
- `/api/v1/users/:id/follow`: User can follow another user.