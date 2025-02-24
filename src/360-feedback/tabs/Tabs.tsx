import React, { useState, useEffect, useRef, ReactNode } from "react";
import "./Tabs.scss";

interface DropdownItem {
  label: string;
  onClick: () => void;
}

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  dropdownItems?: DropdownItem[];
  icon?: ReactNode; // New prop for the icon
}

export const Tab: React.FC<TabProps> = ({
  label,
  isActive,
  onClick,
  dropdownItems,
  icon,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTabClick = () => {
    onClick();
    if (dropdownItems) {
      setDropdownOpen((prev) => !prev);
    } else {
      setDropdownOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="tab-wrapper" ref={dropdownRef}>
      <button
        className={`tab-button ${isActive ? "active" : ""}`}
        onClick={handleTabClick}
      >
        {icon && <span className="tab-icon">{icon}</span>}
        {label}
      </button>
      {dropdownItems && isDropdownOpen && (
        <div className="dropdown">
          <ul className="dropdown-menu">
            {dropdownItems.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  item.onClick(); // Execute the item's action
                  setDropdownOpen(false); // Close the dropdown
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
