import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";
import { DeveloperProvider } from "./context/DeveloperContext";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DeveloperProvider>
      <App />
    </DeveloperProvider>
  </React.StrictMode>
);
