
import { useState } from "react";
import WelcomePage from "@/components/WelcomePage";
import ScannerDashboard from "@/components/ScannerDashboard";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleEnterCyberspace = () => {
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 overflow-hidden">
      {showWelcome ? (
        <WelcomePage onEnter={handleEnterCyberspace} />
      ) : (
        <ScannerDashboard />
      )}
    </div>
  );
};

export default Index;
