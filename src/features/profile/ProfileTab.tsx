import React, { useState, useEffect } from "react";
import CurrencyInput from "@/components/CurrencyInput";

interface ProfileTabProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;

  setMonthlyIncome: (value: number) => void;
  setMonthlyExpenses: (value: number) => void;
  setCurrentSavings: (value: number) => void;
  onSaveProfile?: (name: string) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  monthlyIncome,
  monthlyExpenses,
  currentSavings,
  setMonthlyIncome,
  setMonthlyExpenses,
  setCurrentSavings,
  onSaveProfile,
}) => {
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const saved = localStorage.getItem("user_name_v1");
    if (saved) {
      setUserName(saved);
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center px-6 pt-10 pb-20 space-y-10">

      {/* Page Title */}
      <h2 className="text-2xl font-semibold tracking-tight w-full text-left">
        Profile
      </h2>

      {/* Name Section */}
      <div className="w-full max-w-sm rounded-2xl bg-card/70 backdrop-blur-xl p-5 shadow-md space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Your Name
        </p>

        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-2 rounded-md bg-background border border-border text-sm"
        />
      </div>

      {/* Financial Details */}
      <div className="w-full max-w-sm rounded-2xl bg-card/70 backdrop-blur-xl p-5 shadow-md space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Financial Details
        </p>

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

      {/* Save Button */}
      <button
        onClick={() => {
          localStorage.setItem("user_name_v1", userName);
          onSaveProfile?.(userName);
        }}
        className="w-full max-w-sm py-3 rounded-full bg-foreground text-background text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
      >
        Save
      </button>
    </div>
  );
};

export default ProfileTab;