// Centralized hardcoded config — all secrets are server-only
// NEXT_PUBLIC_ values are intentionally public (Supabase anon key is safe to expose)

export const config = {
  supabase: {
    url: 'https://saetlwpersbssoitbyil.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZXRsd3BlcnNic3NvaXRieWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzgxMzUsImV4cCI6MjEwMDIxNDEzNX0.w4I3PDi040E9DnWPQzRc8vU9H-6wHjTyqjyherZUVjQ',
    // serviceRoleKey is used ONLY in server-side code — never sent to the browser
    serviceRoleKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZXRsd3BlcnNic3NvaXRieWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYzODEzNSwiZXhwIjoyMTAwMjE0MTM1fQ.PtbU00dCeJhb0GY-BHX8urfZkfzMV9UCaVtSwCnlRog',
  },

  admin: {
    login: 'km',
    // Password stored as SHA-256(password + salt) — never plain text in code
    passwordHash: 'c3f201200031e3959c5bdd5e53109a01a210f6cf430e56206405d3834a2b5ab4',
    passwordSalt: 'usadba_salt_2026',
  },

  // Used to sign session cookies — prevents cookie forgery
  sessionSecret: '4c5d261835fdcfa972891a4fd4bb73d6cd2ad7ee66bca3d8d9c7969c1071a4b5',
} as const
