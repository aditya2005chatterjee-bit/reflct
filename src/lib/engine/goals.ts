export interface GoalProjection {
    requiredMonthlyInvestment: number;
    projectedYears: number;
    goalProgressPercent: number;
    projectedFutureValue: number;
    savingsReadinessPercent: number;
  }
  
  export function computeGoalProjection(
    monthlyIncome: number,
    monthlyExpenses: number,
    goalAmount: number,
    goalYears: number,
    expectedReturn: number
  ): GoalProjection {
    const monthlySaving = monthlyIncome - monthlyExpenses;
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = goalYears * 12;
  
    let requiredMonthlyInvestment = 0;
  
    if (monthlyRate > 0 && totalMonths > 0) {
      requiredMonthlyInvestment =
        (goalAmount * monthlyRate) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  
    let projectedFutureValue = 0;
  
    if (monthlySaving > 0 && monthlyRate > 0 && totalMonths > 0) {
      projectedFutureValue =
        monthlySaving *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }
  
    let projectedMonthsToGoal = 0;
  
    if (monthlySaving > 0 && monthlyRate > 0) {
      projectedMonthsToGoal =
        Math.log(1 + (goalAmount * monthlyRate) / monthlySaving) /
        Math.log(1 + monthlyRate);
    }
  
    const projectedYears = projectedMonthsToGoal / 12;
  
    const goalProgressPercent =
      goalAmount > 0
        ? Math.min(100, (projectedFutureValue / goalAmount) * 100)
        : 0;
  
    const savingsReadinessPercent =
      requiredMonthlyInvestment > 0
        ? Math.min(100, (monthlySaving / requiredMonthlyInvestment) * 100)
        : 0;
  
    return {
      requiredMonthlyInvestment,
      projectedYears,
      goalProgressPercent,
      projectedFutureValue,
      savingsReadinessPercent,
    };
  }