import { LoggedPurchase } from "@/lib/engine/financial";

const BASELINE_STORAGE_KEY = "baseline_v1";
const PURCHASE_STORAGE_KEY = "purchaseHistory_v1";
const GOAL_TRACKER_STORAGE_KEY = "goal_tracker_v1";
const GOAL_CONFIG_STORAGE_KEY = "goal_config_v1";
const MONTHLY_GOALS_STORAGE_KEY = "monthly_goals_v1";
const PROFILE_STORAGE_KEY = "profile_v1";

export const storage = {
  getBaseline() {
    const raw = localStorage.getItem(BASELINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setBaseline(data: {
    monthlyIncome: number;
    monthlyExpenses: number;
    currentSavings: number;
  }) {
    localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(data));
  },

  getPurchases(): LoggedPurchase[] {
    const raw = localStorage.getItem(PURCHASE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  setPurchases(data: LoggedPurchase[]) {
    localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(data));
  },

  // ===== GOAL TRACKER =====
  getGoalTracker() {
    const raw = localStorage.getItem(GOAL_TRACKER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  },

  setGoalTracker(data: any) {
    localStorage.setItem(GOAL_TRACKER_STORAGE_KEY, JSON.stringify(data));
  },

  // ===== GOAL CONFIG =====
  getGoalConfig() {
    const raw = localStorage.getItem(GOAL_CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setGoalConfig(data: any) {
    localStorage.setItem(GOAL_CONFIG_STORAGE_KEY, JSON.stringify(data));
  },

  // ===== MONTHLY GOALS =====
  getMonthlyGoals() {
    const raw = localStorage.getItem(MONTHLY_GOALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  setMonthlyGoals(data: any[]) {
    localStorage.setItem(MONTHLY_GOALS_STORAGE_KEY, JSON.stringify(data));
  },

  // ===== PROFILE =====
  getProfile() {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { name: "Guest" };
  },

  setProfile(data: { name: string }) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
  },
};