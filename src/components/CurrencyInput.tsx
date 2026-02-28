import { useCallback, useState } from "react";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

const CurrencyInput = ({ label, value, onChange, placeholder = "0" }: CurrencyInputProps) => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      onChange(raw === "" ? 0 : parseInt(raw, 10));
    },
    [onChange]
  );

  const displayValue = value > 0 ? value.toLocaleString("en-IN") : "";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium transition-colors duration-200 ${focused ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </label>
      <div className="relative">
        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${focused ? "text-foreground" : "text-muted-foreground"}`}>
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-input border border-border px-4 py-3 pl-8 text-foreground text-base font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring focus:border-foreground/20 transition-all duration-200"
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
