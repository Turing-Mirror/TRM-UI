import { createContext } from "react";

/** A moving parent owns the motion; its content is already at its final state. */
export const StaticMotionContext = createContext(false);
