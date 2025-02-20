import React from 'react';
import './ButtonSecondary.scss'; // Import the SCSS file

// Define the types for onClick
type OnClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;

interface ButtonProps {
  icon?: string;
  text: string;
  onClick?: OnClickHandler; // Make onClick optional and accept either sync or async handlers
  className?: string;
  iconSize?: string; // Optional: allows customization of icon size
  buttonType?: 'dark-theme' | 'light-theme' | 'danger'; // Define your button types
  type?: 'button' | 'submit'; // To specify button type (e.g., 'button' or 'submit')
  disabled?: boolean; // Add disabled property to handle disabling the button
}

const ButtonSecondary: React.FC<ButtonProps> = ({
  icon,
  text,
  onClick = () => {}, // Default to a no-op if no onClick is provided
  className = '',
  iconSize = '.8',
  buttonType = 'primary', // Default to 'primary' button type
  type = 'button', // Default to 'button'
  disabled = false, // Default to false if not provided
}) => {
  return (
    <button
      className={`btn btn-${buttonType} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled} // Apply the disabled property here
    >
   
      {text}
      {icon && (
        <span
          data-uk-icon={`icon: ${icon}; ratio:${iconSize}`}
          className="uk-margin-right"
        ></span>
      )}
    </button>
  );
};

export default ButtonSecondary;
