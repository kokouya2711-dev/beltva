import { createContext, useContext, useState } from "react";

const Ctx = createContext({ room: "all", setRoom: () => {}, display: "recommended", setDisplay: () => {} });

export function TimelineFilterProvider({ children }) {
  const [room, setRoom] = useState("all");
  const [display, setDisplay] = useState("recommended");
  return <Ctx.Provider value={{ room, setRoom, display, setDisplay }}>{children}</Ctx.Provider>;
}

export function useTimelineFilter() {
  return useContext(Ctx);
}