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
  
  await prisma.fixedDeposit.deleteMany({});
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
  // 4. TOWERS (BLOCKS & SHOPS) & FLATS
  // ----------------------------------------------------
  console.log("🏢 Seeding Blocks and Shops Towers...");

  // Mapped exactly to Page 2 of the Radhekrishan Park Audit statement
  const blockData = [
    { name: "Block B", collection: 118000 },
    { name: "Block C", collection: 123100 },
    { name: "Block D", collection: 126600 },
    { name: "Block E", collection: 127600 },
    { name: "Block F", collection: 118100 },
    { name: "Block G", collection: 123600 },
    { name: "Block H", collection: 108200 },
    { name: "Block I", collection: 129300 },
    { name: "Block J", collection: 153300 },
    { name: "Shops A1", collection: 94800 },
    { name: "Shops A2", collection: 18900 },
    { name: "Shops BC", collection: 29900 },
    { name: "Shops D", collection: 10700 },
    { name: "Shops EF", collection: 22100 },
    { name: "Shops GH", collection: 17650 },
    { name: "General Maintenance", collection: 45600 },
  ];

  // We also create a special tower to represent opening balance reserves
  const openingTower = await prisma.tower.create({
    data: {
      name: "General Ledger Reserves",
      organizationId: orgId,
    },
  });

  const openingFlat = await prisma.flat.create({
    data: {
      number: "Opening Balance",
      towerId: openingTower.id,
      occupancyStatus: "VACANT",
      memberCount: 0,
      vehicleMemberCount: 0,
    },
  });

  // Flat variables for resident and vehicle mapping
  let blockEFlat101: any = null;

  for (const block of blockData) {
    const tower = await prisma.tower.create({
      data: {
        name: block.name,
        organizationId: orgId,
      },
    });

    // Create Flat 101 inside each Block/Shop
    const flat = await prisma.flat.create({
      data: {
        number: "101",
        towerId: tower.id,
        occupancyStatus: block.name.startsWith("Block") ? "OWNER_OCCUPIED" : "RENTED",
        memberCount: 2,
        vehicleMemberCount: 1,
        // Connect the resident user specifically to Block E Flat 101 to match Bharatbhai Bhagat E-Block logs
        ...(block.name === "Block E"
          ? {
              ownerId: residentId,
              residents: { connect: { id: residentId } },
            }
          : {}),
      },
    });

    if (block.name === "Block E") {
      blockEFlat101 = flat;
    }

    // Seed the paid maintenance collection matching the audit sheet total for this Block/Shop
    await prisma.maintenanceDue.create({
      data: {
        flatId: flat.id,
        amount: block.collection,
        dueDate: new Date("2026-03-31T23:59:59Z"),
        month: "FY 2025-2026 Dues",
        status: "PAID",
        paidAt: new Date("2026-03-15T12:00:00Z"),
        organizationId: orgId,
      },
    });
  }

  // Seed the Opening Cash & Bank reserves (from Page 1: ₹10,45,966)
  await prisma.maintenanceDue.create({
    data: {
      flatId: openingFlat.id,
      amount: 1045966,
      dueDate: new Date("2025-04-01T00:00:00Z"),
      month: "Opening Balance April 2025",
      status: "PAID",
      paidAt: new Date("2025-04-01T09:00:00Z"),
      organizationId: orgId,
    },
  });

  // Seed some pending dues to show outstanding receivables (Total ₹10,000 to match dashboard receivables target)
  if (blockEFlat101) {
    await prisma.maintenanceDue.create({
      data: {
        flatId: blockEFlat101.id,
        amount: 10000,
        dueDate: new Date("2026-08-10T00:00:00Z"),
        month: "August 2026 Dues",
        status: "PENDING",
        organizationId: orgId,
      },
    });
  }

  console.log("🏢 Mapped Blocks, Shops, and Collections matching Radhekrishan Park Audit logs.");

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
      flatId: blockEFlat101?.id || "unknown",
    },
  });
  console.log(`🚗 Seeded Vehicle: ${vehicle1.plateNumber}`);

  // ----------------------------------------------------
  // 6. FIXED DEPOSITS (FDs - Page 3: ₹7,00,000 at KDCC Bank)
  // ----------------------------------------------------
  console.log("🏦 Seeding Fixed Deposit Capital Reserves...");
  const fd1 = await prisma.fixedDeposit.create({
    data: {
      bankName: "KDCC Bank Mahemdavad",
      amount: 700000,
      interestRate: 7.5,
      startDate: new Date("2025-04-08T10:00:00Z"),
      status: "ACTIVE",
      organizationId: orgId,
    },
  });
  console.log(`🏦 Seeded Fixed Deposit: ₹${fd1.amount} at ${fd1.bankName}`);

  // ----------------------------------------------------
  // 7. BUDGETS (Total Allocated matching society limits)
  // ----------------------------------------------------
  const budgetYearly = await prisma.budget.create({
    data: {
      title: "Annual Operations Budget",
      allocatedAmount: 1800000,
      spentAmount: 0,
      startDate: new Date("2025-04-01T00:00:00Z"),
      endDate: new Date("2026-03-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  const budgetFestival = await prisma.budget.create({
    data: {
      title: "Festival & Navratri Fund",
      allocatedAmount: 100000,
      spentAmount: 0,
      startDate: new Date("2025-04-01T00:00:00Z"),
      endDate: new Date("2026-03-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  const budgetRepairs = await prisma.budget.create({
    data: {
      title: "Emergency Capital Reserves",
      allocatedAmount: 300000,
      spentAmount: 0,
      startDate: new Date("2025-04-01T00:00:00Z"),
      endDate: new Date("2026-03-31T23:59:59Z"),
      organizationId: orgId,
    },
  });

  console.log("💰 Seeded Budgets: Annual Operations, Festival Fund, Emergency Reserves");

  // ----------------------------------------------------
  // 8. OPERATING EXPENDITURES (Page 4: Total Outflow ₹16,07,693)
  // ----------------------------------------------------
  console.log("💸 Seeding itemized operating expenses matching Page 4...");

  const expensesData = [
    { title: "Watchman Salaries & Cleaning Services", amount: 413700, category: "SALARIES", budgetId: budgetYearly.id },
    { title: "Gardening & Horticulture maintenance", amount: 47130, category: "MAINTENANCE", budgetId: budgetYearly.id },
    { title: "Miscellaneous administrative office expenses", amount: 10905, category: "OTHERS", budgetId: budgetYearly.id },
    { title: "Structural Renovation & Plaster repairs", amount: 164865, category: "REPAIRS", budgetId: budgetRepairs.id },
    { title: "Common Area Electricity Utilities charges", amount: 889392, category: "UTILITIES", budgetId: budgetYearly.id },
    { title: "Stationery ledger book printing & xerox costs", amount: 6575, category: "OTHERS", budgetId: budgetYearly.id },
    { title: "Electrical Wiring & Phase Panel maintenance", amount: 19337, category: "REPAIRS", budgetId: budgetYearly.id },
    { title: "Office Wooden Furniture repairs & chairs", amount: 28600, category: "OTHERS", budgetId: budgetYearly.id },
    { title: "KDCC bank account administration fees", amount: 89, category: "UTILITIES", budgetId: budgetYearly.id },
    { title: "Water Supply Pump Motor rewinding repairs", amount: 27200, category: "REPAIRS", budgetId: budgetRepairs.id },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({
      data: {
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        description: `Logged for society audit registry under ${exp.category}`,
        date: new Date("2026-01-15T10:00:00Z"),
        budgetId: exp.budgetId,
        organizationId: orgId,
      },
    });
  }

  console.log("💸 Seeded Expenses totaling exactly ₹16,07,693");

  // ----------------------------------------------------
  // 9. FESTIVAL PLANS
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
      flatId: blockEFlat101?.id || null,
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
