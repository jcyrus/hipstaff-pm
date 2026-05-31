import "dotenv/config";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findFirst({
    where: { role: UserRole.superadmin },
    select: { email: true },
  });

  if (existing) {
    console.log(`\n✓ A superadmin already exists (${existing.email}). Nothing to do.\n`);
    return;
  }

  console.log("\n── HipStaff PM – First Superadmin Setup ──\n");

  const rl = readline.createInterface({ input, output });

  const email = (await rl.question("Email:    ")).trim();
  const username = (await rl.question("Username: ")).trim();
  const password = (await rl.question("Password: ")).trim();

  rl.close();

  if (!email || !username || !password) {
    console.error("\n✗ All fields are required.\n");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\n✗ Password must be at least 8 characters.\n");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      role: UserRole.superadmin,
      isActive: true,
    },
    select: { id: true, email: true, username: true, role: true },
  });

  console.log(`\n✓ Superadmin created:`);
  console.log(`  id:       ${user.id}`);
  console.log(`  email:    ${user.email}`);
  console.log(`  username: ${user.username}`);
  console.log(`  role:     ${user.role}`);
  console.log(`\nYou can now sign in at /login\n`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
