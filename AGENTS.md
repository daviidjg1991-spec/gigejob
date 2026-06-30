# Project Instructions & Conventions

- **Admin Configurations**: The user wants all configurations found under the "Admin" submenus (such as Categories, Footer configuration, and Legal information/Static Pages) to be **hardcoded directly in the source code**, instead of using the database for persistence. 
- **Workflow**: When the user requests to add a category, edit the footer, or change legal info, you (the AI) must edit the React code directly (e.g. `src/types.ts` or `src/App.tsx`) to reflect those changes. Do not use Firestore or database queries for these global settings.
