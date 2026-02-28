export interface FinancialBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
}

export interface FinancialSnapshot {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  stabilityScore: number;
  date: string;
}

export interface StabilityBreakdown {
  emergencyScore: number;
  savingsScore: number;
  expenseScore: number;
}

export interface StabilityResult {
  savingsRate: number;
  emergencyMonths: number;
  stabilityScore: number;
  stabilityLevel: string;
  breakdown: StabilityBreakdown;
}

export interface PurchaseInput {
  itemPrice: number;
  isEMI: boolean;
  emiMonths: number;
  interestRate: number;
}

export interface PurchaseImpact {
  newSavings: number;
  newEmergencyMonths: number;
  newStabilityScore: number;
  stabilityDrop: number;
  goalDelayMonths: number;
  opportunityCost10Years: number;
  freedomCostMonths: number;
  freedomCostDays: number;
  safetyReductionPercent: number;
  monthlyEMI: number;
  newBreakdown: StabilityBreakdown;
}

export interface LoggedPurchase {
  id: string;
  name: string;
  price: number;
  isEMI: boolean;
  emiMonths: number;
  interestRate: number;
  monthlyEMI: number;
  startDate: string; // ISO string
}

export type ImpactSeverity = "none" | "minor" | "moderate" | "major";

export function getImpactSeverity(impact: PurchaseImpact): ImpactSeverity {
  if (impact.stabilityDrop <= 0) return "none";
  if (impact.stabilityDrop <= 2 && impact.freedomCostMonths <= 0.5) return "minor";
  if (impact.stabilityDrop <= 5 && impact.freedomCostMonths <= 2) return "moderate";
  return "major";
}

export function calculateStability(baseline: FinancialBaseline): StabilityResult {
  const { monthlyIncome, monthlyExpenses, currentSavings } = baseline;

  if (monthlyIncome <= 0) {
    return { savingsRate: 0, emergencyMonths: 0, stabilityScore: 0, stabilityLevel: "Exposed", breakdown: { emergencyScore: 0, savingsScore: 0, expenseScore: 0 } };
  }

  const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
  const emergencyMonths = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
  const expenseRatio = monthlyExpenses / monthlyIncome;

  const emergencyScore = Math.min((emergencyMonths / 6) * 33, 33);
  const savingsScore = Math.min((savingsRate / 0.35) * 33, 33);
  const expenseScore = Math.min(((1 - expenseRatio) / 0.5) * 33, 33);

  const stabilityScore = Math.max(0, Math.min(100, emergencyScore + savingsScore + expenseScore));

  let stabilityLevel: string;
  if (stabilityScore <= 35) stabilityLevel = "Exposed";
  else if (stabilityScore <= 65) stabilityLevel = "Fragile";
  else if (stabilityScore <= 85) stabilityLevel = "Stable";
  else stabilityLevel = "Strong";

  return {
    savingsRate: Math.max(0, savingsRate),
    emergencyMonths: Math.max(0, emergencyMonths),
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    stabilityLevel,
    breakdown: {
      emergencyScore: Math.round(emergencyScore * 10) / 10,
      savingsScore: Math.round(savingsScore * 10) / 10,
      expenseScore: Math.round(expenseScore * 10) / 10,
    },
  };
}

export function getScoreColor(score: number): string {
  if (score <= 35) return "score-red";
  if (score <= 65) return "score-orange";
  if (score <= 85) return "score-blue";
  return "score-green";
}

export function getScoreTailwindColor(score: number): string {
  if (score <= 35) return "text-score-red";
  if (score <= 65) return "text-score-orange";
  if (score <= 85) return "text-score-blue";
  return "text-score-green";
}

export function getScoreBgColor(score: number): string {
  if (score <= 35) return "bg-score-red";
  if (score <= 65) return "bg-score-orange";
  if (score <= 85) return "bg-score-blue";
  return "bg-score-green";
}

