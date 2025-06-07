import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Terminal, FileSearch, Code } from "lucide-react";
import FileScanner from "@/components/FileScanner";
import CodeAnalyzer from "@/components/CodeAnalyzer";
import CustomLogo from "@/components/downloadsvg.svg";

const ScannerDashboard = () => {
  const [activeTab, setActiveTab] = useState("file-scan");

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img src={CustomLogo} alt="Custom Logo" className="w-8 h-8 text-green-400 glow-effect" />
            <h1 className="text-3xl font-mono font-bold text-green-400 glow-text">
              CYBERSPACE SCANNER
            </h1>
          </div>
          <div className="text-sm font-mono text-green-300">
            STATUS: <span className="text-green-400 animate-pulse">ONLINE</span>
          </div>
        </div>

        {/* Main Scanner Interface */}
        <Card className="bg-gray-900 border-green-600 border-2">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-xl">
              Security Analysis Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-green-600">
                <TabsTrigger 
                  value="file-scan" 
                  className="text-green-400 data-[state=active]:bg-green-600 data-[state=active]:text-black font-mono"
                >
                  <FileSearch className="w-4 h-4 mr-2" />
                  File Scanner
                </TabsTrigger>
                <TabsTrigger 
                  value="code-analyzer" 
                  className="text-green-400 data-[state=active]:bg-green-600 data-[state=active]:text-black font-mono"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code Analyzer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file-scan" className="mt-6">
                <FileScanner />
              </TabsContent>

              <TabsContent value="code-analyzer" className="mt-6">
                <CodeAnalyzer />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScannerDashboard;
