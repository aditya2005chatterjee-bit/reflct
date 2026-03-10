

import React from "react";
import PurchaseSimulator from "@/components/PurchaseSimulator";
import { LoggedPurchase } from "@/lib/engine/financial";

interface DecisionTabProps {
  baseline: any;
  purchases: LoggedPurchase[];
  onLogPurchase: (purchase: LoggedPurchase) => void;
  onDeletePurchase: (id: string) => void;
}

const DecisionTab: React.FC<DecisionTabProps> = ({
  baseline,
  purchases,
  onLogPurchase,
  onDeletePurchase,
}) => {
  return (
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

            onLogPurchase(newPurchase);
          }}
          onDeletePurchase={onDeletePurchase}
        />
      </div>
    </div>
  );
};

export default DecisionTab;