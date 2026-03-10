import { LoggedPurchase } from "@/lib/engine/financial";

export interface ComputedBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  totalActiveEMI: number;
}

export function computeBaseline(
  monthlyIncome: number,
  monthlyExpenses: number,
  currentSavings: number,
  purchases: LoggedPurchase[]
): ComputedBaseline {
  const { totalActiveEMI, oneTimeSpendingThisMonth } =
    computePurchaseImpactForMonth(purchases);

  const adjustedExpenses =
    monthlyExpenses + totalActiveEMI + oneTimeSpendingThisMonth;

  return {
    monthlyIncome,
    monthlyExpenses: adjustedExpenses,
    currentSavings,
    totalActiveEMI,
  };
}

function computePurchaseImpactForMonth(
  purchases: LoggedPurchase[]
): { totalActiveEMI: number; oneTimeSpendingThisMonth: number } {
  const now = new Date();

  let totalActiveEMI = 0;
  let oneTimeSpendingThisMonth = 0;

  for (const purchase of purchases) {
    const start = new Date(purchase.startDate);

    // EMI logic
    if (purchase.isEMI) {
      const monthsPassed =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());

      if (monthsPassed < purchase.emiMonths) {
        totalActiveEMI += purchase.monthlyEMI;
      }
    } else {
      // One-time purchase logic (only count if in current month)
      const sameMonth =
        start.getFullYear() === now.getFullYear() &&
        start.getMonth() === now.getMonth();

      if (sameMonth) {
        oneTimeSpendingThisMonth += purchase.price;
      }
    }
  }

  return {
    totalActiveEMI,
    oneTimeSpendingThisMonth,
  };
}
