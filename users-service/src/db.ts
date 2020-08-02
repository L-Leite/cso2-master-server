import postgres from 'postgres'

import {
    DB_POSTGRES_END_TIMEOUT,
    DB_POSTGRES_CONFIG,
    DB_POSTGRES_CUSTOM_TYPES
} from 'config/db'

export let sql: postgres.Sql<DB_POSTGRES_CUSTOM_TYPES> = null
export function InitSql(): void {
    sql = postgres(DB_POSTGRES_CONFIG)
}

export async function ShutdownSql(): Promise<void> {
    await sql.end({ timeout: DB_POSTGRES_END_TIMEOUT })
}

export function ToPostgresError(obj: unknown): postgres.Error {
    if (obj instanceof sql.PostgresError) {
        return obj as postgres.Error
    }

    return null
}
