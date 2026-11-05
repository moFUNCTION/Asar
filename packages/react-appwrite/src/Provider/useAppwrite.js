import { useContext } from "react";
import { AppwriteContext } from "./AppwriteContext";
export const useAppwrite = () => {
    const context = useContext(AppwriteContext);
    if (!context) {
        throw new Error("useAppwrite must be used within an <AppwriteProvider>. Please wrap your application in <AppwriteProvider>.");
    }
    return context;
};
