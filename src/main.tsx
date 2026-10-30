import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { startStorage } from "@/features/storage";
import "@/styles/tokens.css";
import "@/styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("index.html에 #root 요소가 없다.");
}

startStorage(); // 저장된 데이터를 먼저 불러와 첫 화면부터 그 데이터로 그린다
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
