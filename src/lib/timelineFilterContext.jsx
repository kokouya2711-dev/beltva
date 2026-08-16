import { createContext, useContext, useState } from "react";

const Ctx = createContext({ filter: "all", setFilter: () => {}, workoutFilter: "", setWorkoutFilter: () => {} });

export function TimelineFilterProvider({ children }) {
  const [filter, setFilter] = useState("all");
  const [workoutFilter, setWorkoutFilter] = useState("");
  return <Ctx.Provider value={{ filter, setFilter, workoutFilter, setWorkoutFilter }}>{children}</Ctx.Provider>;
}

export function useTimelineFilter() {
  return useContext(Ctx);
}