import prisma from "@portl/db";

export class FixedDepositService {
  static async getFixedDeposits(societyId: string) {
    return await prisma.fixedDeposit.findMany({
      where: { organizationId: societyId },
      orderBy: { startDate: "desc" },
    });
  }

  static async createFixedDeposit(
    societyId: string,
    data: {
      bankName: string;
      amount: number;
      interestRate?: number;
      startDate: string;
      maturityDate?: string;
    }
  ) {
    return await prisma.fixedDeposit.create({
      data: {
        bankName: data.bankName,
        amount: data.amount,
        interestRate: data.interestRate,
        startDate: new Date(data.startDate),
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,
        organizationId: societyId,
      },
    });
  }

  static async deleteFixedDeposit(societyId: string, id: string) {
    // Verify ownership before deleting
    const fd = await prisma.fixedDeposit.findFirst({
      where: { id, organizationId: societyId },
    });

    if (!fd) {
      throw new Error("Fixed deposit asset not found or access denied");
    }

    return await prisma.fixedDeposit.delete({
      where: { id },
    });
  }
}
