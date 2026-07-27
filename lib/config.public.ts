// PUBLIC config — safe to ship to the browser.
// NEVER add secrets here (service role keys, session secrets, password hashes).

export const publicConfig = {
  supabase: {
    url: 'https://saetlwpersbssoitbyil.supabase.co',
    // The anon key is designed to be public — access is limited by RLS policies
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZXRsd3BlcnNic3NvaXRieWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzgxMzUsImV4cCI6MjEwMDIxNDEzNX0.w4I3PDi040E9DnWPQzRc8vU9H-6wHjTyqjyherZUVjQ',
  },
} as const
