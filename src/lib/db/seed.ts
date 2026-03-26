import { db } from "./index";
import {
  users,
  docks,
  slips,
  assets,
  maintenanceSchedules,
  workOrders,
  workOrderParts,
  costEntries,
  auditLogs,
} from "./schema";
import { hash } from "bcryptjs";
import { subDays, subMonths, addDays } from "date-fns";

// ── Helpers ─────────────────────────────────────────────────────────────────

const now = new Date();

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function daysAgo(n: number): Date {
  return subDays(now, n);
}

function monthsAgo(n: number): Date {
  return subMonths(now, n);
}

function daysFromNow(n: number): Date {
  return addDays(now, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Asset type to cost category (mirrors budgets.ts) ────────────────────────

const ASSET_TYPE_TO_CATEGORY: Record<string, string> = {
  piling: "structural",
  electrical_pedestal: "electrical",
  water_connection: "plumbing",
  dock_light: "electrical",
  fire_extinguisher: "safety",
  fuel_pump: "mechanical",
  cleat: "structural",
  bumper: "structural",
  gangway: "structural",
  other: "general",
};

// ── Parts catalog (unitCost in cents) ───────────────────────────────────────

const PARTS_CATALOG = [
  { name: "GFCI Outlet", minCost: 8500, maxCost: 12000, categories: ["electrical"] },
  { name: "Piling cap", minCost: 4500, maxCost: 7500, categories: ["structural"] },
  { name: "LED dock light bulb", minCost: 2500, maxCost: 4000, categories: ["electrical"] },
  { name: "Water hose fitting", minCost: 1500, maxCost: 3000, categories: ["plumbing"] },
  { name: "Fire extinguisher", minCost: 6000, maxCost: 9000, categories: ["safety"] },
  { name: "Fuel line gasket", minCost: 3500, maxCost: 5500, categories: ["mechanical"] },
  { name: "Dock cleat", minCost: 2000, maxCost: 4000, categories: ["structural"] },
  { name: "Circuit breaker 30A", minCost: 4500, maxCost: 7000, categories: ["electrical"] },
  { name: "Shore power cord adapter", minCost: 9500, maxCost: 15000, categories: ["electrical"] },
  { name: "Weatherproof outlet cover", minCost: 1200, maxCost: 2500, categories: ["electrical"] },
  { name: "Pedestal meter socket", minCost: 12000, maxCost: 18000, categories: ["electrical"] },
  { name: "Dock bumper rubber", minCost: 3000, maxCost: 5000, categories: ["structural"] },
];

// ── Main seed function ──────────────────────────────────────────────────────

async function seed() {
  console.log("Starting full seed of Sunset Harbor Marina...\n");

  // ── Clean tables (reverse FK order) ─────────────────────────────────────

  console.log("Clearing existing data...");
  await db.delete(auditLogs);
  await db.delete(costEntries);
  await db.delete(workOrderParts);
  await db.delete(workOrders);
  await db.delete(maintenanceSchedules);
  await db.delete(assets);
  await db.delete(slips);
  await db.delete(docks);
  await db.delete(users);
  console.log("  Done.\n");

  // ── Users ───────────────────────────────────────────────────────────────

  console.log("Seeding users...");
  const passwordHash = await hash("demo1234", 10);

  const insertedUsers = await db
    .insert(users)
    .values([
      { name: "Maria Santos", email: "manager@dockwatch.app", passwordHash, role: "manager" as const },
      { name: "Mike Torres", email: "crew@dockwatch.app", passwordHash, role: "crew" as const },
      { name: "Sarah Chen", email: "crew2@dockwatch.app", passwordHash, role: "crew" as const },
      { name: "Jake Williams", email: "crew3@dockwatch.app", passwordHash, role: "crew" as const },
      { name: "Robert Kim", email: "inspector@dockwatch.app", passwordHash, role: "inspector" as const },
    ])
    .returning({ id: users.id, name: users.name });

  const userMap: Record<string, number> = {};
  for (const u of insertedUsers) {
    userMap[u.name] = u.id;
  }
  const managerId = userMap["Maria Santos"];
  const mikeId = userMap["Mike Torres"];
  const sarahId = userMap["Sarah Chen"];
  const jakeId = userMap["Jake Williams"];
  const inspectorId = userMap["Robert Kim"];
  console.log(`  Created ${insertedUsers.length} users.\n`);

  // ── Docks ───────────────────────────────────────────────────────────────

  console.log("Seeding docks...");
  const dockData = [
    { name: "Dock A", code: "A", slipCount: 15, description: "Main dock - closest to marina office" },
    { name: "Dock B", code: "B", slipCount: 15, description: "West wing - larger vessel slips" },
    { name: "Dock C", code: "C", slipCount: 15, description: "East wing - sailboat section" },
    { name: "Dock D", code: "D", slipCount: 15, description: "Outer dock - fuel access" },
  ];
  const insertedDocks = await db.insert(docks).values(dockData).returning({ id: docks.id, code: docks.code });
  const dockMap: Record<string, number> = {};
  for (const d of insertedDocks) {
    dockMap[d.code] = d.id;
  }
  console.log(`  Created ${insertedDocks.length} docks.\n`);

  // ── Slips ───────────────────────────────────────────────────────────────

  console.log("Seeding slips...");
  const slipValues: { dockId: number; number: string; status: string }[] = [];
  for (const d of insertedDocks) {
    for (let i = 1; i <= 15; i++) {
      slipValues.push({
        dockId: d.id,
        number: `${d.code}-${String(i).padStart(2, "0")}`,
        status: "available",
      });
    }
  }
  const insertedSlips = await db.insert(slips).values(slipValues).returning({ id: slips.id, dockId: slips.dockId, number: slips.number });
  console.log(`  Created ${insertedSlips.length} slips.\n`);

  // Build slip lookup: dockId -> slipId[]
  const slipsByDock: Record<number, number[]> = {};
  for (const s of insertedSlips) {
    if (!slipsByDock[s.dockId]) slipsByDock[s.dockId] = [];
    slipsByDock[s.dockId].push(s.id);
  }

  // ── Assets ──────────────────────────────────────────────────────────────

  console.log("Seeding assets...");

  type AssetType = "piling" | "electrical_pedestal" | "water_connection" | "dock_light" |
    "fire_extinguisher" | "fuel_pump" | "cleat" | "bumper" | "gangway";

  // Per-dock asset template
  const assetTemplate: { type: AssetType; count: number; namePrefix: string; perSlip?: boolean }[] = [
    { type: "cleat", count: 15, namePrefix: "Cleat", perSlip: true },
    { type: "electrical_pedestal", count: 8, namePrefix: "Electrical Pedestal" },
    { type: "water_connection", count: 4, namePrefix: "Water Connection" },
    { type: "dock_light", count: 4, namePrefix: "Dock Light" },
    { type: "fire_extinguisher", count: 2, namePrefix: "Fire Extinguisher" },
    { type: "fuel_pump", count: 1, namePrefix: "Fuel Pump" },
    { type: "piling", count: 2, namePrefix: "Piling" },
    { type: "bumper", count: 1, namePrefix: "Dock Bumper" },
    { type: "gangway", count: 1, namePrefix: "Gangway" },
  ];

  const assetValues: {
    name: string;
    assetType: AssetType;
    dockId: number;
    slipId: number | null;
    location: string;
    installDate: Date;
    warrantyExpiry: Date | null;
    conditionRating: number;
    notes: string | null;
  }[] = [];

  const dockCodes = ["A", "B", "C", "D"];

  for (const code of dockCodes) {
    const dockId = dockMap[code];
    const dockSlips = slipsByDock[dockId] || [];

    for (const tmpl of assetTemplate) {
      // Dock D gets extra fuel pump
      const count = tmpl.type === "fuel_pump" && code === "D" ? 2 : tmpl.count;

      for (let i = 1; i <= count; i++) {
        const slipId = tmpl.perSlip && dockSlips[i - 1] ? dockSlips[i - 1] : null;
        const installYear = randInt(2015, 2024);
        const installDate = utc(installYear, randInt(1, 12), randInt(1, 28));
        const hasWarranty = installYear >= 2021;
        const warrantyExpiry = hasWarranty ? utc(installYear + 5, randInt(1, 12), 1) : null;

        // Condition: Dock B/C pilings and electrical are lower, Dock A newer installs are higher
        let condition: number;
        if ((code === "B" || code === "C") && (tmpl.type === "piling" || tmpl.type === "electrical_pedestal")) {
          condition = randInt(1, 2);
        } else if (code === "A" && installYear >= 2022) {
          condition = 5;
        } else {
          condition = randInt(3, 4);
        }

        assetValues.push({
          name: `${tmpl.namePrefix} ${code}-${i}`,
          assetType: tmpl.type,
          dockId,
          slipId,
          location: slipId ? `Dock ${code}, Slip ${code}-${String(i).padStart(2, "0")}` : `Dock ${code}`,
          installDate,
          warrantyExpiry,
          conditionRating: condition,
          notes: condition <= 2 ? "Needs attention - scheduled for inspection" : null,
        });
      }
    }
  }

  const insertedAssets = await db.insert(assets).values(assetValues).returning({
    id: assets.id,
    name: assets.name,
    assetType: assets.assetType,
    dockId: assets.dockId,
  });
  console.log(`  Created ${insertedAssets.length} assets.\n`);

  // Build asset lookup: by type and dock
  const assetsByTypeDock: Record<string, number[]> = {};
  for (const a of insertedAssets) {
    const key = `${a.assetType}_${a.dockId}`;
    if (!assetsByTypeDock[key]) assetsByTypeDock[key] = [];
    assetsByTypeDock[key].push(a.id);
  }

  function firstAsset(type: string, dockCode: string): number | null {
    const key = `${type}_${dockMap[dockCode]}`;
    return assetsByTypeDock[key]?.[0] ?? null;
  }

  // ── Maintenance Schedules ───────────────────────────────────────────────

  console.log("Seeding maintenance schedules...");

  type ScheduleInput = {
    name: string;
    description: string;
    assetType: AssetType;
    assetId: number | null;
    frequency: "weekly" | "monthly" | "quarterly" | "annual";
    season: "year_round" | "spring" | "summer" | "fall" | "winter";
    lastCompletedAt: Date | null;
    nextDueAt: Date;
    isSafetyCritical: boolean;
    createdById: number;
  };

  const scheduleValues: ScheduleInput[] = [];

  // Helper for building per-dock schedules
  for (const code of dockCodes) {
    // Weekly: safety walk-through
    scheduleValues.push({
      name: `Weekly Safety Walk-Through - Dock ${code}`,
      description: `Visual safety inspection of all Dock ${code} infrastructure`,
      assetType: "gangway",
      assetId: firstAsset("gangway", code),
      frequency: "weekly",
      season: "year_round",
      lastCompletedAt: daysAgo(3),
      nextDueAt: daysFromNow(4),
      isSafetyCritical: false,
      createdById: managerId,
    });

    // Weekly: fire extinguisher check
    const isOverdueFire = code === "B"; // Dock B fire ext 3 days overdue
    scheduleValues.push({
      name: `Fire Extinguisher Visual Check - Dock ${code}`,
      description: `Check all fire extinguishers on Dock ${code} for pressure, pin, seal`,
      assetType: "fire_extinguisher",
      assetId: firstAsset("fire_extinguisher", code),
      frequency: "weekly",
      season: "year_round",
      lastCompletedAt: isOverdueFire ? daysAgo(10) : daysAgo(5),
      nextDueAt: isOverdueFire ? daysAgo(3) : daysFromNow(2),
      isSafetyCritical: true,
      createdById: managerId,
    });

    // Monthly: electrical pedestal testing
    const isOverdueElecB = code === "B"; // 2 weeks overdue
    const isOverdueElecC = code === "C"; // 10 days overdue
    scheduleValues.push({
      name: `Monthly Electrical Pedestal Testing - Dock ${code}`,
      description: `Test all electrical pedestals on Dock ${code}: voltage, GFCI, connections`,
      assetType: "electrical_pedestal",
      assetId: firstAsset("electrical_pedestal", code),
      frequency: "monthly",
      season: "year_round",
      lastCompletedAt: isOverdueElecB ? monthsAgo(2) : isOverdueElecC ? daysAgo(40) : daysAgo(20),
      nextDueAt: isOverdueElecB ? daysAgo(14) : isOverdueElecC ? daysAgo(10) : daysFromNow(10),
      isSafetyCritical: true,
      createdById: managerId,
    });

    // Monthly: dock light inspection
    scheduleValues.push({
      name: `Dock Light Inspection - Dock ${code}`,
      description: `Inspect all dock lights on Dock ${code} for function and damage`,
      assetType: "dock_light",
      assetId: firstAsset("dock_light", code),
      frequency: "monthly",
      season: "year_round",
      lastCompletedAt: daysAgo(15),
      nextDueAt: daysFromNow(15),
      isSafetyCritical: false,
      createdById: managerId,
    });

    // Quarterly: piling inspection
    const isOverduePiling = code === "C"; // 1 month overdue
    scheduleValues.push({
      name: `Piling Inspection - Dock ${code}`,
      description: `Structural inspection of all pilings on Dock ${code}`,
      assetType: "piling",
      assetId: firstAsset("piling", code),
      frequency: "quarterly",
      season: "year_round",
      lastCompletedAt: isOverduePiling ? monthsAgo(4) : monthsAgo(2),
      nextDueAt: isOverduePiling ? daysAgo(30) : daysFromNow(60),
      isSafetyCritical: false,
      createdById: managerId,
    });

    // Quarterly: water line flush
    scheduleValues.push({
      name: `Water Line Flush - Dock ${code}`,
      description: `Flush and test all water connections on Dock ${code}`,
      assetType: "water_connection",
      assetId: firstAsset("water_connection", code),
      frequency: "quarterly",
      season: "year_round",
      lastCompletedAt: monthsAgo(2),
      nextDueAt: daysFromNow(30),
      isSafetyCritical: false,
      createdById: managerId,
    });

    // Annual: full structural survey
    scheduleValues.push({
      name: `Annual Structural Survey - Dock ${code}`,
      description: `Comprehensive structural assessment of Dock ${code}`,
      assetType: "piling",
      assetId: firstAsset("piling", code),
      frequency: "annual",
      season: "year_round",
      lastCompletedAt: monthsAgo(10),
      nextDueAt: daysFromNow(60),
      isSafetyCritical: false,
      createdById: managerId,
    });

    // Annual: gangway replacement evaluation
    scheduleValues.push({
      name: `Gangway Replacement Evaluation - Dock ${code}`,
      description: `Assess gangway condition and determine replacement needs for Dock ${code}`,
      assetType: "gangway",
      assetId: firstAsset("gangway", code),
      frequency: "annual",
      season: "spring",
      lastCompletedAt: monthsAgo(11),
      nextDueAt: daysFromNow(30),
      isSafetyCritical: false,
      createdById: managerId,
    });
  }

  // Dock D fuel pump quarterly - 2 weeks overdue
  scheduleValues.push({
    name: "Fuel Pump Quarterly Inspection - Dock D",
    description: "Inspect fuel pumps, check for leaks, test flow meters",
    assetType: "fuel_pump",
    assetId: firstAsset("fuel_pump", "D"),
    frequency: "quarterly",
    season: "year_round",
    lastCompletedAt: monthsAgo(4),
    nextDueAt: daysAgo(14),
    isSafetyCritical: true,
    createdById: managerId,
  });

  // Spring-only schedules
  scheduleValues.push({
    name: "Spring Hull Inspection Prep - All Docks",
    description: "Prepare inspection stations for spring hull inspections",
    assetType: "other" as AssetType,
    assetId: null,
    frequency: "annual",
    season: "spring",
    lastCompletedAt: monthsAgo(12),
    nextDueAt: daysFromNow(14),
    isSafetyCritical: false,
    createdById: managerId,
  });

  scheduleValues.push({
    name: "Bottom Painting Prep Stations - All Docks",
    description: "Set up and supply bottom painting prep areas",
    assetType: "other" as AssetType,
    assetId: null,
    frequency: "annual",
    season: "spring",
    lastCompletedAt: monthsAgo(11),
    nextDueAt: daysFromNow(21),
    isSafetyCritical: false,
    createdById: managerId,
  });

  const insertedSchedules = await db.insert(maintenanceSchedules).values(scheduleValues).returning({
    id: maintenanceSchedules.id,
    name: maintenanceSchedules.name,
    assetId: maintenanceSchedules.assetId,
  });
  console.log(`  Created ${insertedSchedules.length} maintenance schedules.\n`);

  // ── Work Orders ─────────────────────────────────────────────────────────

  console.log("Seeding work orders...");

  type WOType = "preventive" | "corrective" | "inspection" | "emergency";
  type WOStatus = "created" | "assigned" | "in_progress" | "completed" | "verified";
  type WOPriority = "urgent" | "high" | "normal" | "low";

  // Historical work order templates
  const historicalTitles: { title: string; type: WOType; priority: WOPriority; assetType: AssetType }[] = [
    { title: "Monthly electrical pedestal testing", type: "preventive", priority: "normal", assetType: "electrical_pedestal" },
    { title: "Weekly fire extinguisher check", type: "inspection", priority: "normal", assetType: "fire_extinguisher" },
    { title: "Dock light bulb replacement", type: "corrective", priority: "high", assetType: "dock_light" },
    { title: "Piling inspection", type: "inspection", priority: "normal", assetType: "piling" },
    { title: "Water line flush and test", type: "preventive", priority: "normal", assetType: "water_connection" },
    { title: "GFCI outlet replacement", type: "corrective", priority: "high", assetType: "electrical_pedestal" },
    { title: "Cleat tightening and inspection", type: "preventive", priority: "low", assetType: "cleat" },
    { title: "Gangway hinge lubrication", type: "preventive", priority: "low", assetType: "gangway" },
    { title: "Fuel pump flow meter calibration", type: "preventive", priority: "normal", assetType: "fuel_pump" },
    { title: "Emergency dock light outage repair", type: "emergency", priority: "urgent", assetType: "dock_light" },
    { title: "Replace cracked piling cap", type: "corrective", priority: "high", assetType: "piling" },
    { title: "Shore power cord inspection", type: "inspection", priority: "normal", assetType: "electrical_pedestal" },
    { title: "Fire extinguisher replacement", type: "corrective", priority: "urgent", assetType: "fire_extinguisher" },
    { title: "Dock bumper replacement", type: "corrective", priority: "normal", assetType: "bumper" },
    { title: "Electrical pedestal weatherproofing", type: "preventive", priority: "normal", assetType: "electrical_pedestal" },
    { title: "Water connection winterization", type: "preventive", priority: "high", assetType: "water_connection" },
    { title: "Structural survey", type: "inspection", priority: "normal", assetType: "piling" },
    { title: "Circuit breaker replacement", type: "corrective", priority: "urgent", assetType: "electrical_pedestal" },
    { title: "Fuel line inspection", type: "inspection", priority: "high", assetType: "fuel_pump" },
    { title: "Dock surface cleaning", type: "preventive", priority: "low", assetType: "gangway" },
  ];

  // Month distribution for historical WOs: Oct=8, Nov=10, Dec=10, Jan=12, Feb=15, Mar=30
  const monthDistribution = [
    { monthsBack: 5, count: 8 },   // Oct 2025
    { monthsBack: 4, count: 10 },  // Nov 2025
    { monthsBack: 3, count: 10 },  // Dec 2025
    { monthsBack: 2, count: 12 },  // Jan 2026
    { monthsBack: 1, count: 15 },  // Feb 2026
    { monthsBack: 0, count: 30 },  // Mar 2026
  ];

  const woValues: {
    title: string;
    description: string | null;
    status: WOStatus;
    type: WOType;
    priority: WOPriority;
    dockId: number;
    assetId: number | null;
    scheduleId: number | null;
    assigneeId: number | null;
    createdById: number;
    dueDate: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    verifiedAt: Date | null;
    verifiedById: number | null;
    notes: string | null;
    timeSpentMinutes: number | null;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  const completionNotes = [
    "Completed without issues. All within spec.",
    "Found minor wear, addressed during maintenance.",
    "Replaced worn component. Retested and passed.",
    "All readings normal. Documented in log.",
    "Completed. Recommend follow-up in 2 weeks.",
    "Cleaned and inspected. No issues found.",
    "Fixed issue, tested. Operating normally.",
    "Parts replaced. New readings within tolerance.",
  ];

  // Generate historical completed/verified WOs
  let woIndex = 0;
  for (const period of monthDistribution) {
    for (let i = 0; i < period.count; i++) {
      const tmpl = historicalTitles[woIndex % historicalTitles.length];
      const dockCode = dockCodes[woIndex % 4];
      const dockId = dockMap[dockCode];

      // Assign crew: Mike (A/B), Sarah (C/D), Jake floats
      let assigneeId: number;
      if (dockCode === "A" || dockCode === "B") {
        assigneeId = woIndex % 5 === 0 ? jakeId : mikeId;
      } else {
        assigneeId = woIndex % 5 === 0 ? jakeId : sarahId;
      }

      const dayOffset = randInt(1, 28);
      const createdAt = period.monthsBack === 0
        ? daysAgo(randInt(1, 25))
        : subDays(monthsAgo(period.monthsBack), -dayOffset);
      const startedAt = addDays(createdAt, randInt(0, 2));
      const completedAt = addDays(startedAt, randInt(0, 3));
      const isVerified = woIndex % 3 !== 0; // ~66% verified
      const verifiedAt = isVerified ? addDays(completedAt, randInt(1, 3)) : null;

      const assetKey = `${tmpl.assetType}_${dockId}`;
      const possibleAssets = assetsByTypeDock[assetKey] || [];
      const assetId = possibleAssets.length > 0 ? pick(possibleAssets) : null;

      woValues.push({
        title: `${tmpl.title} - Dock ${dockCode}`,
        description: `Scheduled ${tmpl.type} work on Dock ${dockCode}`,
        status: isVerified ? "verified" : "completed",
        type: tmpl.type,
        priority: tmpl.priority,
        dockId,
        assetId,
        scheduleId: null,
        assigneeId,
        createdById: managerId,
        dueDate: addDays(createdAt, 7),
        startedAt,
        completedAt,
        verifiedAt,
        verifiedById: isVerified ? managerId : null,
        notes: pick(completionNotes),
        timeSpentMinutes: randInt(30, 180),
        createdAt,
        updatedAt: verifiedAt || completedAt,
      });

      woIndex++;
    }
  }

  // 10 currently open work orders
  const openWOs: typeof woValues = [
    // 2 created (not yet assigned)
    {
      title: "Spring dock inspection prep - Dock A",
      description: "Prepare Dock A for annual spring inspection season",
      status: "created",
      type: "inspection",
      priority: "normal",
      dockId: dockMap["A"],
      assetId: firstAsset("gangway", "A"),
      scheduleId: null,
      assigneeId: null,
      createdById: managerId,
      dueDate: daysFromNow(7),
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: null,
      timeSpentMinutes: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      title: "Replace corroded water fitting - Dock C",
      description: "Water connection C-3 showing signs of corrosion, needs replacement",
      status: "created",
      type: "corrective",
      priority: "high",
      dockId: dockMap["C"],
      assetId: firstAsset("water_connection", "C"),
      scheduleId: null,
      assigneeId: null,
      createdById: managerId,
      dueDate: daysFromNow(3),
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: null,
      timeSpentMinutes: null,
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    },
    // 3 assigned
    {
      title: "Electrical pedestal repair - Dock B",
      description: "Pedestal B-3 tripping GFCI repeatedly, needs diagnosis",
      status: "assigned",
      type: "corrective",
      priority: "urgent",
      dockId: dockMap["B"],
      assetId: firstAsset("electrical_pedestal", "B"),
      scheduleId: null,
      assigneeId: mikeId,
      createdById: managerId,
      dueDate: daysFromNow(2),
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: null,
      timeSpentMinutes: null,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      title: "Fire extinguisher replacement - Dock D",
      description: "FE D-1 past inspection date, replace with new unit",
      status: "assigned",
      type: "corrective",
      priority: "high",
      dockId: dockMap["D"],
      assetId: firstAsset("fire_extinguisher", "D"),
      scheduleId: null,
      assigneeId: sarahId,
      createdById: managerId,
      dueDate: daysFromNow(5),
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: null,
      timeSpentMinutes: null,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      title: "Dock light replacement - Dock A",
      description: "Light A-2 flickering, LED bulb replacement needed",
      status: "assigned",
      type: "corrective",
      priority: "normal",
      dockId: dockMap["A"],
      assetId: firstAsset("dock_light", "A"),
      scheduleId: null,
      assigneeId: jakeId,
      createdById: managerId,
      dueDate: daysFromNow(7),
      startedAt: null,
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: null,
      timeSpentMinutes: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    // 3 in_progress
    {
      title: "Fuel pump gasket replacement - Dock D",
      description: "Slow leak detected at pump D-1, replacing gasket",
      status: "in_progress",
      type: "corrective",
      priority: "urgent",
      dockId: dockMap["D"],
      assetId: firstAsset("fuel_pump", "D"),
      scheduleId: null,
      assigneeId: sarahId,
      createdById: managerId,
      dueDate: daysFromNow(1),
      startedAt: daysAgo(1),
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: "Started disassembly, waiting on gasket delivery",
      timeSpentMinutes: 45,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
    {
      title: "Monthly electrical testing - Dock A",
      description: "Routine monthly testing of all Dock A electrical pedestals",
      status: "in_progress",
      type: "preventive",
      priority: "normal",
      dockId: dockMap["A"],
      assetId: firstAsset("electrical_pedestal", "A"),
      scheduleId: null,
      assigneeId: mikeId,
      createdById: managerId,
      dueDate: daysFromNow(3),
      startedAt: daysAgo(0),
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: "Testing pedestals 1-4 complete, continuing tomorrow",
      timeSpentMinutes: 60,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(0),
    },
    {
      title: "Piling wrap repair - Dock B",
      description: "Piling B-1 protective wrap damaged, needs re-wrapping",
      status: "in_progress",
      type: "corrective",
      priority: "high",
      dockId: dockMap["B"],
      assetId: firstAsset("piling", "B"),
      scheduleId: null,
      assigneeId: jakeId,
      createdById: managerId,
      dueDate: daysFromNow(2),
      startedAt: daysAgo(1),
      completedAt: null,
      verifiedAt: null,
      verifiedById: null,
      notes: "Removed old wrap, prepping surface for new wrap",
      timeSpentMinutes: 90,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    // 2 completed (awaiting verification)
    {
      title: "Water line pressure test - Dock B",
      description: "Quarterly pressure test on all Dock B water connections",
      status: "completed",
      type: "preventive",
      priority: "normal",
      dockId: dockMap["B"],
      assetId: firstAsset("water_connection", "B"),
      scheduleId: null,
      assigneeId: mikeId,
      createdById: managerId,
      dueDate: daysAgo(1),
      startedAt: daysAgo(3),
      completedAt: daysAgo(1),
      verifiedAt: null,
      verifiedById: null,
      notes: "All connections tested, pressure within spec. One fitting showing minor wear - flagged for next quarter.",
      timeSpentMinutes: 120,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      title: "Dock cleat replacement - Dock C",
      description: "Cleat C-7 bent from storm damage, replaced with new marine-grade cleat",
      status: "completed",
      type: "corrective",
      priority: "high",
      dockId: dockMap["C"],
      assetId: firstAsset("cleat", "C"),
      scheduleId: null,
      assigneeId: sarahId,
      createdById: managerId,
      dueDate: daysAgo(2),
      startedAt: daysAgo(4),
      completedAt: daysAgo(2),
      verifiedAt: null,
      verifiedById: null,
      notes: "Old cleat removed, new 10-inch galvanized cleat installed. Torqued to spec.",
      timeSpentMinutes: 95,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(2),
    },
  ];

  woValues.push(...openWOs);

  const insertedWOs = await db.insert(workOrders).values(woValues).returning({
    id: workOrders.id,
    title: workOrders.title,
    status: workOrders.status,
    type: workOrders.type,
    assetId: workOrders.assetId,
    dockId: workOrders.dockId,
    createdAt: workOrders.createdAt,
  });
  console.log(`  Created ${insertedWOs.length} work orders (${insertedWOs.length - 10} historical + 10 open).\n`);

  // ── Work Order Parts & Cost Entries ─────────────────────────────────────

  console.log("Seeding work order parts and cost entries...");

  // Get completed/verified WOs for parts (~40%)
  const completedWOs = insertedWOs.filter(
    (wo) => wo.status === "completed" || wo.status === "verified"
  );

  const partsToInsert: {
    workOrderId: number;
    name: string;
    quantity: number;
    unitCost: number;
    notes: string | null;
  }[] = [];

  const costsToInsert: {
    workOrderId: number;
    category: string;
    description: string;
    amount: number;
    entryDate: Date;
    createdById: number;
  }[] = [];

  // Track electrical costs for current quarter to ensure over-budget
  let electricalCostsQ1 = 0;
  const q1Start = utc(2026, 1, 1);

  for (let i = 0; i < completedWOs.length; i++) {
    // ~40% get parts
    if (i % 5 >= 2) continue; // ~40% (indices 0,1 of every 5)

    const wo = completedWOs[i];
    const woAssetType = wo.assetId
      ? insertedAssets.find((a) => a.id === wo.assetId)?.assetType || "other"
      : "other";
    const category = ASSET_TYPE_TO_CATEGORY[woAssetType] || "general";

    // Bias toward electrical parts for electrical WOs
    const relevantParts = PARTS_CATALOG.filter((p) =>
      p.categories.includes(category) || (category === "electrical" && p.categories.includes("electrical"))
    );
    const fallbackParts = PARTS_CATALOG;
    const partsPool = relevantParts.length > 0 ? relevantParts : fallbackParts;

    const numParts = randInt(1, 3);
    for (let p = 0; p < numParts; p++) {
      const part = pick(partsPool);
      const qty = randInt(1, 2);
      const unitCost = randInt(part.minCost, part.maxCost);
      const totalCost = unitCost * qty;

      partsToInsert.push({
        workOrderId: wo.id,
        name: part.name,
        quantity: qty,
        unitCost,
        notes: null,
      });

      const entryDate = wo.createdAt instanceof Date ? wo.createdAt : new Date(wo.createdAt);

      costsToInsert.push({
        workOrderId: wo.id,
        category,
        description: `${part.name} x${qty} for WO #${wo.id}`,
        amount: totalCost,
        entryDate,
        createdById: managerId,
      });

      if (category === "electrical" && entryDate >= q1Start) {
        electricalCostsQ1 += totalCost;
      }
    }
  }

  // Ensure electrical costs exceed quarterly budget ($3,750 = 375000 cents)
  // Add extra electrical cost entries if needed
  const electricalBudgetQuarterly = 375000; // $3,750 in cents
  const targetElectricalCost = 550000; // ~$5,500 in cents
  while (electricalCostsQ1 < targetElectricalCost) {
    // Find a completed electrical WO in Q1
    const elecWO = completedWOs.find((wo) => {
      const d = wo.createdAt instanceof Date ? wo.createdAt : new Date(wo.createdAt);
      return d >= q1Start;
    });
    if (!elecWO) break;

    const part = pick(PARTS_CATALOG.filter((p) => p.categories.includes("electrical")));
    const qty = randInt(1, 3);
    const unitCost = randInt(part.minCost, part.maxCost);
    const totalCost = unitCost * qty;

    partsToInsert.push({
      workOrderId: elecWO.id,
      name: part.name,
      quantity: qty,
      unitCost,
      notes: null,
    });

    costsToInsert.push({
      workOrderId: elecWO.id,
      category: "electrical",
      description: `${part.name} x${qty} for WO #${elecWO.id}`,
      amount: totalCost,
      entryDate: elecWO.createdAt instanceof Date ? elecWO.createdAt : new Date(elecWO.createdAt),
      createdById: managerId,
    });

    electricalCostsQ1 += totalCost;
  }

  if (partsToInsert.length > 0) {
    await db.insert(workOrderParts).values(partsToInsert);
  }
  if (costsToInsert.length > 0) {
    await db.insert(costEntries).values(costsToInsert);
  }
  console.log(`  Created ${partsToInsert.length} work order parts.`);
  console.log(`  Created ${costsToInsert.length} cost entries.`);
  console.log(`  Electrical costs Q1 2026: $${(electricalCostsQ1 / 100).toFixed(2)} (budget: $${(electricalBudgetQuarterly / 100).toFixed(2)})\n`);

  // ── Audit Logs ──────────────────────────────────────────────────────────

  console.log("Seeding audit logs...");

  const auditValues: {
    action: string;
    entityType: string;
    entityId: number | null;
    userId: number;
    metadata: unknown;
    createdAt: Date;
  }[] = [];

  // WO created logs
  for (const wo of insertedWOs.slice(0, 30)) {
    auditValues.push({
      action: "created",
      entityType: "work_order",
      entityId: wo.id,
      userId: managerId,
      metadata: { title: wo.title, type: wo.type },
      createdAt: wo.createdAt instanceof Date ? wo.createdAt : new Date(wo.createdAt),
    });
  }

  // WO status changes
  const statusTransitions = ["assigned", "in_progress", "completed", "verified"];
  for (const wo of completedWOs.slice(0, 20)) {
    for (let t = 0; t < statusTransitions.length - 1; t++) {
      const transDate = wo.createdAt instanceof Date ? wo.createdAt : new Date(wo.createdAt);
      auditValues.push({
        action: "status_changed",
        entityType: "work_order",
        entityId: wo.id,
        userId: t < 2 ? mikeId : managerId,
        metadata: {
          previousStatus: t === 0 ? "created" : statusTransitions[t - 1],
          newStatus: statusTransitions[t],
        },
        createdAt: addDays(transDate, t + 1),
      });
    }
  }

  // Schedule created logs
  for (const sched of insertedSchedules.slice(0, 10)) {
    auditValues.push({
      action: "created",
      entityType: "maintenance_schedule",
      entityId: sched.id,
      userId: managerId,
      metadata: { name: sched.name },
      createdAt: monthsAgo(6),
    });
  }

  // Asset condition updated logs
  for (const asset of insertedAssets.filter((a) => a.assetType === "piling" || a.assetType === "electrical_pedestal").slice(0, 8)) {
    auditValues.push({
      action: "condition_updated",
      entityType: "asset",
      entityId: asset.id,
      userId: inspectorId,
      metadata: { previousRating: 3, newRating: 2, reason: "Wear observed during inspection" },
      createdAt: daysAgo(randInt(5, 60)),
    });
  }

  if (auditValues.length > 0) {
    await db.insert(auditLogs).values(auditValues);
  }
  console.log(`  Created ${auditValues.length} audit logs.\n`);

  // ── Summary ─────────────────────────────────────────────────────────────

  console.log("=== Seed Summary ===");
  console.log(`  Users: ${insertedUsers.length}`);
  console.log(`  Docks: ${insertedDocks.length}`);
  console.log(`  Slips: ${insertedSlips.length}`);
  console.log(`  Assets: ${insertedAssets.length}`);
  console.log(`  Maintenance Schedules: ${insertedSchedules.length}`);
  console.log(`  Work Orders: ${insertedWOs.length}`);
  console.log(`  Work Order Parts: ${partsToInsert.length}`);
  console.log(`  Cost Entries: ${costsToInsert.length}`);
  console.log(`  Audit Logs: ${auditValues.length}`);
}

seed()
  .then(() => {
    console.log("\nSeed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
