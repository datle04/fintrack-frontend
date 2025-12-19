import React from "react";
import { ChevronDown } from "lucide-react";

const FilterSelect = ({
  value,
  onChange,
  name,
  options,
  placeholder,
  icon: Icon,
}) => {
  return (
    <div className="relative min-w-[150px] flex-1">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full appearance-none cursor-pointer
          bg-white dark:bg-[#3a3a41] 
          border border-gray-200 dark:border-gray-600 
          text-gray-700 dark:text-white 
          py-2.5 pl-4 pr-10 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
          text-sm transition-all
        "
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <ChevronDown size={14} />
      </div>
    </div>
  );
};

export default FilterSelect;
