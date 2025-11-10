const TextAreaField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1 dark:text-white/83">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full border border-gray-300 p-2 rounded-lg dark:bg-[#3A3B3C] dark:border-slate-600"
    />
  </div>
);

export default TextAreaField;
