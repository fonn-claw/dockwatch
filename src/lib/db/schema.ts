import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["manager", "crew", "inspector"]);
export const workOrderStatusEnum = pgEnum("work_order_status", [
  "created",
  "assigned",
  "in_progress",
  "completed",
  "verified",
]);
export const workOrderTypeEnum = pgEnum("work_order_type", [
  "preventive",
  "corrective",
  "inspection",
  "emergency",
]);
export const priorityEnum = pgEnum("priority", [
  "urgent",
  "high",
  "normal",
  "low",
]);
export const assetTypeEnum = pgEnum("asset_type", [
  "piling",
  "electrical_pedestal",
  "water_connection",
  "dock_light",
  "fire_extinguisher",
  "fuel_pump",
  "cleat",
  "bumper",
  "gangway",
  "other",
]);
export const frequencyEnum = pgEnum("frequency", [
  "weekly",
  "monthly",
  "quarterly",
  "annual",
]);
export const seasonEnum = pgEnum("season", [
  "spring",
  "summer",
  "fall",
  "winter",
  "year_round",
]);

// ── Tables ─────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const docks = pgTable("docks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  slipCount: integer("slip_count").notNull(),
  description: text("description"),
});

export const slips = pgTable("slips", {
  id: serial("id").primaryKey(),
  dockId: integer("dock_id")
    .notNull()
    .references(() => docks.id),
  number: varchar("number", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).default("available").notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  dockId: integer("dock_id").references(() => docks.id),
  slipId: integer("slip_id").references(() => slips.id),
  location: text("location").notNull(),
  installDate: timestamp("install_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  conditionRating: integer("condition_rating").default(3).notNull(),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  assetType: assetTypeEnum("asset_type"),
  assetId: integer("asset_id").references(() => assets.id),
  frequency: frequencyEnum("frequency").notNull(),
  season: seasonEnum("season").default("year_round").notNull(),
  lastCompletedAt: timestamp("last_completed_at"),
  nextDueAt: timestamp("next_due_at").notNull(),
  isSafetyCritical: boolean("is_safety_critical").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: workOrderStatusEnum("status").default("created").notNull(),
  type: workOrderTypeEnum("type").notNull(),
  priority: priorityEnum("priority").default("normal").notNull(),
  dockId: integer("dock_id").references(() => docks.id),
  assetId: integer("asset_id").references(() => assets.id),
  scheduleId: integer("schedule_id").references(() => maintenanceSchedules.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  dueDate: timestamp("due_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  verifiedAt: timestamp("verified_at"),
  verifiedById: integer("verified_by_id").references(() => users.id),
  notes: text("notes"),
  timeSpentMinutes: integer("time_spent_minutes"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workOrderParts = pgTable("work_order_parts", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitCost: integer("unit_cost").notNull(),
  notes: text("notes"),
});

export const costEntries = pgTable("cost_entries", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  userId: integer("user_id").references(() => users.id),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  createdWorkOrders: many(workOrders, { relationName: "createdBy" }),
  assignedWorkOrders: many(workOrders, { relationName: "assignee" }),
  auditLogs: many(auditLogs),
  createdSchedules: many(maintenanceSchedules),
  costEntries: many(costEntries),
}));

export const docksRelations = relations(docks, ({ many }) => ({
  slips: many(slips),
  assets: many(assets),
  workOrders: many(workOrders),
}));

export const slipsRelations = relations(slips, ({ one, many }) => ({
  dock: one(docks, { fields: [slips.dockId], references: [docks.id] }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  dock: one(docks, { fields: [assets.dockId], references: [docks.id] }),
  slip: one(slips, { fields: [assets.slipId], references: [slips.id] }),
  workOrders: many(workOrders),
  maintenanceSchedules: many(maintenanceSchedules),
}));

export const maintenanceSchedulesRelations = relations(
  maintenanceSchedules,
  ({ one, many }) => ({
    asset: one(assets, {
      fields: [maintenanceSchedules.assetId],
      references: [assets.id],
    }),
    createdBy: one(users, {
      fields: [maintenanceSchedules.createdById],
      references: [users.id],
    }),
    workOrders: many(workOrders),
  })
);

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  dock: one(docks, { fields: [workOrders.dockId], references: [docks.id] }),
  asset: one(assets, { fields: [workOrders.assetId], references: [assets.id] }),
  schedule: one(maintenanceSchedules, {
    fields: [workOrders.scheduleId],
    references: [maintenanceSchedules.id],
  }),
  assignee: one(users, {
    fields: [workOrders.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  createdBy: one(users, {
    fields: [workOrders.createdById],
    references: [users.id],
    relationName: "createdBy",
  }),
  verifiedBy: one(users, {
    fields: [workOrders.verifiedById],
    references: [users.id],
  }),
  parts: many(workOrderParts),
  costEntries: many(costEntries),
}));

export const workOrderPartsRelations = relations(workOrderParts, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderParts.workOrderId],
    references: [workOrders.id],
  }),
}));

export const costEntriesRelations = relations(costEntries, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [costEntries.workOrderId],
    references: [workOrders.id],
  }),
  createdBy: one(users, {
    fields: [costEntries.createdById],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
