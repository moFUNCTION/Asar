import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AppwriteProvider } from "@repo/react-appwrite";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer App Entry
// Port 3004
// =============================================================

const endpoint =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const project =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "6ad1c66c0017b63ab8cc";
const databaseId =
  import.meta.env.VITE_APPWRITE_DATABASE_ID || "asar-db";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <AppwriteProvider
        endpoint={endpoint}
        project={project}
        databaseId={databaseId}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppwriteProvider>
    </ChakraProvider>
  </React.StrictMode>
);
