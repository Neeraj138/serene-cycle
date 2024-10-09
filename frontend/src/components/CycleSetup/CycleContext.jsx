import { createContext } from 'preact';
import { useContext, useState } from "preact/hooks";

// Create the context
const CycleContext = createContext();

// Create a provider component
export const CycleProvider = ({ children }) => {
  const [avgCycleLength, setAvgCycleLength] = useState("");
  const [bleedingDays, setBleedingDays] = useState("");
  const [lastPeriod, setLastPeriod] = useState(null);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");

  return (
    <CycleContext.Provider
      value={{
        avgCycleLength,
        setAvgCycleLength,
        bleedingDays,
        setBleedingDays,
        lastPeriod,
        setLastPeriod,
        country,
        setCountry,
        region,
        setRegion,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
};

// Custom hook to use the CycleContext
export const useCycleContext = () => useContext(CycleContext);