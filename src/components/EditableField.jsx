import React from "react";

const EditableField = ({ label, value, onChange, type = "text" }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="
          w-full px-4 py-2.5 
          bg-white dark:bg-[#3a3a41] 
          border border-gray-300 dark:border-gray-600 
          rounded-lg 
          text-gray-800 dark:text-white
          focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
          outline-none transition-all
        "
      />
    </div>
  );
};

export default EditableField;
