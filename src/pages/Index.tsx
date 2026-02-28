import { useState, useMemo, useEffect } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import PurchaseSimulator from "@/components/PurchaseSimulator";
import { calculateStability, formatCurrency, FinancialSnapshot, LoggedPurchase, MonthlyGoal } from "@/lib/financial";
import { computeBaseline } from "@/lib/engine/baseline";
import { computeGoalProjection } from "@/lib/engine/goals";

// ---- Local Storage Layer ----
const storage = {
  getBaseline() {
    const raw = localStorage.getItem("baseline_v1");
    return raw ? JSON.parse(raw) : null;
  },
  setBaseline(data: any) {
    localStorage.setItem("baseline_v1", JSON.stringify(data));
  },
  getPurchases() {
    const raw = localStorage.getItem("purchaseHistory_v1");
    return raw ? JSON.parse(raw) : [];
  },
  setPurchases(data: any) {
    localStorage.setItem("purchaseHistory_v1", JSON.stringify(data));
  },
  getGoalTracker() {
    const raw = localStorage.getItem("goal_tracker_v1");
    return raw ? JSON.parse(raw) : {};
  },
  setGoalTracker(data: any) {
    localStorage.setItem("goal_tracker_v1", JSON.stringify(data));
  },
  getGoalConfig() {
    const raw = localStorage.getItem("goal_config_v1");
    return raw ? JSON.parse(raw) : null;
  },
  setGoalConfig(data: any) {
    localStorage.setItem("goal_config_v1", JSON.stringify(data));
  },
  getMonthlyGoals() {
    const raw = localStorage.getItem("monthly_goals_v1");
    return raw ? JSON.parse(raw) : [];
  },
  setMonthlyGoals(data: any) {
    localStorage.setItem("monthly_goals_v1", JSON.stringify(data));
  },
};
// ------------------------------

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [activeTab, setActiveTab] = useState<"baseline" | "simulate" | "goal">("baseline");
  const [direction, setDirection] = useState<"left" | "right">("right");
  // Tabs and swipe state for mobile
  const tabs: ("baseline" | "simulate" | "goal")[] = ["baseline", "simulate", "goal"];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    const currentIndex = tabs.indexOf(activeTab);

    if (distance > minSwipeDistance && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }

    if (distance < -minSwipeDistance && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const [purchases, setPurchases] = useState<LoggedPurchase[]>([]);

  const [goalAmount, setGoalAmount] = useState(0);
  const [goalYears, setGoalYears] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [goalTracker, setGoalTracker] = useState<Record<string, boolean>>({});
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [activeMonthlyIndex, setActiveMonthlyIndex] = useState(0);
  const [goalMode, setGoalMode] = useState<"yearly" | "monthly">("yearly");
  const [newMonthlyName, setNewMonthlyName] = useState("");
  const [newMonthlyTarget, setNewMonthlyTarget] = useState(0);
  const [newMonthlyDuration, setNewMonthlyDuration] = useState(1);

  const baseline = useMemo(
    () =>
      computeBaseline(
        monthlyIncome,
        monthlyExpenses,
        currentSavings,
        purchases
      ),
    [monthlyIncome, monthlyExpenses, currentSavings, purchases]
  );
  const totalActiveEMI = useMemo(() => {
    const now = new Date();

    return purchases.reduce((total, purchase) => {
      if (!purchase.isEMI) return total;

      const start = new Date(purchase.startDate);
      const monthsPassed =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());

      if (monthsPassed < purchase.emiMonths) {
        return total + purchase.monthlyEMI;
      }

      return total;
    }, 0);
  }, [purchases]);

  const stability = useMemo(() => calculateStability(baseline), [baseline]);

  const goalProjection = useMemo(
    () =>
      computeGoalProjection(
        monthlyIncome,
        baseline.monthlyExpenses,
        goalAmount,
        goalYears,
        expectedReturn
      ),
    [
      monthlyIncome,
      baseline.monthlyExpenses,
      goalAmount,
      goalYears,
      expectedReturn,
    ]
  );

  const {
    requiredMonthlyInvestment,
    projectedYears,
    projectedFutureValue,
    savingsReadinessPercent,
  } = goalProjection;

  // Projection-based goal percentage (for Goals tab ring)
  const projectedGoalPercent = goalAmount > 0
    ? Math.min(100, (projectedFutureValue / goalAmount) * 100)
    : 0;

  // ---- Goal Funding Logic (Independent of projections) ----
  const fundedMonths = Object.values(goalTracker).filter(Boolean).length;
  const totalFundedAmount = fundedMonths * requiredMonthlyInvestment;

  const goalProgressPercent = goalAmount > 0
    ? Math.min(100, (totalFundedAmount / goalAmount) * 100)
    : 0;
  // ---------------------------------------------------------

  const goalStatus =
    projectedYears === 0
      ? null
      : projectedYears <= goalYears
      ? "on-track"
      : "behind";

  // --- Current Streak Calculation ---
  let currentStreak = 0;

