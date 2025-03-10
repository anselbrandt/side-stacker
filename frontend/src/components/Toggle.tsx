import React from "react";

interface Props {
  isChecked: boolean;
  handleChange: () => void;
}

export const Toggle: React.FC<Props> = ({ isChecked, handleChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={isChecked}
        onChange={handleChange}
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-700"></div>
    </label>
  );
};