export function calculatePurchaseImpact(
  baseline: FinancialBaseline,
  purchase: PurchaseInput
): PurchaseImpact {
  const { monthlyIncome, monthlyExpenses, currentSavings } = baseline;
  const { itemPrice, isEMI, emiMonths, interestRate } = purchase;

  let newSavings: number;
  let monthlyEMI = 0;
  let newMonthlyExpenses = monthlyExpenses;

  if (isEMI && emiMonths > 0) {
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate > 0) {
      monthlyEMI = (itemPrice * monthlyRate * Math.pow(1 + monthlyRate, emiMonths)) /
        (Math.pow(1 + monthlyRate, emiMonths) - 1);
    } else {
      monthlyEMI = itemPrice / emiMonths;
    }
    newSavings = currentSavings;
    newMonthlyExpenses = monthlyExpenses + monthlyEMI;
  } else {
    newSavings = currentSavings - itemPrice;
    monthlyEMI = 0;
  }

  const newEmergencyMonths = newMonthlyExpenses > 0 ? Math.max(0, newSavings) / newMonthlyExpenses : 0;
  const oldResult = calculateStability(baseline);
  const newResult = calculateStability({
    monthlyIncome,
    monthlyExpenses: newMonthlyExpenses,
    currentSavings: Math.max(0, newSavings),
  });

  // Goal delay: how many extra months to recover the purchase amount at 8% annual
  const monthlyReturnRate = 0.08 / 12;
  const monthlySaving = monthlyIncome - newMonthlyExpenses;
  let goalDelayMonths = 0;
  if (monthlySaving > 0 && monthlyReturnRate > 0) {
    goalDelayMonths = Math.log(1 + (itemPrice * monthlyReturnRate) / monthlySaving) / Math.log(1 + monthlyReturnRate);
  }

  // Opportunity cost over 10 years at 8% annual
  const opportunityCost10Years = itemPrice * Math.pow(1.08, 10) - itemPrice;

  const freedomCostMonths = oldResult.emergencyMonths - newEmergencyMonths;
  const safetyReductionPercent = oldResult.emergencyMonths > 0
    ? (freedomCostMonths / oldResult.emergencyMonths) * 100
    : 0;

  return {
    newSavings: Math.max(0, newSavings),
    newEmergencyMonths: Math.max(0, newEmergencyMonths),
    newStabilityScore: newResult.stabilityScore,
    stabilityDrop: Math.round((oldResult.stabilityScore - newResult.stabilityScore) * 10) / 10,
    goalDelayMonths: Math.round(goalDelayMonths * 10) / 10,
    opportunityCost10Years: Math.round(opportunityCost10Years),
    freedomCostMonths: Math.round(freedomCostMonths * 10) / 10,
    freedomCostDays: Math.round(freedomCostMonths * 30),
    safetyReductionPercent: Math.round(safetyReductionPercent * 10) / 10,
    monthlyEMI: Math.round(monthlyEMI),
    newBreakdown: newResult.breakdown,
  };
}

export function generateProjectionData(
  baseline: FinancialBaseline,
  purchaseImpact: PurchaseImpact | null,
  months: number = 60
) {
  const { monthlyIncome, monthlyExpenses, currentSavings } = baseline;
  const monthlySaving = monthlyIncome - monthlyExpenses;
  const monthlyReturnRate = 0.08 / 12;

  const data = [];
  let currentBalance = currentSavings;
  let purchaseBalance = purchaseImpact
    ? purchaseImpact.newSavings
    : currentSavings;

  const postPurchaseExpenses = purchaseImpact
    ? monthlyExpenses + purchaseImpact.monthlyEMI
    : monthlyExpenses;
  const postPurchaseSaving = monthlyIncome - postPurchaseExpenses;

  for (let i = 0; i <= months; i++) {
    data.push({
      month: i,
      label: i % 12 === 0 ? `Year ${i / 12}` : `M${i}`,
      current: Math.round(currentBalance),
      afterPurchase: purchaseImpact ? Math.round(purchaseBalance) : undefined,
    });

    currentBalance = currentBalance * (1 + monthlyReturnRate) + monthlySaving;
    if (purchaseImpact) {
      purchaseBalance = purchaseBalance * (1 + monthlyReturnRate) + postPurchaseSaving;
    }
  }

  return data;
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
