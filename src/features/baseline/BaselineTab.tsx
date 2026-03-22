import React from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { formatCurrency, LoggedPurchase, MonthlyGoal } from "@/lib/financial";

interface BaselineTabProps {
  stability: any;
  baseline: any;
  userName: string;

  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;

  setMonthlyIncome: (value: number) => void;
  setMonthlyExpenses: (value: number) => void;
  setCurrentSavings: (value: number) => void;

  purchases: LoggedPurchase[];
  totalActiveEMI: number;

  monthlyGoals: MonthlyGoal[];
  activeMonthlyIndex: number;
  setActiveMonthlyIndex: React.Dispatch<React.SetStateAction<number>>;

  goalProgressPercent: number;

  showBaselineForm: boolean;
  setShowBaselineForm: React.Dispatch<React.SetStateAction<boolean>>;

  setActiveTab: React.Dispatch<
    React.SetStateAction<"baseline" | "simulate" | "goal">
  >;
}

const BaselineTab: React.FC<BaselineTabProps> = ({
  stability,
  baseline,
  userName,
  monthlyIncome,
  monthlyExpenses,
  currentSavings,
  setMonthlyIncome,
  setMonthlyExpenses,
  setCurrentSavings,
  purchases,
  totalActiveEMI,
  monthlyGoals,
  activeMonthlyIndex,
  setActiveMonthlyIndex,
  goalProgressPercent,
  showBaselineForm,
  setShowBaselineForm,
  setActiveTab,
}) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="relative flex flex-col items-center px-6 pt-10 pb-20 space-y-10">
      {/* Greeting */}
      <h2 className="text-2xl font-semibold tracking-tight w-full text-left">
        {greeting}, {userName || "Guest"}
      </h2>

      {/* Top Cards */}
      <div className="flex items-center justify-between w-full max-w-sm gap-4">
        {/* Stability Card */}
        <div className="flex-1 rounded-2xl bg-card/70 backdrop-blur-xl p-4 text-center shadow-md">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Stability
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {stability.stabilityScore}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {stability.emergencyMonths.toFixed(1)} mo safety
          </p>
        </div>

        {/* EMI Card */}
        <div className="flex-1 rounded-2xl bg-card/70 backdrop-blur-xl p-4 text-center shadow-md">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Active EMIs
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {totalActiveEMI > 0 ? formatCurrency(totalActiveEMI) : "—"}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {purchases.filter((p) => p.isEMI).length} EMI running
          </p>
        </div>
      </div>

      {/* This Month */}
      <div className="w-full max-w-sm rounded-2xl bg-card/70 backdrop-blur-xl p-5 space-y-3 shadow-md">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          This Month
        </p>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Expenses</span>
          <span className="font-medium">
            {formatCurrency(baseline.monthlyExpenses)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Surplus</span>
          <span className="text-lg font-semibold">
            {monthlyIncome - baseline.monthlyExpenses >= 0
              ? formatCurrency(monthlyIncome - baseline.monthlyExpenses)
              : `-${formatCurrency(Math.abs(monthlyIncome - baseline.monthlyExpenses))}`}
          </span>
        </div>
      </div>

      {/* Stability Ring */}
      <div className="relative w-28 h-28">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#3b82f6 ${stability.stabilityScore}%, rgba(0,0,0,0.08) ${stability.stabilityScore}%)`,
          }}
        />
        <div className="absolute inset-[10px] bg-background rounded-full flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight">
            {stability.stabilityScore}
          </span>
          <span className="text-[10px] text-muted-foreground">Overall</span>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        onClick={() => setActiveTab("simulate")}
        className="w-full max-w-sm py-3 rounded-full bg-foreground text-background text-sm font-medium shadow-md"
      >
        Simulate Decision
      </button>

      <button
        onClick={() => setActiveTab("goal")}
        className="w-full max-w-sm py-3 rounded-full border border-border text-sm font-medium"
      >
        Plan a Goal
      </button>

      {/* Edit Financials */}
      <button
        onClick={() => setShowBaselineForm(!showBaselineForm)}
        className="w-full max-w-sm text-xs text-muted-foreground"
      >
        {showBaselineForm ? "Hide financial details" : "Edit financial details"}
      </button>

      {showBaselineForm && (
        <div className="w-full max-w-sm space-y-4">
          <CurrencyInput
            label="Monthly Income"
            value={monthlyIncome}
            onChange={setMonthlyIncome}
          />

          <CurrencyInput
            label="Monthly Expenses"
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
          />

          <CurrencyInput
            label="Current Savings"
            value={currentSavings}
            onChange={setCurrentSavings}
          />
        </div>
      )}

      {/* Goal Wealth + Monthly Preview */}
      <div className="w-full max-w-sm flex items-center justify-between mt-10 gap-6">
        {/* Monthly Goal Ring */}
        <div
          className="flex-1 flex justify-center cursor-pointer"
          onClick={() => {
            if (monthlyGoals.length <= 1) return;
            setActiveMonthlyIndex((prev) => (prev + 1) % monthlyGoals.length);
          }}
        >
          {monthlyGoals.length === 0 ? (
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Create a monthly goal →
            </div>
          ) : (
            (() => {
              const goal = monthlyGoals[activeMonthlyIndex];
              const progress = Math.min(
                100,
                (goal.collectedAmount / goal.targetAmount) * 100
              );
              const ringColor =
                progress >= 100 ? "#22c55e" :
                progress >= 70 ? "#3b82f6" :
                progress >= 40 ? "#f97316" :
                "#ef4444";

              return (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${ringColor} ${progress}%, rgba(255,255,255,0.08) ${progress}%)`,
                      }}
                    />
                    <div className="absolute inset-[14px] bg-background rounded-full flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-semibold tracking-tight">
                        {progress.toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {goal.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {monthlyGoals.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === activeMonthlyIndex ? "bg-foreground" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Long Term Goal Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${
                goalProgressPercent >= 100 ? "#22c55e" :
                goalProgressPercent >= 70 ? "#3b82f6" :
                goalProgressPercent >= 40 ? "#f97316" :
                "#ef4444"
              } ${goalProgressPercent}%, rgba(255,255,255,0.08) ${goalProgressPercent}%)`,
            }}
          />

          <div className="absolute inset-[14px] bg-background rounded-full flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-semibold tracking-tight">
              {goalProgressPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Long Term Goal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaselineTab;
