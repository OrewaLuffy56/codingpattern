import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, Zap, Shield } from "lucide-react";
import CustomLogo from "./downloadsvg.svg";

interface WelcomePageProps {
  onEnter: () => void;
}

const WelcomePage = ({ onEnter }: WelcomePageProps) => {
  const [typedText, setTypedText] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);
  const fullText = "CYBERSPACE";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowMatrix(true), 500);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Droplets background effect (continuous)
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.pointerEvents = "none";
    container.style.zIndex = "1";
    container.className = "droplets-bg";
    document.body.appendChild(container);

    const createDroplet = () => {
      const droplet = document.createElement("span");
      droplet.className = "droplet";
      droplet.textContent = Math.random() > 0.5 ? "0" : "1";
      droplet.style.left = Math.random() * 100 + "vw";
      droplet.style.animationDelay = "0s";
      droplet.style.fontSize = (14 + Math.random() * 10) + "px";
      // Remove droplet after animation ends
      droplet.addEventListener("animationend", () => {
        if (droplet.parentNode) droplet.parentNode.removeChild(droplet);
      });
      container.appendChild(droplet);
    };

    // Create droplets at a regular interval for continuous effect
    const interval = setInterval(() => {
      createDroplet();
    }, 80); // Adjust interval for density

    return () => {
      clearInterval(interval);
      if (container.parentNode) container.parentNode.removeChild(container);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Matrix Rain Background */}
      {showMatrix && (
        <div className="absolute inset-0 opacity-0">
          <div className="matrix-rain"></div>
        </div>
      )}

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-500">
        <div className="grid-lines"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo with Glow Effect */}
        <div className="mb-8">
          <img
            src={CustomLogo}
            alt="Custom Logo"
            className="w-20 h-20 mx-auto text-green-400 animate-pulse glow-effect"
          />
        </div>

        {/* Animated Title */}
         <h1 className="text-6xl md:text-8xl font-mono font-bold mb-4 text-green-400 glow-text border-text">

          {typedText}
        </h1>

        {/* Subtitle with typing effect */}
        <p className="text-xl md:text-2xl font-mono mb-8 text-green-300 opacity-80">
          Advanced Security Scanner & Vulnerability Detector
        </p>
        

        {/* Feature Icons */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="flex flex-col items-center animate-bounce">
            <Terminal className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-sm font-mono">Code Analysis</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: "0.2s" }}>
            <Shield className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-sm font-mono">File Scanning</span>
          </div>
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: "0.4s" }}>
            <Zap className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-sm font-mono">Real-time Detection</span>
          </div>
        </div>

        {/* Enter Button */}
        <Button
          onClick={onEnter}
          className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold px-8 py-4 text-lg border-2 border-green-400 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/50"
        >
          ENTER CYBERSPACE
        </Button>

        {/* Warning Text */}
        <p className="mt-8 text-red-400 font-mono text-sm animate-pulse">
          [AUTHORIZED PERSONNEL ONLY]
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
