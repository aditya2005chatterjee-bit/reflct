import { useState, useMemo, useEffect } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import DecisionTab from "@/features/simulate/DecisionTab";
import { calculateStability, formatCurrency, FinancialSnapshot, LoggedPurchase, MonthlyGoal } from "@/lib/financial";
import { computeBaseline } from "@/lib/engine/baseline";
import { computeGoalProjection } from "@/lib/engine/goals";
import BaselineTab from "@/features/baseline/BaselineTab";
import GoalsTab from "@/features/goals/GoalsTab";

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
  // Tabs for navigation
  const tabs: ("baseline" | "simulate" | "goal")[] = ["baseline", "simulate", "goal"];

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
        expectedReturn,
        0
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

  // ---- Future Wealth Projection (based on savings rate and time) ----
  const goalProgressPercent = goalAmount > 0
    ? Math.min(100, (projectedFutureValue / goalAmount) * 100)
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
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl shadow-sm">
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
      >
        <div
          key={activeTab}
          className={`transition-all duration-300 ease-out transform ${
            direction === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
        >
{activeTab === "baseline" ? (
  <BaselineTab
    stability={stability}
    baseline={baseline}
    monthlyIncome={monthlyIncome}
    monthlyExpenses={monthlyExpenses}
    currentSavings={currentSavings}
    setMonthlyIncome={setMonthlyIncome}
    setMonthlyExpenses={setMonthlyExpenses}
    setCurrentSavings={setCurrentSavings}
    purchases={purchases}
    totalActiveEMI={totalActiveEMI}
    monthlyGoals={monthlyGoals}
    activeMonthlyIndex={activeMonthlyIndex}
    setActiveMonthlyIndex={setActiveMonthlyIndex}
    goalProgressPercent={goalProgressPercent}
    showBaselineForm={showBaselineForm}
    setShowBaselineForm={setShowBaselineForm}
    setActiveTab={setActiveTab}
  />
) : activeTab === "simulate" ? (
  <DecisionTab
    baseline={baseline}
    purchases={purchases}
    onLogPurchase={(purchase) => {
      const updated = [purchase, ...purchases];
      setPurchases(updated);
      storage.setPurchases(updated);
    }}
    onDeletePurchase={(id) => {
      const updated = purchases.filter((p) => p.id !== id);
      setPurchases(updated);
      storage.setPurchases(updated);
    }}
  />
        ) : (
  <GoalsTab
  goalMode={goalMode}
  setGoalMode={setGoalMode}
  goalAmount={goalAmount}
  setGoalAmount={setGoalAmount}
  goalYears={goalYears}
  setGoalYears={setGoalYears}
  expectedReturn={expectedReturn}
  setExpectedReturn={setExpectedReturn}
  goalProgressPercent={goalProgressPercent}

  requiredMonthlyInvestment={requiredMonthlyInvestment}
  projectedYears={projectedYears}
  savingsReadinessPercent={savingsReadinessPercent}
  goalStatus={goalStatus}

  monthlyIncome={monthlyIncome}
  baseline={baseline}

  goalTracker={goalTracker}
  setGoalTracker={setGoalTracker}
  currentStreak={currentStreak}

  monthlyGoals={monthlyGoals}
  addMonthlyGoal={addMonthlyGoal}
  logMonthlyGoalAmount={logMonthlyGoalAmount}
  computeRequiredMonthly={computeRequiredMonthly}
  setMonthlyGoals={setMonthlyGoals}
/>
)}
        </div>
      </main>
      {/* Bottom Minimal Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-8 px-6 py-3 rounded-full bg-background/70 backdrop-blur-xl shadow-md">

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
