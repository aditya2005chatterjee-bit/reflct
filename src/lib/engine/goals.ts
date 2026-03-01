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
    expectedReturn: number,
    currentSaved: number
  ): GoalProjection {
    {
      const monthlySaving = monthlyIncome - monthlyExpenses;
      const monthlyRate = expectedReturn / 100 / 12;
      const totalMonths = goalYears * 12;
  
      let requiredMonthlyInvestment = 0;
  
      // Handle zero interest separately
      if (totalMonths > 0) {
        if (monthlyRate > 0) {
          requiredMonthlyInvestment =
            (goalAmount * monthlyRate) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
          requiredMonthlyInvestment = goalAmount / totalMonths;
        }
      }
  
      let projectedFutureValue = 0;
  
      if (monthlySaving > 0 && totalMonths > 0) {
        if (monthlyRate > 0) {
          projectedFutureValue =
            monthlySaving *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
        } else {
          projectedFutureValue = monthlySaving * totalMonths;
        }
      }
  
      let projectedYears = 0;
  
      if (monthlySaving > 0) {
        if (monthlyRate > 0) {
          const projectedMonthsToGoal =
            Math.log(1 + (goalAmount * monthlyRate) / monthlySaving) /
            Math.log(1 + monthlyRate);
          projectedYears = projectedMonthsToGoal / 12;
        } else {
          projectedYears = goalAmount / monthlySaving / 12;
        }
      }
  
      // Progress reflects actual accumulated savings
      const goalProgressPercent =
        goalAmount > 0
          ? Math.min(100, (currentSaved / goalAmount) * 100)
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
  }