
import React from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { MonthlyGoal } from "@/lib/financial";
import { formatCurrency } from "@/lib/financial";

interface GoalsTabProps {
  goalMode: "yearly" | "monthly";
  setGoalMode: React.Dispatch<React.SetStateAction<"yearly" | "monthly">>;

  goalAmount: number;
  setGoalAmount: React.Dispatch<React.SetStateAction<number>>;

  goalYears: number;
  setGoalYears: React.Dispatch<React.SetStateAction<number>>;

  expectedReturn: number;
  setExpectedReturn: React.Dispatch<React.SetStateAction<number>>;

  goalProgressPercent: number;

  requiredMonthlyInvestment: number;
  projectedYears: number;
  savingsReadinessPercent: number;
  goalStatus: "on-track" | "behind" | null;

  monthlyIncome: number;
  baseline: any;

  goalTracker: Record<string, boolean>;
  setGoalTracker: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  monthlyGoals: MonthlyGoal[];
  setMonthlyGoals: React.Dispatch<React.SetStateAction<MonthlyGoal[]>>;
}

const GoalsTab: React.FC<GoalsTabProps> = ({
  goalMode,
  setGoalMode,
  goalAmount,
  setGoalAmount,
  goalYears,
  setGoalYears,
  expectedReturn,
  setExpectedReturn,
  goalProgressPercent,
  requiredMonthlyInvestment,
  projectedYears,
  goalStatus,
  monthlyIncome,
  baseline,
  goalTracker,
  setGoalTracker,
  monthlyGoals,
  setMonthlyGoals,
}) => {
  const [newMonthlyName, setNewMonthlyName] = React.useState("");
  const [newMonthlyTarget, setNewMonthlyTarget] = React.useState(0);
  const [newMonthlyDuration, setNewMonthlyDuration] = React.useState(1);

  // ---- Monthly Goal Logic (moved from Index) ----
  const addMonthlyGoal = (name: string, targetAmount: number, durationMonths: number) => {
    const newGoal: MonthlyGoal = {
      id: Date.now().toString(),
      name,
      targetAmount,
      durationMonths,
      monthsCompleted: 0,
      collectedAmount: 0,
      startDate: new Date().toISOString(),
    };

    setMonthlyGoals((prev) => [...prev, newGoal]);
  };

  const logMonthlyGoalAmount = (goalId: string, amount: number) => {
    if (amount <= 0) return;

    setMonthlyGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          collectedAmount: goal.collectedAmount + amount,
          monthsCompleted: goal.monthsCompleted + 1,
        };
      })
    );
  };

  const computeRequiredMonthly = (goal: MonthlyGoal) => {
    const remainingAmount = goal.targetAmount - goal.collectedAmount;
    const remainingMonths = goal.durationMonths - goal.monthsCompleted;

    if (remainingMonths <= 0) return 0;

    return remainingAmount / remainingMonths;
  };

  // ---- Saving Streak Logic (moved from Index) ----
  const calculateStreak = (tracker: Record<string, boolean>) => {
    let streak = 0;

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    while (true) {
      const key = `${year}-${month}`;

      if (tracker[key]) {
        streak++;
      } else {
        break;
      }

      month--;

      if (month === 0) {
        month = 12;
        year--;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak(goalTracker);

  const wealthColor =
    goalProgressPercent >= 100
      ? "#22c55e" // green (completion)
      : goalProgressPercent >= 70
      ? "#3b82f6" // blue
      : goalProgressPercent >= 40
      ? "#f97316" // orange
      : "#ef4444"; // red

  return (
    <div className="space-y-10 animate-fade-in">

      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex rounded-full border border-border overflow-hidden">
          <button
            onClick={() => setGoalMode("yearly")}
            className={`px-4 py-1 text-sm ${
              goalMode === "yearly"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            Yearly
          </button>

          <button
            onClick={() => setGoalMode("monthly")}
            className={`px-4 py-1 text-sm ${
              goalMode === "monthly"
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* YEARLY GOALS */}
      {goalMode === "yearly" && (
        <div className="space-y-8">

          {/* Goal Setup */}
          <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Long Term Goal
            </h3>

            <CurrencyInput
              label="Target Amount"
              value={goalAmount}
              onChange={setGoalAmount}
            />

            <div>
              <label className="text-xs text-muted-foreground">Target Years</label>
              <input
                type="number"
                value={goalYears}
                onChange={(e) => setGoalYears(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
              />
            </div>
          </div>

          {/* Wealth Progress Ring */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Wealth Progress Ring: single orange ring with grey remainder */}
              <div
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background: `conic-gradient(
                    ${wealthColor} ${goalProgressPercent}%,
                    rgba(255,255,255,0.08) ${goalProgressPercent}%
                  )`,
                  WebkitMask:
                    "radial-gradient(circle 48px at center, transparent 98%, black 100%)",
                  mask:
                    "radial-gradient(circle 48px at center, transparent 98%, black 100%)",
                }}
              />
              {/* Center Core */}
              <div className="absolute w-16 h-16 bg-card rounded-full flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tracking-tight">
                  {goalProgressPercent.toFixed(0)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Wealth
                </span>
              </div>
            </div>
          </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-background/60 border border-border/40 p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Required monthly investment
          </p>

          <p className="text-lg font-semibold">
            {formatCurrency(Math.max(0, requiredMonthlyInvestment))}
          </p>

          <p className="text-sm font-medium text-muted-foreground mt-4">
            With your current saving rate, you will reach your goal in:
          </p>

          <p className="text-lg font-semibold">
            {projectedYears > 0 ? projectedYears.toFixed(1) + " years" : "Insufficient savings"}
          </p>

          {goalStatus && (
            <p className={`text-sm mt-2 ${
              goalStatus === "on-track"
                ? "text-green-500 font-semibold"
                : "text-red-500 font-semibold"
            }`}>
              {goalStatus === "on-track"
                ? "You are on track to achieve your goal."
                : "You are behind schedule for this goal."}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-background/60 border border-border/40 p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Reality Check
          </p>

          {(() => {
            const monthlySaving = monthlyIncome - baseline.monthlyExpenses;
            const gap = requiredMonthlyInvestment - monthlySaving;

            const isSurplus = gap < 0;
            const isBalanced = Math.abs(gap) < 100;

            return (
              <>
                <p
                  className={`text-sm font-medium ${
                    isBalanced
                      ? "text-blue-500"
                      : isSurplus
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {isBalanced
                    ? "You are exactly on track for this goal."
                    : isSurplus
                    ? `You have ${formatCurrency(Math.abs(gap))} extra per month beyond what this goal requires.`
                    : `You are short by ${formatCurrency(gap)} per month to reach this goal on time.`}
                </p>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isBalanced
                        ? "bg-blue-500"
                        : isSurplus
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (monthlySaving / requiredMonthlyInvestment) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Monthly capacity vs required investment
                </p>
              </>
            );
          })()}
        </div>

      </div>

      {/* Timeline Suggestion */}
      <div className="rounded-2xl bg-background/60 border border-border/40 p-4 space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Timeline Suggestion
        </p>

        {(() => {
          const monthlySaving = monthlyIncome - baseline.monthlyExpenses;
          const gap = requiredMonthlyInvestment - monthlySaving;

          let suggestionText = "";

          if (gap > 0) {
            const extraYears = projectedYears - goalYears;
            suggestionText = `Extend timeline by ~${Math.max(
              1,
              Math.round(extraYears)
            )} year(s) or increase monthly savings.`;
          } else if (gap < 0) {
            suggestionText = `You could achieve this goal ${Math.max(
              1,
              Math.round(goalYears - projectedYears)
            )} year(s) earlier if consistent.`;
          } else {
            suggestionText = "Your current timeline is realistic and aligned.";
          }

          return (
            <>
              <p className="text-sm font-medium text-foreground">
                {suggestionText}
              </p>

              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>Target: {goalYears} yr</span>
                <span>
                  Projected: {projectedYears > 0 ? projectedYears.toFixed(1) : "—"} yr
                </span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Saving Streak */}
      <div className="rounded-2xl bg-background/60 border border-border/40 p-5 space-y-4">

        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Saving Streak
        </p>

        <div className="text-lg font-semibold">
          🔥 {currentStreak} month{currentStreak === 1 ? "" : "s"}
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 12 }, (_, i) => {
            const year = new Date().getFullYear();
            const key = `${year}-${i + 1}`;

            const label = new Date(year, i).toLocaleString("default", {
              month: "short",
            });

            const checked = goalTracker[key] || false;

            return (
              <button
                key={key}
                onClick={() =>
                  setGoalTracker({
                    ...goalTracker,
                    [key]: !checked,
                  })
                }
                className={`p-2 rounded-lg text-xs font-medium border ${
                  checked
                    ? "bg-green-500/20 border-green-500 text-green-600"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

      </div>

        </div>
      )}

      {/* MONTHLY GOALS */}
      {goalMode === "monthly" && (
        <div className="space-y-8">

          {/* Create Monthly Goal */}
          <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-6 shadow-lg space-y-4">

            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Monthly Goal
            </h3>

            <input
              type="text"
              placeholder="Goal name"
              value={newMonthlyName}
              onChange={(e) => setNewMonthlyName(e.target.value)}
              className="w-full p-2 rounded-md bg-background border border-border text-sm"
            />

            <CurrencyInput
              label="Target Amount"
              value={newMonthlyTarget}
              onChange={setNewMonthlyTarget}
            />

            <div>
              <label className="text-xs text-muted-foreground">
                Duration (months)
              </label>
              <input
                type="number"
                value={newMonthlyDuration}
                onChange={(e) => setNewMonthlyDuration(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
              />
            </div>

            <button
              onClick={() => {
                if (!newMonthlyName || !newMonthlyTarget || !newMonthlyDuration)
                  return;

                addMonthlyGoal(newMonthlyName, newMonthlyTarget, newMonthlyDuration);

                setNewMonthlyName("");
                setNewMonthlyTarget(0);
                setNewMonthlyDuration(1);
              }}
              className="w-full py-2 rounded-full bg-foreground text-background text-sm font-medium"
            >
              Create Monthly Goal
            </button>

          </div>

          {/* Monthly Goal Cards */}
          <div className="grid grid-cols-2 gap-4">
            {monthlyGoals.map((goal) => {

              const progress = Math.min(
                100,
                (goal.collectedAmount / goal.targetAmount) * 100
              );

              const required = computeRequiredMonthly(goal);

              return (
                <div
                  key={goal.id}
                  className="bg-background/60 border border-border/40 p-5 space-y-4 aspect-square flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.monthsCompleted}/{goal.durationMonths}
                    </p>
                  </div>

                  <div className="relative w-20 h-20 mx-auto">

                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#3b82f6 ${progress}%, rgba(255,255,255,0.08) ${progress}%)`,
                      }}
                    />

                    <div className="absolute inset-[8px] bg-background rounded-full flex items-center justify-center text-xs font-semibold">
                      {progress.toFixed(0)}%
                    </div>

                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    {formatCurrency(goal.collectedAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>

                  <p className="text-xs text-center text-muted-foreground">
                    Required this month: {formatCurrency(required)}
                  </p>

                  <button
                    onClick={() => {
                      const amount = Number(prompt("Amount saved this month"));
                      if (!amount) return;
                      logMonthlyGoalAmount(goal.id, amount);
                    }}
                    className="w-full py-2 rounded-full border border-border text-sm"
                  >
                    Log Amount
                  </button>

                  <button
                    onClick={() => {
                      setMonthlyGoals(prev => prev.filter(g => g.id !== goal.id));
                    }}
                    className="w-full py-2 rounded-full border border-red-500 text-red-500 text-sm"
                  >
                    Delete
                  </button>

                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};

export default GoalsTab;