import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AppwriteProvider } from "@repo/react-appwrite";
import App from "./App";
import "./index.css";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const project = import.meta.env.VITE_APPWRITE_PROJECT_ID || "asar-main";
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "asar-db";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <AppwriteProvider endpoint={endpoint} project={project} databaseId={databaseId}>
        <App />
      </AppwriteProvider>
    </ChakraProvider>
  </React.StrictMode>
);
