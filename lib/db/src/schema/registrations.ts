import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const registrationCompanionSchema = z.object({
  name: z.string(),
  age: z.string(),
  gender: z.enum(["Male", "Female", "Other", ""]),
  relation: z.string(),
});

export const registrationsTable = pgTable("registrations", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  age: text("age").notNull(),
  gender: text("gender").notNull(),
  mobile: text("mobile").notNull(),
  whatsapp: text("whatsapp").notNull(),
  village: text("village").notNull(),
  block: text("block").notNull(),
  district: text("district").notNull(),
  allergy: text("allergy").notNull().default(""),
  companions: jsonb("companions")
    .$type<z.infer<typeof registrationCompanionSchema>[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;