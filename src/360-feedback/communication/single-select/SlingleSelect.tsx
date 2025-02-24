import React, { useState } from 'react'; 
import Select, { SingleValue } from "react-select";
import "./single.scss"; 
import searchIcon from "../assets/search.png"; 
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";

export interface IOption {
  value: string;
  label: string;
  color?: string;
  isDisabled?: boolean;
}

export interface IGroupedOption {
  label: string;
  options: IOption[];
}

interface IProps {
  readonly isClearable?: boolean;
  readonly isLoading?: boolean;
  readonly isSearchable?: boolean;
  options: IOption[];
  groupedOptions?: IGroupedOption[];
  width?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  hideSelectedOptions?: boolean;
  valueOption?: IOption;
  onChange: (value: string) => void;
}

const SingleSelect = (props: IProps) => {
  const {
    isClearable = true,
    isLoading = false,
    isSearchable = true,
    required = true,
    hideSelectedOptions = false,
    options,
    groupedOptions,
    width = "50%",
    name = "",
    placeholder = "",
    value,
    onChange,
  } = props;

  const [typing, setTyping] = useState(false); 

  const formatGroupLabel = (data: IGroupedOption) => (
    <div className="grouped-label">
      <span>{data.label}</span>
      <span className="grouped-badge">{data.options.length}</span>
    </div>
  );

  const getValue = () => {
    if (!value) return;
    return options.find((option) => option.value === value);
  };

  const handleChange = (current: SingleValue<IOption>, actionMeta: any) => {
    if (!current && actionMeta && actionMeta.action === "clear") onChange("");
    if (current) onChange(current.value); // TODO: remove on if-onChange
  };

  const handleInputChange = (inputValue: string) => {
    // Set typing state based on whether inputValue is empty
    setTyping(inputValue !== '');
  };

  if (groupedOptions) {
    return (
      <ErrorBoundary>
        <div style={{ width }}>
          <ErrorBoundary>
            <Select<IOption, false, IGroupedOption>
              className="single-select"
              classNamePrefix="select"
              isLoading={isLoading}
              isClearable={isClearable}
              isSearchable={isSearchable}
              defaultValue={options[1]}
              onChange={handleChange}
              value={getValue()}
              name={name}
              options={groupedOptions}
              formatGroupLabel={formatGroupLabel}
              placeholder={placeholder}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <div id="hidden-input">
              <input
                className="uk-input"
                id={`single-select-${name}`}
                defaultValue={value}
                type="text"
                required={required}
              />
            </div>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="single-select-container" style={{ width }}>
        <ErrorBoundary>
          <Select
            className="single-select"
            classNamePrefix="select"
            isLoading={isLoading}
            isClearable={isClearable}
            isSearchable={isSearchable}
            hideSelectedOptions={hideSelectedOptions}
            onChange={handleChange}
            onInputChange={handleInputChange} 
            value={getValue()}
            name={name}
            options={options}
            placeholder="Search..."
          />
        </ErrorBoundary>
        {!getValue() && !typing && <img src={searchIcon} alt="Search" className="search-icon" />}
      </div>
    </ErrorBoundary>
  );
};

export default SingleSelect;
