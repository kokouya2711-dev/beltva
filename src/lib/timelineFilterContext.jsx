import { createContext, useContext, useState } from "react";

const Ctx = createContext({ filter: "all", setFilter: () => {} });

export function TimelineFilterProvider({ children }) {
  const [filter, setFilter] = useState("all");
  return <Ctx.Provider value={{ filter, setFilter }}>{children}</Ctx.Provider>;
}

export function useTimelineFilter() {
  return useContext(Ctx);
}