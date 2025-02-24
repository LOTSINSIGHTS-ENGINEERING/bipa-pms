import "./QuestionnaireTabs.scss";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const QuestionnaireTab: React.FC<TabProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      className={`tab-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
