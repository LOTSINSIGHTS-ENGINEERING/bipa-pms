import React from "react";
import Select from "react-select";

// const customStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     backgroundColor: "#f5f5f5", // Light grey background
//     borderRadius: "10px", // Rounded corners
//     boxShadow: state.isFocused ? "0 0 0 1px #007bff" : null, // Focused border color
//     borderColor: state.isFocused ? "#007bff" : "#ccc", // Default border color
//     "&:hover": {
//       borderColor: "#007bff", // Hover border color
//     },
//     width: "30%", // Dropdown width
//     marginLeft: "0%",
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected
//       ? "#007bff" // Selected option background
//       : state.isFocused
//       ? "#000" // Hover background color (black)
//       : "transparent", // Default background
//     color: state.isSelected || state.isFocused ? "#fff" : "#333", // Text color
//     cursor: "pointer",
//   }),
//   singleValue: (provided) => ({
//     ...provided,
//     color: "#333", // Selected value text color
//   }),
//   menu: (provided) => ({
//     ...provided,
//     width: "30%", // Dropdown menu width
//   }),
//   menuList: (provided) => ({
//     ...provided,
//     padding: 0, // Remove default padding for dropdown items
//   }),
// };

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#f5f5f5", // Light grey background
    borderRadius: "10px", // Rounded corners
    boxShadow: state.isFocused ? "0 0 0 1px #007bff" : null, // Focused border color
    borderColor: state.isFocused ? "#007bff" : "#ccc", // Default border color
    "&:hover": {
      borderColor: "#000", // Hover border color (black)
    },
    width: "30%", // Dropdown width
    marginLeft: "0%",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#007bff" // Selected option background
      : state.isFocused
      ? "#000" // Hover background color (black)
      : "transparent", // Default background
    color: state.isSelected || state.isFocused ? "#fff" : "#333", // Text color
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#333", // Selected value text color
  }),
  menu: (provided) => ({
    ...provided,
    width: "30%", // Dropdown menu width
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0, // Remove default padding for dropdown items
  }),
};

const SingleSelect = ({ options, value, onChange, placeholder, label }) => {
  return (
    <div>
      <label
        className="uk-form-label"
        htmlFor={label}
        style={{ marginLeft: "0%" }}>
        {label}
      </label>
      <Select
        options={options}
        value={value}
        onChange={(selectedOption) => onChange(selectedOption.value)} // Pass the UID of the selected user
        placeholder={placeholder}
        styles={customStyles}
        id={label} // Set the id attribute using the label prop
      />
    </div>
  );
};

export default SingleSelect;
