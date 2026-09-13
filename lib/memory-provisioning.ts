/**
 * Memory content lives in the public schema of MEMORY_DATABASE_URL /
 * AUTH_DATABASE_URL. Isolation is by user_id, not per-user schemas.
 */

export function getManagedMemoryDatabaseUrl() {
  return (
    process.env.MEMORY_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ''
  );
}

/**
 * Ensures the managed public-schema connection is recorded for this user.
 */
export async function ensureManagedMemoryConnection(_userId: string) {
  return {
    provisioned: Boolean(getManagedMemoryDatabaseUrl()),
    reason: 'public_postgres' as const,
    message: 'Memories are stored in the public Postgres schema.',
  };
}
