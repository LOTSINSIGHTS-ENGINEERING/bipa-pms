import React from 'react';

interface ProgressBarProps {
  bgcolor: string;
  progress: number;
  height: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ bgcolor, progress, height }) => {
  const containerStyles: React.CSSProperties = {
    height: height,
    backgroundColor: "#e0e0e0",
    borderRadius: 50,
    margin: 5,
    width:240,
  }

  const fillerStyles: React.CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    textAlign: 'right',
    transition: 'width 1s ease-in-out',
  }

  const labelStyles: React.CSSProperties = {
    padding: 5,
    color: 'white',
    fontWeight: 'bold'
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${progress}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;