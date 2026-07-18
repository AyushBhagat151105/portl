import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the .env file from apps/server/.env
config({ path: resolve(__dirname, "../../../apps/server/.env") });

// Dynamically import prisma & auth to prevent hoisting Zod env validation errors
const { default: prisma } = await import("../src/index");

const authPath = "../../auth/src/index";
const { auth } = await import(authPath);

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // ----------------------------------------------------
  // 1. CLEAN UP PREVIOUS SEED DATA (Reverse Dependency Order)
  // ----------------------------------------------------
  console.log("🧹 Clearing old data...");
  
  await prisma.pollVote.deleteMany({});
  await prisma.visitor.deleteMany({});
  await prisma.amenityBooking.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.pushToken.deleteMany({});
  await prisma.notificationJob.deleteMany({});
  await prisma.maintenanceDue.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.festival.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.vehicle.deleteMany({});
  
  // Clear flat relation mappings
  await prisma.flat.updateMany({
    data: { ownerId: null },
  });
  
  await prisma.flat.deleteMany({});
  await prisma.tower.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.staffProvider.deleteMany({});

  // Auth & Org data
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("✅ Data cleared successfully.");

  // ----------------------------------------------------
  // 2. CREATE ORGANIZATION (SOCIETY)
  // ----------------------------------------------------
  const orgId = "society-id-123";
  const organization = await prisma.organization.create({
    data: {
      id: orgId,
      name: "Greenwood Heights",
      slug: "greenwood-heights",
      logo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop",
    },
  });
  console.log(`🏢 Created Organization: ${organization.name}`);

  // ----------------------------------------------------
  // 3. CREATE USERS & CREDS (Admin, Resident, Guard) via Better Auth API
  // ----------------------------------------------------
  console.log("👤 Creating user accounts via Better Auth sign-up API...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@portl.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Password123!";
  const adminName = process.env.SEED_ADMIN_NAME || "Jane Admin";

  const residentEmail = process.env.SEED_RESIDENT_EMAIL || "resident@portl.com";
  const residentPassword = process.env.SEED_RESIDENT_PASSWORD || "Password123!";
  const residentName = process.env.SEED_RESIDENT_NAME || "John Resident";

  const guardEmail = process.env.SEED_GUARD_EMAIL || "guard@portl.com";
  const guardPassword = process.env.SEED_GUARD_PASSWORD || "Password123!";
  const guardName = process.env.SEED_GUARD_NAME || "Guard Sam";

  // Create Admin
  const adminRes = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    },
  });
  const adminId = adminRes.user.id;

  await prisma.user.update({
    where: { id: adminId },
    data: {
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop",
    },
  });

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: adminId,
      role: "admin",
    },
  });

  // Create Resident
  const residentRes = await auth.api.signUpEmail({
    body: {
      email: residentEmail,
      password: residentPassword,
      name: residentName,
    },
  });
  const residentId = residentRes.user.id;

  await prisma.user.update({
    where: { id: residentId },
    data: {
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
      aadharNumber: "123456789012",
      aadharPublicId: "seed_aadhar_doc_public_id",
    },
  });

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: residentId,
      role: "resident",
    },
  });

  // Create Guard
  const guardRes = await auth.api.signUpEmail({
    body: {
      email: guardEmail,
      password: guardPassword,
      name: guardName,
    },
  });
  const guardId = guardRes.user.id;

  await prisma.user.update({
    where: { id: guardId },
    data: {
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop",
    },
  });

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: guardId,
      role: "guard",
    },
  });

  console.log("👤 Seeded Users: Admin, Resident, and Guard");

  // ----------------------------------------------------
  // 4. TOWERS & FLATS
  // ----------------------------------------------------
  const towerA = await prisma.tower.create({
    data: {
      name: "Tower A",
      organizationId: orgId,
    },
  });

  const towerB = await prisma.tower.create({
    data: {
      name: "Tower B",
      organizationId: orgId,
    },
  });

  // Flat 101 - Owner occupied by John Resident
  const flat101 = await prisma.flat.create({
    data: {
      number: "101",
      towerId: towerA.id,
      occupancyStatus: "OWNER_OCCUPIED",
      ownerId: residentId,
      memberCount: 3,
      vehicleMemberCount: 1,
      residents: { connect: { id: residentId } },
    },
  });

  // Flat 102 - Vacant
  const flat102 = await prisma.flat.create({
    data: {
      number: "102",
      towerId: towerA.id,
      occupancyStatus: "VACANT",
      memberCount: 0,
      vehicleMemberCount: 0,
    },
  });

  // Flat 201 - Rented
  const flat201 = await prisma.flat.create({
    data: {
      number: "201",
      towerId: towerB.id,
      occupancyStatus: "RENTED",
      memberCount: 2,
      vehicleMemberCount: 1,
    },
  });

  console.log("🏢 Seeded Towers: Tower A, Tower B & Flats: 101, 102, 201");

  // ----------------------------------------------------
  // 5. VEHICLES
  // ----------------------------------------------------
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plateNumber: "MH12AB1234",
      makeModel: "White Honda City",
      type: "CAR",
      ownerId: residentId,
      organizationId: orgId,
      flatId: flat101.id,
    },
  });
  console.log(`🚗 Seeded Vehicle: ${vehicle1.plateNumber}`);

  // ----------------------------------------------------
  // 6. BUDGETS (Total Allocated: ₹2,50,000)
  // ----------------------------------------------------
  const budgetYearly = await prisma.budget.create({
    data: {
      title: "Yearly Operations 2026",
      allocatedAmount: 150000,
      spentAmount: 0,
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  const budgetFestival = await prisma.budget.create({
    data: {
      title: "Navratri Festival Budget",
      allocatedAmount: 20000,
      spentAmount: 13500,
      startDate: new Date("2026-07-01T00:00:00Z"),
      endDate: new Date("2026-07-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  const budgetRepairs = await prisma.budget.create({
    data: {
      title: "Emergency Repairs Budget",
      allocatedAmount: 80000,
      spentAmount: 188600,
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  console.log("💰 Seeded Budgets: Yearly Operations, Navratri, Emergency Repairs");

  // ----------------------------------------------------
  // 7. EXPENSES (Total Outflow: ₹3,02,100)
  // ----------------------------------------------------
  // Expense 1: ₹13,500 (Festival)
  await prisma.expense.create({
    data: {
      title: "Navratri Caterers & Stage",
      amount: 13500,
      category: "FESTIVAL",
      description: "Sound setup, catering, and decor props",
      date: new Date("2026-07-15T18:00:00Z"),
      budgetId: budgetFestival.id,
      organizationId: orgId,
    },
  });

  // Expense 2: ₹1,00,000 (Repairs)
  await prisma.expense.create({
    data: {
      title: "Lift A Main Motherboard Replacement",
      amount: 100000,
      category: "REPAIRS",
      description: "Replaced faulty control motherboard panel",
      date: new Date("2026-07-16T10:00:00Z"),
      budgetId: budgetRepairs.id,
      organizationId: orgId,
    },
  });

  // Expense 3: ₹88,600 (Repairs)
  await prisma.expense.create({
    data: {
      title: "Security Main DVR & Access Gates",
      amount: 88600,
      category: "REPAIRS",
      description: "Upgraded card readers and security camera storage DVR",
      date: new Date("2026-07-17T11:30:00Z"),
      budgetId: budgetRepairs.id,
      organizationId: orgId,
    },
  });

  // Expense 4: ₹1,00,000 (Utilities)
  await prisma.expense.create({
    data: {
      title: "Semi-Annual Tank Cleaning Fee",
      amount: 100000,
      category: "UTILITIES",
      description: "Cleaned and sanitized underground reservoirs A & B",
      date: new Date("2026-07-18T09:00:00Z"),
      budgetId: budgetYearly.id,
      organizationId: orgId,
    },
  });

  console.log("💸 Seeded Expenses: Navratri, Lift A, Security DVR, Tank Cleaning");

  // ----------------------------------------------------
  // 8. FESTIVAL PLANS
  // ----------------------------------------------------
  await prisma.festival.create({
    data: {
      name: "Navratri Celebration 2026",
      description: "Nine nights of Dandiya Raas, Garba, and traditional food at the main lawn.",
      date: new Date("2026-10-10T19:00:00Z"),
      budgetId: budgetFestival.id,
      organizationId: orgId,
    },
  });
  console.log("🎉 Seeded Festival Plan: Navratri Celebration");

  // ----------------------------------------------------
  // 9. MAINTENANCE DUES (Total Collected Income: ₹17,600)
  // ----------------------------------------------------
  // Paid Dues: ₹5,000 (June) + ₹5,000 (July) + ₹2,600 (Sept) + ₹5,000 (Other Paid Flat due) = ₹17,600
  await prisma.maintenanceDue.create({
    data: {
      flatId: flat101.id,
      amount: 5000,
      dueDate: new Date("2026-06-10T00:00:00Z"),
      month: "June 2026",
      status: "PAID",
      paidAt: new Date("2026-06-08T12:00:00Z"),
      organizationId: orgId,
    },
  });

  await prisma.maintenanceDue.create({
    data: {
      flatId: flat101.id,
      amount: 5000,
      dueDate: new Date("2026-07-10T00:00:00Z"),
      month: "July 2026",
      status: "PAID",
      paidAt: new Date("2026-07-07T15:00:00Z"),
      organizationId: orgId,
    },
  });

  await prisma.maintenanceDue.create({
    data: {
      flatId: flat101.id,
      amount: 2600,
      dueDate: new Date("2026-09-10T00:00:00Z"),
      month: "September 2026",
      status: "PAID",
      paidAt: new Date("2026-07-18T10:00:00Z"),
      organizationId: orgId,
    },
  });

  await prisma.maintenanceDue.create({
    data: {
      flatId: flat201.id,
      amount: 5000,
      dueDate: new Date("2026-06-10T00:00:00Z"),
      month: "June 2026",
      status: "PAID",
      paidAt: new Date("2026-06-09T16:00:00Z"),
      organizationId: orgId,
    },
  });

  // Pending Dues: Total receivables = ₹10,000 (Flat 101 August + Flat 102 July)
  await prisma.maintenanceDue.create({
    data: {
      flatId: flat101.id,
      amount: 5000,
      dueDate: new Date("2026-08-10T00:00:00Z"),
      month: "August 2026",
      status: "PENDING",
      organizationId: orgId,
    },
  });

  await prisma.maintenanceDue.create({
    data: {
      flatId: flat102.id,
      amount: 5000,
      dueDate: new Date("2026-07-10T00:00:00Z"),
      month: "July 2026",
      status: "PENDING",
      organizationId: orgId,
    },
  });

  console.log("💰 Seeded Dues: ₹17,600 Paid, ₹10,000 Outstanding Receivables");

  // ----------------------------------------------------
  // 10. NOTICES
  // ----------------------------------------------------
  await prisma.notice.create({
    data: {
      title: "Annual General Body Meeting",
      content: "The annual general body meeting of Greenwood Heights is scheduled for July 30th, 2026 at the clubhouse. Attendance is highly requested.",
      authorId: adminId,
      organizationId: orgId,
    },
  });

  await prisma.notice.create({
    data: {
      title: "Water Tank Cleaning Notice",
      content: "Water supply will be suspended on Tuesday between 10:00 AM and 2:00 PM for underground reservoir sanitation. Please store water in advance.",
      authorId: adminId,
      organizationId: orgId,
    },
  });
  console.log("📢 Seeded Notice Broadcasts");

  // ----------------------------------------------------
  // 11. POLLS & VOTES
  // ----------------------------------------------------
  const poll = await prisma.poll.create({
    data: {
      question: "Upgrade gym equipment?",
      options: ["Yes, increase budget", "No, delay to next year", "Maintain current setup"],
      status: "ACTIVE",
      organizationId: orgId,
    },
  });

  // Add resident vote
  await prisma.pollVote.create({
    data: {
      pollId: poll.id,
      userId: residentId,
      optionIndex: 0, // Voted Yes
    },
  });

  console.log("🗳️ Seeded Community Polls & Resident Votes");

  // ----------------------------------------------------
  // 12. HELPDESK COMPLAINTS
  // ----------------------------------------------------
  await prisma.complaint.create({
    data: {
      title: "Leaking pipe in basement",
      description: "Water is constantly leaking from the main inlet pipe in Block A basement near the elevator shaft. Needs urgent plumber attention.",
      category: "PLUMBING",
      status: "PENDING",
      raisedById: residentId,
      flatId: flat101.id,
      organizationId: orgId,
    },
  });
  console.log("🛠️ Seeded Resident Helpdesk Tickets");

  console.log("🌱 Database Seeding Completed Successfully! 🚀");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
