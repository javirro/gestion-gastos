# Rules to apply to API routes

- Use camelCase for query parameters and request body properties.
- Use plural nouns for resource names in the URL (e.g., /users, /products).
- Use customResponse for HTTP request as it is in some endpoints.
- Must have clear isolation between route/service/repository layers. The route file works as a controller.
- Service files contain business logic and call repository functions, and repository files handle database interactions.
- Avoid duplicating code by creating reusable functions for common functionality, such as error handling and data validation.


# Rules to apply to UI components

- Keep components small and focused on a single responsibility. No more than 120-150 lines.
- You must use SHADCN UI components for consistency and accessibility.
- Use Tailwind CSS for styling, and avoid inline styles.
- Must fetch data from API routes using server components when possible, and use client components only for interactivity and state management.
- Must handle loading states and error states gracefully, providing feedback to the user.
- Avoid duplicating code by creating reusable components and hooks for common functionality.

# Middleware

In Next.js v16 or higher Middleware is NOT used. The new convention is using proxy.ts

# Linting and formatting

- Do not use ; at the end of lines.
- Use single quotes for strings.