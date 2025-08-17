"use client";

import { createContext, ReactNode, useContext, useState } from "react";

// Define the global context interface
interface GlobalContextType {
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
}

// Create the context with a default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component props
interface GlobalContextProviderProps {
  children: ReactNode;
}

// Provider component
export function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  // Initialize state
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Context value
  const contextValue: GlobalContextType = {
    selectedTool,
    setSelectedTool,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

// Custom hook for consuming the context
export function useGlobalContext(): GlobalContextType {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }

  return context;
}

// Export the context for direct usage if needed
export { GlobalContext };

// Default export for the provider
export default GlobalContextProvider;
