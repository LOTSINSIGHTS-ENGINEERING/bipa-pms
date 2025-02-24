import React, { createContext, useState } from 'react';

interface IScoreContextValue {
  averageValueScores: { [key: string]: number };
  averageLeadershipScores: { [key: string]: number };
  averageProjectScores: { [key: string]: number };
  averageServiceScores: { [key: string]: number };
  averageCommitteeScores: { [key: string]: number };
  setScores: (
    valueScores: { [key: string]: number },
    leadershipScores: { [key: string]: number },
    projectScores: { [key: string]: number },
    serviceScores: { [key: string]: number },
    committeeScores: { [key: string]: number }
  ) => void;
}

export const ScoreContext = createContext<IScoreContextValue | undefined>(undefined);

interface ScoreProviderProps {
  children: React.ReactNode;
}

export const ScoreProvider: React.FC<ScoreProviderProps> = ({ children }) => {
  const [averageValueScores, setAverageValueScores] = useState<{ [key: string]: number }>({});
  const [averageLeadershipScores, setAverageLeadershipScores] = useState<{ [key: string]: number }>({});
  const [averageProjectScores, setAverageProjectScores] = useState<{ [key: string]: number }>({});
  const [averageServiceScores, setAverageServiceScores] = useState<{ [key: string]: number }>({});
  const [averageCommitteeScores, setAverageCommitteeScores] = useState<{ [key: string]: number }>({});

  const setScores = (
    valueScores: { [key: string]: number },
    leadershipScores: { [key: string]: number },
    projectScores: { [key: string]: number },
    serviceScores: { [key: string]: number },
    committeeScores: { [key: string]: number }
  ) => {
    setAverageValueScores(valueScores);
    setAverageLeadershipScores(leadershipScores);
    setAverageProjectScores(projectScores);
    setAverageServiceScores(serviceScores);
    setAverageCommitteeScores(committeeScores);
  };

  const contextValue: IScoreContextValue = {
    averageValueScores,
    averageLeadershipScores,
    averageProjectScores,
    averageServiceScores,
    averageCommitteeScores,
    setScores,
  };

  return <ScoreContext.Provider value={contextValue}>{children}</ScoreContext.Provider>;
};