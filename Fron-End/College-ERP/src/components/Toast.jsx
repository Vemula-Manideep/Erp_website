import React from "react";
import { Alert } from "@material-tailwind/react";

export function Toast({ message, show, type = "info" }) {
  if (!show) return null;
  
  const colorMap = {
    info: "blue",
    success: "green",
    warning: "amber",
    error: "red",
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <Alert color={colorMap[type] || "blue"} className="shadow-lg">
        {message}
      </Alert>
    </div>
  );
}

export default Toast;
