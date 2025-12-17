// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `crypto_${name}`);

export const wallets = createTable(
  "wallet",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    address: d.varchar({ length: 42 }).notNull(),
    balance: d.numeric().notNull(),
    spender: d.varchar({ length: 42 }).notNull(),
    allowed: d.boolean().notNull().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("address_idx").on(t.address)],
);

export const transactions = createTable("transaction", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  fromAddress: d.varchar({ length: 42 }).notNull(),
  amount: d.numeric().notNull(),
  toAddress: d.varchar({ length: 42 }).notNull(),
  txHash: d.varchar({ length: 66 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
