import React, { createContext, useContext, useState } from "react";

const DeveloperContext = createContext(null);

export function DeveloperProvider({ children }) {
  const [developerProfile, setDeveloperProfile] = useState({
    stage1: null,
    stage2: null,
    stage3: null,
    stage4: null,
    stage5: null
  });

  const updateStage = (stageKey, data) => {
    setDeveloperProfile((prev) => ({ ...prev, [stageKey]: data }));
  };

  return (
    <DeveloperContext.Provider value={{ developerProfile, updateStage }}>
      {children}
    </DeveloperContext.Provider>
  );
}

export function useDeveloper() {
  return useContext(DeveloperContext);
}
