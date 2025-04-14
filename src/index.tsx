import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "./screens/Page";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
