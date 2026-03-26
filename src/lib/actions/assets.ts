"use server";

import { z } from "zod/v4";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { logAudit } from "./audit";

const assetSchema = z.object({
  name: z.string().min(1).max(255),
  assetType: z.enum([
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
  ]),
  dockId: z.coerce.number().int().positive(),
  location: z.string().min(1),
  installDate: z.string().optional().default(""),
  warrantyExpiry: z.string().optional().default(""),
  conditionRating: z.coerce.number().int().min(1).max(5).default(3),
  notes: z.string().optional().default(""),
});

export async function createAsset(
  _prevState: { error?: string; success?: boolean; id?: number } | null,
  formData: FormData
) {
  const session = await requireRole(["manager"]);

  const parsed = assetSchema.safeParse({
    name: formData.get("name"),
    assetType: formData.get("assetType"),
    dockId: formData.get("dockId"),
    location: formData.get("location"),
    installDate: formData.get("installDate"),
    warrantyExpiry: formData.get("warrantyExpiry"),
    conditionRating: formData.get("conditionRating"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  const data = parsed.data;

  const [inserted] = await db
    .insert(assets)
    .values({
      name: data.name,
      assetType: data.assetType,
      dockId: data.dockId,
      location: data.location,
      installDate: data.installDate ? new Date(data.installDate) : null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      conditionRating: data.conditionRating,
      notes: data.notes || null,
    })
    .returning({ id: assets.id });

  await logAudit({
    userId: session.userId,
    action: "create",
    entityType: "asset",
    entityId: inserted.id,
  });

  revalidatePath("/assets");
  return { success: true, id: inserted.id };
}

export async function updateAsset(
  id: number,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const session = await requireRole(["manager"]);

  const parsed = assetSchema.safeParse({
    name: formData.get("name"),
    assetType: formData.get("assetType"),
    dockId: formData.get("dockId"),
    location: formData.get("location"),
    installDate: formData.get("installDate"),
    warrantyExpiry: formData.get("warrantyExpiry"),
    conditionRating: formData.get("conditionRating"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  const data = parsed.data;

  await db
    .update(assets)
    .set({
      name: data.name,
      assetType: data.assetType,
      dockId: data.dockId,
      location: data.location,
      installDate: data.installDate ? new Date(data.installDate) : null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      conditionRating: data.conditionRating,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  await logAudit({
    userId: session.userId,
    action: "update",
    entityType: "asset",
    entityId: id,
  });

  revalidatePath("/assets");
  return { success: true };
}

export async function deactivateAsset(id: number) {
  const session = await requireRole(["manager"]);

  await db
    .update(assets)
    .set({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  await logAudit({
    userId: session.userId,
    action: "deactivate",
    entityType: "asset",
    entityId: id,
  });

  revalidatePath("/assets");
  return { success: true };
}

export async function updateConditionRating(assetId: number, rating: number) {
  const session = await requireRole(["manager", "crew"]);

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be an integer between 1 and 5" };
  }

  const [existing] = await db
    .select({ conditionRating: assets.conditionRating })
    .from(assets)
    .where(eq(assets.id, assetId))
    .limit(1);

  if (!existing) {
    return { error: "Asset not found" };
  }

  await db
    .update(assets)
    .set({
      conditionRating: rating,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, assetId));

  await logAudit({
    userId: session.userId,
    action: "update_condition",
    entityType: "asset",
    entityId: assetId,
    metadata: { oldRating: existing.conditionRating, newRating: rating },
  });

  revalidatePath("/assets");
  return { success: true };
}
