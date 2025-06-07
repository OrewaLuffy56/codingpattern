import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Shield, FileSearch, AlertTriangle, CheckCircle, Bug, Info } from "lucide-react";
import { analyzeFileEnhanced, EnhancedSecurityAnalysisResult } from "@/utils/securityAnalyzer";

const FileScanner = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<EnhancedSecurityAnalysisResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const startScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    // Enhanced scanning process with ML
    const totalSteps = 100;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5; // Slower progress for ML processing
      });
    }, 60);

    try {
      // Perform enhanced ML analysis
      const result = await analyzeFileEnhanced(selectedFile);
      
      // Wait for progress to complete
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
      }, 6500); // Longer processing time for ML
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      setIsScanning(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH": return "text-red-400";
      case "MEDIUM": return "text-yellow-400";
      case "LOW": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="bg-gray-800 border-green-600">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono flex items-center">
            <FileSearch className="w-5 h-5 mr-2" />
            File Upload & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              onChange={handleFileSelect}
              accept=".exe,.zip,.js,.py,.java,.cpp,.c,.php,.dll,.msi,.txt,.bat,.cmd,.scr"
              className="bg-gray-700 border-green-600 text-green-400 file:bg-green-600 file:text-black file:border-0 file:font-mono"
            />
            <p className="text-sm text-green-300 mt-2 font-mono">
              Supported formats: EXE, ZIP, JS, PY, JAVA, CPP, C, PHP, DLL, MSI, TXT, BAT, CMD, SCR
            </p>
          </div>

          {selectedFile && (
            <div className="bg-gray-700 p-4 rounded border border-green-600">
              <p className="text-green-400 font-mono">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}

          <Button
            onClick={startScan}
            disabled={!selectedFile || isScanning}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
          >
            {isScanning ? "SCANNING..." : "START SECURITY SCAN"}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Progress Bar */}
      {isScanning && (
        <Card className="bg-gray-800 border-green-600">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-green-400 font-mono">
                <span>ML-Enhanced Security Scan</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="bg-gray-700" />
              <div className="text-center text-green-300 font-mono text-sm animate-pulse">
                {scanProgress < 20 ? "Initializing ML models..." :
                 scanProgress < 40 ? "Analyzing file structure..." :
                 scanProgress < 60 ? "Running ML malware detection..." :
                 scanProgress < 80 ? "Performing anomaly detection..." :
                 "Generating comprehensive report..."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Scan Results */}
      {scanResult && (
        <div className="space-y-6">
          {/* ML Analysis Summary */}
          <Card className="bg-gray-800 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                ML Security Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded border ${scanResult.mlAnalysis.isMalicious ? 'bg-red-900/30 border-red-600' : 'bg-green-900/30 border-green-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Malware Detection</span>
                    <span className={`font-mono font-bold ${scanResult.mlAnalysis.isMalicious ? 'text-red-400' : 'text-green-400'}`}>
                      {scanResult.mlAnalysis.isMalicious ? 'DETECTED' : 'CLEAN'}
                    </span>
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    Confidence: {Math.round(scanResult.mlAnalysis.confidence * 100)}%
                  </div>
                </div>
                <div className="bg-blue-900/30 p-4 rounded border border-blue-600">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">ML Security Score</span>
                    <span className={`font-mono font-bold ${scanResult.mlAnalysis.mlSecurityScore > 70 ? 'text-green-400' : 'text-red-400'}`}>
                      {scanResult.mlAnalysis.mlSecurityScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics */}
              <div className="bg-gray-700 p-4 rounded border border-green-600">
                <h4 className="font-mono text-green-400 mb-3">Advanced Analysis Metrics</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-300">Entropy Score:</span>
                    <span className="text-green-400">{scanResult.advancedMetrics.entropyScore}/8.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Obfuscation Level:</span>
                    <span className={`${getRiskColor(scanResult.advancedMetrics.obfuscationLevel)}`}>
                      {scanResult.advancedMetrics.obfuscationLevel}
                    </span>
                  </div>
                  {scanResult.mlAnalysis.anomalyDetection.isAnomaly && (
                    <div className="flex justify-between">
                      <span className="text-green-300">Anomaly Score:</span>
                      <span className="text-yellow-400">{Math.round(scanResult.mlAnalysis.anomalyDetection.anomalyScore * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Behavior Analysis */}
              {scanResult.advancedMetrics.behaviorAnalysis.length > 0 && (
                <div className="bg-yellow-900/20 p-4 rounded border border-yellow-600">
                  <h4 className="font-mono text-yellow-400 mb-2">Behavior Patterns Detected</h4>
                  <ul className="space-y-1">
                    {scanResult.advancedMetrics.behaviorAnalysis.map((behavior, index) => (
                      <li key={index} className="font-mono text-sm text-yellow-300">• {behavior}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Original Summary with enhanced data */}
          <Card className="bg-gray-800 border-green-600">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded border border-green-600">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-300">Security Level</span>
                    <span className={`font-mono font-bold ${getRiskColor(scanResult.securityLevel)}`}>
                      {scanResult.securityLevel}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-green-600">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-300">Risk Level</span>
                    <span className={`font-mono font-bold ${getRiskColor(scanResult.riskLevel)}`}>
                      {scanResult.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded border border-green-600">
                <h4 className="font-mono text-green-400 mb-3">File Information</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-300">File Name:</span>
                    <span className="text-green-400">{scanResult.fileInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">File Type:</span>
                    <span className="text-green-400">{scanResult.fileInfo.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">File Size:</span>
                    <span className="text-green-400">{(scanResult.fileInfo.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">File Hash:</span>
                    <span className="text-green-400 truncate">{scanResult.fileInfo.hash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Scan Time:</span>
                    <span className="text-green-400">{scanResult.fileInfo.scanTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Threats Detected:</span>
                    <span className={scanResult.threats > 0 ? "text-red-400" : "text-green-400"}>
                      {scanResult.threats}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Warnings:</span>
                    <span className={scanResult.warnings > 0 ? "text-yellow-400" : "text-green-400"}>
                      {scanResult.warnings}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced ML Threats */}
          {scanResult.mlAnalysis.threats.length > 0 && (
            <Card className="bg-red-900/20 border-red-600">
              <CardHeader>
                <CardTitle className="text-red-400 font-mono text-lg flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  ML-Detected Threats ({scanResult.mlAnalysis.threats.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scanResult.mlAnalysis.threats.map((threat: string, index: number) => (
                    <li key={index} className="bg-red-900/30 p-3 rounded border border-red-600 text-red-300 font-mono text-sm flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-400 mt-0.5" />
                      {threat}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Anomaly Detection Results */}
          {scanResult.mlAnalysis.anomalyDetection.isAnomaly && (
            <Card className="bg-orange-900/20 border-orange-600">
              <CardHeader>
                <CardTitle className="text-orange-400 font-mono text-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Anomaly Detection Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-orange-300 font-mono text-sm">
                    Suspicious patterns detected that deviate from normal file behavior.
                  </p>
                  <ul className="space-y-2">
                    {scanResult.mlAnalysis.anomalyDetection.suspiciousPatterns.map((pattern, index) => (
                      <li key={index} className="bg-orange-900/30 p-2 rounded border border-orange-600 text-orange-300 font-mono text-sm">
                        • {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vulnerabilities */}
          {scanResult.vulnerabilities.length > 0 && (
            <Card className="bg-red-900/20 border-red-600">
              <CardHeader>
                <CardTitle className="text-red-400 font-mono text-lg flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  Vulnerabilities Detected ({scanResult.vulnerabilities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scanResult.vulnerabilities.map((vuln: string, index: number) => (
                    <li key={index} className="bg-red-900/30 p-3 rounded border border-red-600 text-red-300 font-mono text-sm flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-400 mt-0.5" />
                      {vuln}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvement Suggestions */}
          <Card className="bg-blue-900/20 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono text-lg flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Security Recommendations ({scanResult.suggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {scanResult.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="bg-blue-900/30 p-3 rounded border border-blue-600 text-blue-300 font-mono text-sm flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-400 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Overall Assessment */}
          <Card className={`${scanResult.securityLevel === 'LOW' ? 'bg-red-900/20 border-red-600' : 'bg-green-900/20 border-green-600'}`}>
            <CardContent className="pt-6">
              {scanResult.securityLevel === 'LOW' ? (
                <div className="flex items-center text-red-400 font-mono">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-bold">HIGH RISK DETECTED</p>
                    <p className="text-sm text-red-300">This file poses significant security threats. Exercise extreme caution!</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-green-400 font-mono">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-bold">FILE APPEARS SECURE</p>
                    <p className="text-sm text-green-300">No major security threats detected. File seems safe to use.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FileScanner;
