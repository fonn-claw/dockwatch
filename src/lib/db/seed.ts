import { db } from "./index";
import { users } from "./schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding demo users...");

  const passwordHash = await hash("demo1234", 10);

  await db
    .insert(users)
    .values([
      {
        name: "Harbor Manager",
        email: "manager@dockwatch.app",
        passwordHash,
        role: "manager",
      },
      {
        name: "Mike Chen",
        email: "crew@dockwatch.app",
        passwordHash,
        role: "crew",
      },
      {
        name: "Sarah Torres",
        email: "inspector@dockwatch.app",
        passwordHash,
        role: "inspector",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeded 3 demo users:");
  console.log("  - manager@dockwatch.app (manager)");
  console.log("  - crew@dockwatch.app (crew)");
  console.log("  - inspector@dockwatch.app (inspector)");
  console.log("  Password: demo1234");
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
