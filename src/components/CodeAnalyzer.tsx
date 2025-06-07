import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Code, Shield, AlertTriangle, CheckCircle, Bug, Info } from "lucide-react";
import { analyzeCodeEnhanced, EnhancedCodeAnalysisResult } from "@/utils/securityAnalyzer";

const CodeAnalyzer = () => {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<EnhancedCodeAnalysisResult | null>(null);

  const startAnalysis = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    // Enhanced analysis process with ML
    const totalSteps = 100;
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 40);

    try {
      // Perform enhanced ML code analysis
      const result = await analyzeCodeEnhanced(code);
      
      // Wait for progress to complete
      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
      }, 4000);
    } catch (error) {
      console.error('Enhanced code analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  // Custom color logic for security and risk level
  const getSecurityLevelColor = (securityLevel: string, riskLevel: string) => {
    if (securityLevel === "LOW" && riskLevel === "LOW") return "text-red-400";
    if (securityLevel === "HIGH" && riskLevel === "HIGH") return "text-blue-400";
    switch (securityLevel) {
      case "LOW": return "text-red-400";
      case "MEDIUM": return "text-yellow-400";
      case "HIGH": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getRiskColor = (riskLevel: string, securityLevel?: string) => {
    if (securityLevel && securityLevel === "LOW" && riskLevel === "LOW") return "text-blue-400";
    if (securityLevel && securityLevel === "HIGH" && riskLevel === "HIGH") return "text-red-400";
    switch (riskLevel) {
      case "HIGH": return "text-red-400";
      case "MEDIUM": return "text-yellow-400";
      case "LOW": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-900/30 border-red-600 text-red-300";
      case "MEDIUM": return "bg-yellow-900/30 border-yellow-600 text-yellow-300";
      case "LOW": return "bg-blue-900/30 border-blue-600 text-blue-300";
      default: return "bg-gray-900/30 border-gray-600 text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Code Input Section */}
      <Card className="bg-gray-800 border-green-600">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Code Security Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for security analysis..."
              className="min-h-[300px] bg-gray-700 border-green-600 text-green-400 font-mono text-sm"
            />
            <p className="text-sm text-green-300 mt-2 font-mono">
              Supports: JavaScript, Python, Java, C++, PHP, and more
            </p>
          </div>

          <Button
            onClick={startAnalysis}
            disabled={!code.trim() || isAnalyzing}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
          >
            {isAnalyzing ? "ANALYZING..." : "ANALYZE CODE SECURITY"}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Progress Bar */}
      {isAnalyzing && (
        <Card className="bg-gray-800 border-green-600">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-green-400 font-mono">
                <span>ML-Enhanced Code Analysis</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="bg-gray-700" />
              <div className="text-center text-green-300 font-mono text-sm animate-pulse">
                {analysisProgress < 30 ? "Initializing ML models..." :
                 analysisProgress < 60 ? "Analyzing code patterns..." :
                 analysisProgress < 85 ? "Evaluating security & quality..." :
                 "Generating recommendations..."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* ML Code Quality Summary */}
          <Card className="bg-gray-800 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono flex items-center">
                <Code className="w-5 h-5 mr-2" />
                ML Code Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-900/30 p-3 rounded border border-blue-600">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold text-blue-400">
                      {analysisResult.mlCodeQuality.securityScore}
                    </div>
                    <div className="font-mono text-xs text-blue-300">Security Score</div>
                  </div>
                </div>
                <div className="bg-green-900/30 p-3 rounded border border-green-600">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold text-green-400">
                      {analysisResult.mlCodeQuality.maintainabilityScore}
                    </div>
                    <div className="font-mono text-xs text-green-300">Maintainability</div>
                  </div>
                </div>
                <div className="bg-yellow-900/30 p-3 rounded border border-yellow-600">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold text-yellow-400">
                      {analysisResult.mlCodeQuality.complexityScore}
                    </div>
                    <div className="font-mono text-xs text-yellow-300">Complexity</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded border border-green-600">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-green-300">Vulnerability Risk:</span>
                  <span className={`font-mono font-bold px-3 py-1 rounded ${getRiskColor(analysisResult.mlCodeQuality.vulnerabilityRisk)}`}>
                    {analysisResult.mlCodeQuality.vulnerabilityRisk}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Impact Analysis */}
          <Card className="bg-purple-900/20 border-purple-600">
            <CardHeader>
              <CardTitle className="text-purple-400 font-mono flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Performance Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-purple-300">Performance Score:</span>
                  <span className={`font-mono font-bold ${analysisResult.performanceImpact.score > 70 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysisResult.performanceImpact.score}/100
                  </span>
                </div>
                
                {analysisResult.performanceImpact.bottlenecks.length > 0 && (
                  <div>
                    <h4 className="font-mono text-purple-400 mb-2">Performance Bottlenecks:</h4>
                    <ul className="space-y-2">
                      {analysisResult.performanceImpact.bottlenecks.map((bottleneck, index) => (
                        <li key={index} className="bg-purple-900/30 p-2 rounded border border-purple-600 text-purple-300 font-mono text-sm">
                          • {bottleneck}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recommendations */}
          <Card className="bg-blue-900/20 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono text-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ML-Generated Recommendations ({analysisResult.mlCodeQuality.recommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.mlCodeQuality.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-900/30 p-3 rounded border border-blue-600">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-400 mt-0.5" />
                      <span className="font-mono text-sm text-blue-300">{recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
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
                    <span className={`font-mono font-bold ${getSecurityLevelColor(analysisResult.securityLevel, analysisResult.riskLevel)}`}>
                      {analysisResult.securityLevel}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-green-600">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-300">Risk Level</span>
                    <span className={`font-mono font-bold ${getRiskColor(analysisResult.riskLevel, analysisResult.securityLevel)}`}>
                      {analysisResult.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded border border-green-600">
                <h4 className="font-mono text-green-400 mb-3">Code Metrics</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-300">Lines of Code:</span>
                    <span className="text-green-400">{analysisResult.linesOfCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Complexity Score:</span>
                    <span className="text-green-400">{analysisResult.codeComplexity}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Security Score:</span>
                    <span className={analysisResult.securityScore > 70 ? "text-green-400" : "text-red-400"}>
                      {analysisResult.securityScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Language:</span>
                    <span className="text-green-400">{analysisResult.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Analysis Time:</span>
                    <span className="text-green-400">{analysisResult.fileInfo.scanTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Vulnerabilities Found:</span>
                    <span className={analysisResult.detailedVulnerabilities.length > 0 ? "text-red-400" : "text-green-400"}>
                      {analysisResult.detailedVulnerabilities.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Vulnerabilities */}
          {analysisResult.detailedVulnerabilities.length > 0 && (
            <Card className="bg-red-900/20 border-red-600">
              <CardHeader>
                <CardTitle className="text-red-400 font-mono text-lg flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  Vulnerabilities Detected ({analysisResult.detailedVulnerabilities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.detailedVulnerabilities.map((vuln, index: number) => (
                    <div key={index} className={`p-4 rounded border ${getSeverityColor(vuln.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />
                          <span className="font-mono font-bold">{vuln.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-mono ${getRiskColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="font-mono text-sm mb-2">{vuln.description}</p>
                      <p className="font-mono text-xs opacity-75">Line: {vuln.line}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improvement Suggestions */}
          <Card className="bg-blue-900/20 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 font-mono text-lg flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Security Recommendations ({analysisResult.detailedSuggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.detailedSuggestions.map((suggestion, index: number) => (
                  <div key={index} className="bg-blue-900/30 p-4 rounded border border-blue-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-400 mt-0.5" />
                        <span className="font-mono font-bold text-blue-300">{suggestion.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-mono ${getRiskColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-blue-300">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Assessment */}
          <Card className={`${analysisResult.securityLevel === 'LOW' ? 'bg-red-900/20 border-red-600' : 'bg-green-900/20 border-green-600'}`}>
            <CardContent className="pt-6">
              {analysisResult.securityLevel === 'LOW' ? (
                <div className="flex items-center text-red-400 font-mono">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-bold">CRITICAL SECURITY ISSUES DETECTED</p>
                    <p className="text-sm text-red-300">
                      Your code has significant security vulnerabilities that could allow unauthorized access. 
                      Immediate remediation is required before deployment!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-green-400 font-mono">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-bold">CODE SECURITY LOOKS GOOD</p>
                    <p className="text-sm text-green-300">
                      Your code follows good security practices. Consider the recommendations above for further improvement.
                    </p>
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

export default CodeAnalyzer;
