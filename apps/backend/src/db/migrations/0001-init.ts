import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType("provider_type").asEnum(["EMail"]).execute();
  await db.schema.createType("password_algo").asEnum(["BCrypt12"]).execute();

  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn("given_name", "varchar(50)", (col) => col.notNull())
    .addColumn("family_name", "varchar(50)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("user_providers")
    .addColumn("id", "uuid", (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn("user_id", "uuid", (col) => col.notNull())
    .addColumn("provider_type", sql`provider_type`, (col) => col.notNull())
    .addColumn("provider_account_id", "varchar(255)", (col) => col.notNull())
    .addColumn("password_algo", sql`password_algo`)
    .addColumn("password_hash", "varchar(255)")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addForeignKeyConstraint("fk_user_id", ["user_id"], "users", ["id"], (cb) => cb.onDelete("cascade"))
    .execute();

  await db.schema
    .createIndex("idx_provider_type_account_id")
    .on("user_providers")
    .columns(["provider_type", "provider_account_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("idx_provider_type_account_id").execute();
  await db.schema.dropTable("user_providers").execute();
  await db.schema.dropTable("users").execute();
  await db.schema.dropType("provider_type").execute();
  await db.schema.dropType("password_algo").execute();
}