const now = new Date();
let year = now.getFullYear();
let month = now.getMonth() + 1;

while (true) {
  const key = `${year}-${month}`;

  if (goalTracker[key]) {
    currentStreak++;
  } else {
    break;
  }

  month--;

  if (month === 0) {
    month = 12;
    year--;
  }
}
  // --------------------------------


  useEffect(() => {
    const stored = storage.getPurchases();
    setPurchases(stored);
  }, []);

  useEffect(() => {
    const storedTracker = storage.getGoalTracker();
    setGoalTracker(storedTracker);
  }, []);

  useEffect(() => {
    const parsed = storage.getBaseline();
    if (parsed) {
      setMonthlyIncome(parsed.monthlyIncome || 0);
      setMonthlyExpenses(parsed.monthlyExpenses || 0);
      setCurrentSavings(parsed.currentSavings || 0);
    }
  }, []);
  useEffect(() => {
    const storedGoal = storage.getGoalConfig();
    if (storedGoal) {
      setGoalAmount(storedGoal.goalAmount || 0);
      setGoalYears(storedGoal.goalYears || 5);
      setExpectedReturn(storedGoal.expectedReturn || 8);
    }
  }, []);

  useEffect(() => {
    const storedGoals = storage.getMonthlyGoals();
    setMonthlyGoals(storedGoals);
  }, []);


  const hasInput = monthlyIncome > 0;
  useEffect(() => {
    const baselineData = {
      monthlyIncome,
      monthlyExpenses,
      currentSavings,
    };
    storage.setBaseline(baselineData);
  }, [monthlyIncome, monthlyExpenses, currentSavings]);

  useEffect(() => {
    storage.setGoalTracker(goalTracker);
  }, [goalTracker]);

  useEffect(() => {
    storage.setGoalConfig({
      goalAmount,
      goalYears,
      expectedReturn,
    });
  }, [goalAmount, goalYears, expectedReturn]);
  useEffect(() => {
    storage.setMonthlyGoals(monthlyGoals);
  }, [monthlyGoals]);
  // --- Monthly Goals helpers ---
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

    setMonthlyGoals(prev => [...prev, newGoal]);
  };

  const logMonthlyGoalAmount = (goalId: string, amount: number) => {
    if (amount <= 0) return;

    setMonthlyGoals(prev =>
      prev.map(goal => {
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
  const [showBaselineForm, setShowBaselineForm] = useState(false);

  return (
    <div className="min-h-screen bg-background transition-all duration-500 ease-in-out">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="relative flex items-center justify-center">
            <h1 className="text-2xl font-semibold tracking-tight text-center w-full">
              REFLCT
            </h1>
            <div className="absolute right-0 flex gap-2">
              <button
                onClick={() => {
                  alert("Sign in is not available in this beta version.");
                }}
                className="text-xs px-3 py-1 rounded-md border border-border hover:bg-muted transition"
              >
                Sign in
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-xs px-3 py-1 rounded-md border border-border hover:bg-muted transition"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5 text-center">
            Know the cost before you pay the price
          </p>
        </div>
      </header>

      {/* Ambient Stability Ring */}
      <div className="flex justify-center mt-3 mb-2">
        <div className="relative w-8 h-8">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${
                stability.stabilityScore <= 35
                  ? "#ef4444"
                  : stability.stabilityScore <= 65
                  ? "#f97316"
                  : stability.stabilityScore <= 85
                  ? "#3b82f6"
                  : "#22c55e"
              } ${stability.stabilityScore}%, rgba(0,0,0,0.08) ${stability.stabilityScore}%)`
            }}
          />
          <div className="absolute inset-[4px] bg-background rounded-full" />
        </div>
      </div>


      {/* Content */}
      <main
        className="container max-w-lg mx-auto px-4 py-6 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={activeTab}
          className={`transition-all duration-300 ease-out transform ${
            direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
        >
{activeTab === "baseline" ? (
<div className="relative flex flex-col items-center px-6 pt-10 pb-20 space-y-10">

  {/* Dynamic Greeting */}
  <h2 className="text-2xl font-semibold tracking-tight w-full text-left">
    Hey Guest
  </h2>

  {/* Top Cards Row */}
  <div className="flex items-center justify-between w-full max-w-sm gap-4">

    {/* Stability Card */}
    <div className="flex-1 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-4 text-center shadow-lg hover:-translate-y-1 transition-all duration-300">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Stability
      </p>
      <p className="text-2xl font-semibold tracking-tight">
        {stability.stabilityScore}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-1">
        {stability.emergencyMonths.toFixed(1)} mo safety
      </p>
      <p className="text-[10px] mt-1 text-muted-foreground">
        {stability.stabilityScore >= 85
          ? "Strong position"
          : stability.stabilityScore >= 65
          ? "Stable"
          : stability.stabilityScore >= 35
          ? "Fragile"
          : "Exposed"}
      </p>
    </div>

    {/* Purchases + EMI Card */}
    <div className="flex-1 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-4 text-center shadow-lg hover:-translate-y-1 transition-all duration-300">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Active EMIs
      </p>
      <p className="text-2xl font-semibold tracking-tight">
        {totalActiveEMI > 0 ? formatCurrency(totalActiveEMI) : "—"}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-1">
        {purchases.filter(p => p.isEMI).length} EMI running
      </p>
      <p className="text-[10px] mt-1 text-muted-foreground">
        Total purchases: {purchases.length}
      </p>
    </div>

  </div>

  {/* This Month Overview */}
  <div className="w-full max-w-sm rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-5 space-y-3 shadow-lg hover:-translate-y-1 transition-all duration-300">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">
      This Month
    </p>

    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        Total Expenses
      </span>
      <span className="font-medium">
        {formatCurrency(baseline.monthlyExpenses)}
      </span>
    </div>

    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        Savings Left
      </span>
      <span className={`text-lg font-semibold transition-colors duration-300 ${
        monthlyIncome - baseline.monthlyExpenses >= 0
          ? "text-green-500"
          : "text-red-500"
      }`}>
        {formatCurrency(monthlyIncome - baseline.monthlyExpenses)}
      </span>
    </div>
  </div>

  {/* Central Stability Ring */}
  <div className="relative w-28 h-28">
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `conic-gradient(${
          stability.stabilityScore <= 35
            ? "#ef4444"
            : stability.stabilityScore <= 65
            ? "#f97316"
            : stability.stabilityScore <= 85
            ? "#3b82f6"
            : "#22c55e"
        } ${stability.stabilityScore}%, rgba(0,0,0,0.08) ${stability.stabilityScore}%)`
      }}
    />
    <div className="absolute inset-[10px] bg-background rounded-full flex flex-col items-center justify-center">
      <span className="text-3xl font-semibold tracking-tight">
        {stability.stabilityScore}
      </span>
      <span className="text-[10px] text-muted-foreground">
        Overall
      </span>
    </div>
  </div>

  {/* Action Buttons */}
  <button
    onClick={() => setActiveTab("simulate")}
    className="w-full max-w-sm py-3 rounded-full bg-foreground text-background text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
  >
    Simulate Decision
  </button>

  <button
    onClick={() => setActiveTab("goal")}
    className="w-full max-w-sm py-3 rounded-full border border-border text-sm font-medium hover:bg-muted/40 transition-all duration-300 active:scale-95"
  >
    Plan a Goal
  </button>

  {/* Edit Financial Details Toggle */}
  <button
    onClick={() => setShowBaselineForm(!showBaselineForm)}
    className="w-full max-w-sm text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors duration-200"
  >
    {showBaselineForm ? "Hide financial details" : "Edit financial details"}
  </button>

  {/* Editable Financial Inputs */}
  {showBaselineForm && (
    <div className="w-full max-w-sm space-y-4 mt-6 animate-fade-in">
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

    {/* Monthly Goals Swipe */}
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

          return (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#3b82f6 ${progress}%, rgba(255,255,255,0.08) ${progress}%)`
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

    {/* Yearly Ring (shifted right) */}
    <div className="relative w-32 h-32 flex-shrink-0">

      <div
        className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.22)]"
        style={{
          background: `conic-gradient(#3b82f6 ${goalProgressPercent}%, rgba(255,255,255,0.08) ${goalProgressPercent}%)`,
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
) : activeTab === "simulate" ? (
  <div className="space-y-10 animate-fade-in">
    {/* Simulation Header */}
    <div className="space-y-3 mb-4">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Decision Lab
      </h2>
      <p className="text-sm text-muted-foreground">
        Test the financial impact before you commit.
      </p>
    </div>
    <div className="space-y-8">
      <PurchaseSimulator
        baseline={baseline}
        purchases={purchases}
        onLogPurchase={(purchase) => {
          const newPurchase: LoggedPurchase = {
            ...purchase,
            id: crypto.randomUUID(),
          };

          const updated = [newPurchase, ...purchases];
          setPurchases(updated);
          storage.setPurchases(updated);
        }}
        onDeletePurchase={(id) => {
          const updated = purchases.filter((p) => p.id !== id);
          setPurchases(updated);
          storage.setPurchases(updated);
        }}
      />
    </div>
  </div>
        ) : (
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

            {goalMode === "yearly" && (
              <>
                <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-6 shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                    Goal Planning
                  </h2>

                  <div className="space-y-4">
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
                      <label className="text-xs text-muted-foreground">Expected Annual Return (%)</label>
                      <input
                        type="number"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
                      />
                    </div>
                  </div>
                </div>

                {goalAmount > 0 && (monthlyIncome - baseline.monthlyExpenses) > 0 && (
                  <div className="space-y-8">
                    {/* Dual ring stays full width at the top */}
                    <div className="flex justify-center mb-6">
                      <div className="relative w-32 h-32 flex items-center justify-center group">

                        {/* Outer Wealth Ring */}
                        <div
                          title={`Wealth Progress: ${projectedGoalPercent.toFixed(0)}% of target amount`}
                          className="absolute w-32 h-32 rounded-full transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]"
                          style={{
                            background: `conic-gradient(${projectedGoalPercent >= 100 ? "#22c55e" : "#3b82f6"} ${projectedGoalPercent}%, rgba(255,255,255,0.08) ${projectedGoalPercent}%)`
                          }}
                        />

                        {/* Inner Readiness Ring */}
                        <div
                          title={`Savings Readiness: ${savingsReadinessPercent.toFixed(0)}% of required monthly investment`}
                          className="absolute w-24 h-24 rounded-full transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                          style={{
                            background: `conic-gradient(${savingsReadinessPercent >= 100 ? "#22c55e" : "#f97316"} ${savingsReadinessPercent}%, rgba(255,255,255,0.06) ${savingsReadinessPercent}%)`
                          }}
                        />

                        {/* Center Core */}
                        <div className="absolute w-16 h-16 bg-card rounded-full flex flex-col items-center justify-center">
                          <span className="text-xl font-semibold tracking-tight">
                            {projectedGoalPercent.toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Wealth
                          </span>
                        </div>

                      </div>
                    </div>
                    {/* Start grid two columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* LEFT column: Required + projection + status */}
                      <div className="rounded-2xl bg-background/60 backdrop-blur-xl border border-border/40 p-4 space-y-3">
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
                            goalStatus === "on-track" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"
                          }`}>
                            {goalStatus === "on-track"
                              ? "You are on track to achieve your goal."
                              : "You are behind schedule for this goal."}
                          </p>
                        )}
                      </div>
                      {/* RIGHT column: Reality Check card */}
                      {(() => {
                        const monthlySaving = monthlyIncome - baseline.monthlyExpenses;
                        const gap = requiredMonthlyInvestment - monthlySaving;

                        const isSurplus = gap < 0;
                        const isBalanced = Math.abs(gap) < 100;

                        return (
                          <div className="rounded-2xl bg-background/60 backdrop-blur-xl border border-border/40 p-4 space-y-3">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                              Reality Check
                            </p>

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

                            {/* Visual Bar */}
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
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
                          </div>
                        );
                      })()}
                    </div>
                    {/* End grid */}
                    {/* Timeline Suggestion Card */}
                    {(() => {
                      const monthlySaving = monthlyIncome - baseline.monthlyExpenses;
                      const gap = requiredMonthlyInvestment - monthlySaving;

                      let suggestionText = "";

                      if (gap > 0) {
                        const extraYears = projectedYears - goalYears;
                        suggestionText = `Extend timeline by ~${Math.max(1, Math.round(extraYears))} year(s) or increase monthly savings.`;
                      } else if (gap < 0) {
                        suggestionText = `You could achieve this goal ${Math.max(
                          1,
                          Math.round(goalYears - projectedYears)
                        )} year(s) earlier if consistent.`;
                      } else {
                        suggestionText = "Your current timeline is realistic and aligned.";
                      }

                      return (
                        <div className="mt-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/40 p-4 space-y-2">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Timeline Suggestion
                          </p>

                          <p className="text-sm font-medium text-foreground">
                            {suggestionText}
                          </p>

                          <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                            <span>Target: {goalYears} yr</span>
                            <span>Projected: {projectedYears > 0 ? projectedYears.toFixed(1) : "—"} yr</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Monthly Streak + Calendar */}
                    {(() => {
                      const now = new Date();
                      const currentYear = now.getFullYear();

                      const months = Array.from({ length: 12 }, (_, i) => {
                        const key = `${currentYear}-${i + 1}`;
                        return {
                          key,
                          label: new Date(currentYear, i).toLocaleString("default", { month: "short" }),
                          checked: goalTracker[key] || false,
                        };
                      });

                      return (
                        <div className="mt-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/40 p-5 space-y-4">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Saving Streak
                          </p>

                          <div className="text-lg font-semibold">
                            🔥 {currentStreak} month{currentStreak === 1 ? "" : "s"}
                          </div>

                          <div className="grid grid-cols-4 gap-3 mt-4">
                            {months.map((month) => (
                              <button
                                key={month.key}
                                onClick={() =>
                                  setGoalTracker({
                                    ...goalTracker,
                                    [month.key]: !month.checked,
                                  })
                                }
                                className={`p-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                                  month.checked
                                    ? "bg-green-500/20 border-green-500 text-green-600"
                                    : "bg-card border-border text-muted-foreground hover:border-foreground/40"
                                }`}
                              >
                                {month.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                </div>
                )}
              </>
            )}

            {goalMode === "monthly" && (
              <div className="space-y-8">

                <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-white/10 p-6 shadow-lg space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Monthly Goal Setup
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
                    <label className="text-xs text-muted-foreground">Duration (months)</label>
                    <input
                      type="number"
                      value={newMonthlyDuration}
                      onChange={(e) => setNewMonthlyDuration(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!newMonthlyName || !newMonthlyTarget || !newMonthlyDuration) return;
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

                <div className="grid grid-cols-2 gap-4">
                  {monthlyGoals.map(goal => {
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
                            {goal.monthsCompleted}/{goal.durationMonths} months
                          </p>
                        </div>

                        <div className="relative w-20 h-20 mx-auto">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(#3b82f6 ${progress}%, rgba(255,255,255,0.08) ${progress}%)`
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
                          className="w-full py-2 rounded-full border border-red-500 text-red-500 text-sm hover:bg-red-500/10 transition"
                        >
                          Delete Goal
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
      {/* Bottom Minimal Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-8 px-6 py-3 rounded-full bg-background/70 backdrop-blur-xl border border-border/40 shadow-lg">

          {(["baseline", "simulate", "goal"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex = tabs.indexOf(tab);
                setDirection(nextIndex > currentIndex ? "right" : "left");
                setActiveTab(tab);
              }}
              className={`text-sm transition-all duration-200 ${
                activeTab === tab
                  ? "text-foreground font-medium scale-105"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {tab === "baseline"
                ? "Position"
                : tab === "simulate"
                ? "Decision"
                : "Future"}
            </button>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Index;
