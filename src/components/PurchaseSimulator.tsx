import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import MetricCard from "./MetricCard";
import StabilityScore from "./StabilityScore";
import StabilityBreakdown from "./StabilityBreakdown";
import ImpactBadge from "./ImpactBadge";
import FreedomMeter from "./FreedomMeter";
import ProjectionChart from "./ProjectionChart";
import {
  FinancialBaseline,
  calculatePurchaseImpact,
  calculateStability,
  generateProjectionData,
  formatCurrency,
  getImpactSeverity,
  LoggedPurchase,
} from "@/lib/financial";

interface PurchaseSimulatorProps {
  baseline: FinancialBaseline;
  purchases: LoggedPurchase[];
  onLogPurchase: (purchase: LoggedPurchase) => void;
  onDeletePurchase: (id: string) => void;
}

function getVerdict(stabilityDrop: number): string {
  if (stabilityDrop <= 0) return "No measurable impact on your stability.";
  if (stabilityDrop < 2) return "Low impact. Financially manageable.";
  if (stabilityDrop <= 5) return "Noticeable impact. Consider delaying.";
  return "High impact. This weakens your financial stability.";
}


const EMIControls = ({
  emiMonths,
  setEmiMonths,
  interestRate,
  setInterestRate,
}: {
  emiMonths: number;
  setEmiMonths: (n: number) => void;
  interestRate: number;
  setInterestRate: (n: number) => void;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        EMI Duration
      </label>
      <div className="flex gap-2">
        {[6, 12, 18, 24, 36].map((m) => (
          <button
            key={m}
            onClick={() => setEmiMonths(m)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
              emiMonths === m
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            {m}mo
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        Interest Rate: {interestRate}%
      </label>
      <input
        type="range"
        min="0"
        max="36"
        step="0.5"
        value={interestRate}
        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
        className="w-full accent-foreground"
      />
    </div>
  </div>
);

const PurchaseSimulator = ({ baseline, purchases, onLogPurchase, onDeletePurchase }: PurchaseSimulatorProps) => {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [isEMI, setIsEMI] = useState(false);
  const [emiMonths, setEmiMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(14);

  const [showGate, setShowGate] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<LoggedPurchase | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const currentStability = useMemo(() => calculateStability(baseline), [baseline]);

  const impact = useMemo(() => {
    if (itemPrice <= 0) return null;
    return calculatePurchaseImpact(baseline, { itemPrice, isEMI, emiMonths, interestRate });
  }, [baseline, itemPrice, isEMI, emiMonths, interestRate]);

  const projectionData = useMemo(
    () => generateProjectionData(baseline, impact, 60),
    [baseline, impact]
  );

  const severity = impact ? getImpactSeverity(impact) : null;

  const handleLogPurchase = () => {
    if (!impact) {
      alert("Enter a valid item price.");
      return;
    }

    if (!itemName.trim()) {
      alert("Please enter an item name.");
      return;
    }

    const purchase: LoggedPurchase = {
      id: Date.now().toString(),
      name: itemName,
      price: itemPrice,
      isEMI,
      emiMonths,
      interestRate,
      monthlyEMI: impact.monthlyEMI,
      startDate: new Date().toISOString(),
    };

    // Show consequence gate only if impact is moderate or major
    if (severity && severity !== "none" && severity !== "minor") {
      setPendingPurchase(purchase);
      setShowGate(true);
      return;
    }

    onLogPurchase(purchase);
    setConfirmation(`Logged. Your stability is now ${impact.newStabilityScore}.`);
    setTimeout(() => setConfirmation(null), 2000);

    setItemName("");
    setItemPrice(0);
    setIsEMI(false);
  };

  return (
    <div className="space-y-6">
      {/* Purchase Input */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Simulate a Purchase
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. iPhone 16"
              className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm"
            />
          </div>

          <CurrencyInput label="Item Price" value={itemPrice} onChange={setItemPrice} />

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Pay via EMI</span>
            <button
              onClick={() => setIsEMI(!isEMI)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isEMI ? "bg-foreground" : "bg-secondary"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background transition-transform duration-200 ${
                  isEMI ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {isEMI && (
            <EMIControls
              emiMonths={emiMonths}
              setEmiMonths={setEmiMonths}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
            />
          )}
        </div>
      </div>

      {/* Impact Results */}
      {impact && (
        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Verdict
              </p>
              {severity && <ImpactBadge severity={severity} />}
            </div>
            <p className="text-base text-foreground font-medium">
              {getVerdict(impact.stabilityDrop)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StabilityScore
              score={currentStability.stabilityScore}
              level={currentStability.stabilityLevel}
              label="Before"
            />
            <StabilityScore
              score={impact.newStabilityScore}
              level={
                impact.newStabilityScore <= 35
                  ? "Exposed"
                  : impact.newStabilityScore <= 65
                  ? "Fragile"
                  : impact.newStabilityScore <= 85
                  ? "Stable"
                  : "Strong"
              }
              label="After"
              previousScore={currentStability.stabilityScore}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isEMI && impact.monthlyEMI > 0 && (
              <MetricCard
                label="Monthly EMI"
                value={formatCurrency(impact.monthlyEMI)}
                subtext={`for ${emiMonths} months`}
              />
            )}
            <MetricCard
              label="Goal Delay"
              value={`${impact.goalDelayMonths} mo`}
              subtext="impact on long-term goal"
            />
          </div>

          <button
            type="button"
            onClick={handleLogPurchase}
            className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            Log This Purchase
          </button>

          <ProjectionChart data={projectionData} hasPurchase={true} />
        </div>
      )}

      {!impact && baseline.monthlyIncome > 0 && (
        <ProjectionChart data={projectionData} hasPurchase={false} />
      )}

      {purchases.length > 0 && (
        <div className="space-y-4 mt-10">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
            Purchase History
          </h3>

          {purchases.map((purchase) => {
            const start = new Date(purchase.startDate);
            const now = new Date();
            const monthsPassed =
              (now.getFullYear() - start.getFullYear()) * 12 +
              (now.getMonth() - start.getMonth());

            const isActive = purchase.isEMI && monthsPassed < purchase.emiMonths;

            return (
              <div
                key={purchase.id}
                className="rounded-xl bg-card border border-border p-4 flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium">{purchase.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(purchase.price)}
                    {purchase.isEMI && ` • EMI ${purchase.emiMonths} mo`}
                  </p>
                  {purchase.isEMI && (
                    <p className={`text-xs mt-1 ${isActive ? "text-green-500" : "text-muted-foreground"}`}>
                      {isActive ? "EMI Active" : "EMI Completed"}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onDeletePurchase(purchase.id)}
                  className="text-xs text-muted-foreground hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showGate && pendingPurchase && impact && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-[90%] shadow-xl animate-scale-in">

            <p className="text-lg font-medium text-center">
              This reduces your safety by {impact.freedomCostDays} days.
            </p>

            <p className="text-sm text-muted-foreground text-center mt-3">
              Your stability changes from {currentStability.stabilityScore} → {impact.newStabilityScore}
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowGate(false)}
                className="flex-1 py-3 rounded-xl border border-border"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onLogPurchase(pendingPurchase);
                  setShowGate(false);
                  setPendingPurchase(null);
                  setConfirmation(`Logged. Your stability is now ${impact.newStabilityScore}.`);
                  setTimeout(() => setConfirmation(null), 2000);

                  setItemName("");
                  setItemPrice(0);
                  setIsEMI(false);
                }}
                className="flex-1 py-3 rounded-xl border border-border"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-xl text-sm shadow-md">
          {confirmation}
        </div>
      )}
    </div>
  );
};

export default PurchaseSimulator;
