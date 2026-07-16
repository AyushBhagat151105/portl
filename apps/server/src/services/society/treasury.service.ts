import prisma from "@portl/db";

export class TreasuryService {
  // Budget Operations
  static async getBudgets(societyId: string) {
    return await prisma.budget.findMany({
      where: { organizationId: societyId },
      include: {
        expenses: true,
        festivals: true,
      },
      orderBy: { startDate: "desc" },
    });
  }

  static async createBudget(
    societyId: string,
    data: { title: string; allocatedAmount: number; startDate: Date; endDate: Date }
  ) {
    return await prisma.budget.create({
      data: {
        title: data.title,
        allocatedAmount: data.allocatedAmount,
        startDate: data.startDate,
        endDate: data.endDate,
        organizationId: societyId,
      },
    });
  }

  // Expense Operations
  static async getExpenses(societyId: string, category?: string) {
    return await prisma.expense.findMany({
      where: {
        organizationId: societyId,
        ...(category ? { category } : {}),
      },
      include: {
        budget: true,
      },
      orderBy: { date: "desc" },
    });
  }

  static async createExpense(
    societyId: string,
    data: {
      title: string;
      amount: number;
      category: string;
      description?: string | null;
      date: Date;
      budgetId?: string | null;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create expense
      const expense = await tx.expense.create({
        data: {
          title: data.title,
          amount: data.amount,
          category: data.category,
          description: data.description,
          date: data.date,
          budgetId: data.budgetId || null,
          organizationId: societyId,
        },
      });

      // Update associated budget spent amount if applicable
      if (data.budgetId) {
        const budget = await tx.budget.findUnique({
          where: { id: data.budgetId },
        });

        if (!budget) {
          throw new Error("Target budget not found");
        }

        await tx.budget.update({
          where: { id: data.budgetId },
          data: {
            spentAmount: {
              increment: data.amount,
            },
          },
        });
      }

      return expense;
    });
  }

  // Festival Operations
  static async getFestivals(societyId: string) {
    return await prisma.festival.findMany({
      where: { organizationId: societyId },
      include: {
        budget: {
          include: {
            expenses: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  static async createFestival(
    societyId: string,
    data: {
      name: string;
      description?: string | null;
      date: Date;
      allocatedBudget?: number;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      let budgetId: string | null = null;

      // If allocatedBudget is specified, auto-create a linked budget for the festival
      if (data.allocatedBudget && data.allocatedBudget > 0) {
        const budget = await tx.budget.create({
          data: {
            title: `${data.name} Budget`,
            allocatedAmount: data.allocatedBudget,
            startDate: data.date,
            endDate: data.date, // Single day event fallback
            organizationId: societyId,
          },
        });
        budgetId = budget.id;
      }

      // Create festival
      return await tx.festival.create({
        data: {
          name: data.name,
          description: data.description,
          date: data.date,
          budgetId,
          organizationId: societyId,
        },
        include: {
          budget: true,
        },
      });
    });
  }
}
