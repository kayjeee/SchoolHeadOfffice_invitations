import React from "react";
import themeColors from "../utils/themeColors";

const ThemeColorPicker = ({ value, onChange }) => {
  return (
    <div className="mt-4">
      <label className="block mb-2 font-medium">Select Theme Color:</label>
      <div className="flex gap-3 flex-wrap">
        {themeColors.map((color) => (
          <button
            key={color.value}
            className={`w-10 h-10 rounded-full border-2 ${
              value === color.value ? "border-black scale-110" : "border-gray-300"
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => onChange({ target: { value: color.value } })}
            type="button"
          />
        ))}
        {/* Custom color option */}
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="w-10 h-10 rounded-full border-2 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ThemeColorPicker;
