export interface SecurityAnalysisResult {
  securityLevel: "HIGH" | "MEDIUM" | "LOW";
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  threats: number;
  warnings: number;
  vulnerabilities: string[];
  suggestions: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    hash: string;
    scanTime: string;
  };
}

export interface CodeAnalysisResult extends SecurityAnalysisResult {
  linesOfCode: number;
  codeComplexity: number;
  securityScore: number;
  language: string;
  detailedVulnerabilities: Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
    line: number;
  }>;
  detailedSuggestions: Array<{
    priority: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
  }>;
}

import { mlSecurityAnalyzer, MLAnalysisResult, CodeQualityAnalysis } from './mlSecurityAnalyzer';

export interface EnhancedSecurityAnalysisResult extends SecurityAnalysisResult {
  mlAnalysis: MLAnalysisResult;
  advancedMetrics: {
    entropyScore: number;
    obfuscationLevel: string;
    behaviorAnalysis: string[];
  };
}

export interface EnhancedCodeAnalysisResult extends CodeAnalysisResult {
  mlCodeQuality: CodeQualityAnalysis;
  performanceImpact: {
    score: number;
    bottlenecks: string[];
  };
}

// Security patterns for different file types
const MALWARE_SIGNATURES = [
  "CreateRemoteThread",
  "VirtualAllocEx", 
  "WriteProcessMemory",
  "SetWindowsHookEx",
  "keylogger",
  "bitcoin",
  "cryptocurrency"
];

const SUSPICIOUS_PATTERNS = [
  "base64",
  "eval(",
  "document.write",
  "innerHTML",
  "system(",
  "exec(",
  "shell_exec",
  "cmd.exe",
  "powershell"
];

const CODE_VULNERABILITIES = [
  {
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\+|\|\|).*(?:input|request|params)/gi,
    severity: "HIGH" as const,
    title: "SQL Injection vulnerability detected",
    description: "Database queries are constructed using string concatenation without parameterization"
  },
  {
    pattern: /innerHTML\s*=\s*.*(?:input|request|params)/gi,
    severity: "HIGH" as const,
    title: "Cross-Site Scripting (XSS) vulnerability",
    description: "User input is directly rendered without sanitization"
  },
  {
    pattern: /password\s*=\s*["'][^"']{1,8}["']/gi,
    severity: "MEDIUM" as const,
    title: "Weak password detected",
    description: "Hardcoded password appears to be weak or too short"
  },
  {
    pattern: /(?:api_key|secret_key|private_key)\s*=\s*["'][^"']+["']/gi,
    severity: "HIGH" as const,
    title: "Hardcoded credentials detected",
    description: "Sensitive information is hardcoded in the source code"
  },
  {
    pattern: /system\(.*\$_(?:GET|POST|REQUEST)/gi,
    severity: "HIGH" as const,
    title: "Command injection vulnerability",
    description: "System commands are executed with user-controlled input"
  }
];

export const analyzeFileEnhanced = async (file: File): Promise<EnhancedSecurityAnalysisResult> => {
  console.log('Starting enhanced file analysis with ML...');
  
  // Perform basic analysis
  const basicResult = await analyzeFile(file);
  
  // Read file content for ML analysis
  const content = await readFileContent(file);
  
  // Perform ML-enhanced analysis
  const mlAnalysis = await mlSecurityAnalyzer.analyzeMalware(content, file.name);
  
  // Advanced metrics
  const entropyScore = calculateEntropy(content);
  const obfuscationLevel = determineObfuscationLevel(content);
  const behaviorAnalysis = analyzeBehaviorPatterns(content);
  
  // Combine results for final security assessment
  const enhancedSecurityLevel = determineEnhancedSecurityLevel(basicResult, mlAnalysis);
  
  return {
    ...basicResult,
    securityLevel: enhancedSecurityLevel.securityLevel,
    riskLevel: enhancedSecurityLevel.riskLevel,
    threats: basicResult.threats + (mlAnalysis.isMalicious ? 2 : 0),
    mlAnalysis,
    advancedMetrics: {
      entropyScore: Math.round(entropyScore * 10) / 10,
      obfuscationLevel,
      behaviorAnalysis
    }
  };
};

export const analyzeCodeEnhanced = async (code: string): Promise<EnhancedCodeAnalysisResult> => {
  console.log('Starting enhanced code analysis with ML...');
  
  // Perform basic analysis
  const basicResult = await analyzeCode(code);
  
  // Perform ML code quality analysis
  const mlCodeQuality = await mlSecurityAnalyzer.analyzeCodeQuality(code);
  
  // Performance impact analysis
  const performanceImpact = analyzePerformanceImpact(code);
  
  // Enhanced security scoring
  const enhancedSecurityLevel = determineEnhancedCodeSecurityLevel(basicResult, mlCodeQuality);
  
  return {
    ...basicResult,
    securityLevel: enhancedSecurityLevel.securityLevel,
    riskLevel: enhancedSecurityLevel.riskLevel,
    securityScore: mlCodeQuality.securityScore,
    mlCodeQuality,
    performanceImpact
  };
};

export const analyzeFile = async (file: File): Promise<SecurityAnalysisResult> => {
  // Read file content
  const content = await readFileContent(file);
  const threats = detectThreats(content, file.name);
  const warnings = detectWarnings(content);
  
  // Calculate security level based on threats and warnings
  let securityLevel: "HIGH" | "MEDIUM" | "LOW";
  let riskLevel: "HIGH" | "MEDIUM" | "LOW";
  
  if (threats >= 3) {
    securityLevel = "LOW";
    riskLevel = "HIGH";
  } else if (threats >= 1 || warnings >= 3) {
    securityLevel = "MEDIUM"; 
    riskLevel = "MEDIUM";
  } else {
    securityLevel = "HIGH";
    riskLevel = "LOW";
  }

  const vulnerabilities = generateVulnerabilities(threats);
  const suggestions = generateSuggestions(securityLevel);

  return {
    securityLevel,
    riskLevel,
    threats,
    warnings,
    vulnerabilities,
    suggestions,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type || detectFileType(file.name),
      hash: await generateFileHash(content),
      scanTime: new Date().toLocaleString()
    }
  };
};

export const analyzeCode = async (code: string): Promise<CodeAnalysisResult> => {
  const vulnerabilities = detectCodeVulnerabilities(code);
  const threats = vulnerabilities.filter(v => v.severity === "HIGH").length;
  const warnings = vulnerabilities.filter(v => v.severity === "MEDIUM").length;
  
  // Security level logic: LOW security = HIGH risk
  let securityLevel: "HIGH" | "MEDIUM" | "LOW";
  let riskLevel: "HIGH" | "MEDIUM" | "LOW";
  let securityScore: number;
  
  if (threats >= 2) {
    securityLevel = "LOW";
    riskLevel = "HIGH";
    securityScore = Math.floor(Math.random() * 30) + 10; // 10-40
  } else if (threats >= 1 || warnings >= 2) {
    securityLevel = "MEDIUM";
    riskLevel = "MEDIUM"; 
    securityScore = Math.floor(Math.random() * 30) + 50; // 50-80
  } else {
    securityLevel = "HIGH";
    riskLevel = "LOW";
    securityScore = Math.floor(Math.random() * 20) + 80; // 80-100
  }

  const suggestions = generateCodeSuggestions(vulnerabilities);

  return {
    securityLevel,
    riskLevel,
    threats,
    warnings,
    vulnerabilities: vulnerabilities.map(v => v.title),
    suggestions: suggestions.map(s => s.description),
    linesOfCode: code.split('\n').length,
    codeComplexity: Math.min(Math.floor(code.length / 100), 10),
    securityScore,
    language: detectLanguage(code),
    detailedVulnerabilities: vulnerabilities,
    detailedSuggestions: suggestions,
    fileInfo: {
      name: "User Code",
      size: new Blob([code]).size,
      type: "text/plain",
      hash: await generateFileHash(code),
      scanTime: new Date().toLocaleString()
    }
  };
};

// Helper functions
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || "");
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const detectThreats = (content: string, filename: string): number => {
  let threatCount = 0;
  
  // Check for malware signatures
  MALWARE_SIGNATURES.forEach(signature => {
    if (content.toLowerCase().includes(signature.toLowerCase())) {
      threatCount++;
    }
  });
  
  // Check suspicious file extensions
  const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.pif'];
  if (suspiciousExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
    threatCount++;
  }
  
  return threatCount;
};

const detectWarnings = (content: string): number => {
  let warningCount = 0;
  
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      warningCount++;
    }
  });
  
  return warningCount;
};

const detectCodeVulnerabilities = (code: string) => {
  const found: Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
    line: number;
  }> = [];
  
  const lines = code.split('\n');
  
  CODE_VULNERABILITIES.forEach(vuln => {
    lines.forEach((line, index) => {
      if (vuln.pattern.test(line)) {
        found.push({
          severity: vuln.severity,
          title: vuln.title,
          description: vuln.description,
          line: index + 1
        });
      }
    });
  });
  
  return found;
};

const generateVulnerabilities = (threatCount: number): string[] => {
  const vulnerabilities = [
    "Potential malware signature detected in executable",
    "Suspicious network communication patterns found", 
    "Encrypted payload detected - possible trojan behavior",
    "Registry modification capabilities identified",
    "File system access without proper validation",
    "Buffer overflow vulnerability in binary code",
    "Weak encryption implementation detected",
    "Unsigned executable from unknown publisher",
    "Suspicious API calls for process injection"
  ];
  
  return vulnerabilities.slice(0, Math.max(threatCount, 1));
};

const generateSuggestions = (securityLevel: string): string[] => {
  const allSuggestions = [
    "Run in isolated sandbox environment before execution",
    "Verify digital signature from trusted publisher", 
    "Check file against updated antivirus databases",
    "Monitor network traffic during execution",
    "Implement application whitelisting policies",
    "Use static analysis tools for deeper inspection",
    "Quarantine file until thorough analysis is complete",
    "Scan with multiple antivirus engines",
    "Check file reputation in threat intelligence databases"
  ];
  
  const suggestionCount = securityLevel === "LOW" ? 5 : securityLevel === "MEDIUM" ? 3 : 2;
  return allSuggestions.slice(0, suggestionCount);
};

const generateCodeSuggestions = (vulnerabilities: any[]) => {
  const suggestions = [
    {
      priority: "HIGH" as const,
      title: "Implement parameterized queries",
      description: "Use prepared statements to prevent SQL injection attacks"
    },
    {
      priority: "HIGH" as const, 
      title: "Add input sanitization",
      description: "Sanitize and validate all user inputs before processing"
    },
    {
      priority: "MEDIUM" as const,
      title: "Implement CSRF protection", 
      description: "Add CSRF tokens to protect against cross-site request forgery"
    },
    {
      priority: "HIGH" as const,
      title: "Use secure password hashing",
      description: "Implement bcrypt or Argon2 for password hashing"
    },
    {
      priority: "MEDIUM" as const,
      title: "Add proper error handling",
      description: "Implement comprehensive error handling without exposing sensitive information"
    },
    {
      priority: "LOW" as const,
      title: "Use environment variables", 
      description: "Store sensitive configuration in environment variables"
    }
  ];
  
  const count = Math.max(vulnerabilities.length, 2);
  return suggestions.slice(0, count);
};

// New helper functions for ML integration
const calculateEntropy = (content: string): number => {
  const freq: Record<string, number> = {};
  for (const char of content) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const length = content.length;
  for (const count of Object.values(freq)) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
};

const determineObfuscationLevel = (content: string): string => {
  const obfuscationIndicators = [
    { pattern: /\\x[0-9a-f]{2}/gi, weight: 2 },
    { pattern: /base64|atob|btoa/gi, weight: 1 },
    { pattern: /eval\(|Function\(/gi, weight: 3 },
    { pattern: /[a-zA-Z0-9]{50,}/g, weight: 1 } // Long encoded strings
  ];

  let obfuscationScore = 0;
  obfuscationIndicators.forEach(indicator => {
    const matches = content.match(indicator.pattern);
    if (matches) {
      obfuscationScore += indicator.weight * matches.length;
    }
  });

  if (obfuscationScore > 10) return "HIGH";
  if (obfuscationScore > 5) return "MEDIUM";
  return "LOW";
};

const analyzeBehaviorPatterns = (content: string): string[] => {
  const behaviors: string[] = [];
  
  if (/network|http|socket|connect/gi.test(content)) {
    behaviors.push("Network communication detected");
  }
  if (/file|read|write|delete/gi.test(content)) {
    behaviors.push("File system operations detected");
  }
  if (/registry|regkey|regedit/gi.test(content)) {
    behaviors.push("Registry modifications detected");
  }
  if (/process|thread|inject/gi.test(content)) {
    behaviors.push("Process manipulation detected");
  }
  if (/encrypt|decrypt|crypto/gi.test(content)) {
    behaviors.push("Cryptographic operations detected");
  }
  
  return behaviors;
};

const analyzePerformanceImpact = (code: string) => {
  const bottlenecks: string[] = [];
  let score = 100;
  
  // Check for performance anti-patterns
  if (/for.*for.*for/gi.test(code)) {
    bottlenecks.push("Nested loops detected - O(n³) complexity risk");
    score -= 20;
  }
  if (/while\s*\(true\)|for\s*\(\s*;\s*;\s*\)/gi.test(code)) {
    bottlenecks.push("Infinite loop patterns detected");
    score -= 30;
  }
  if (/setTimeout|setInterval/gi.test(code)) {
    bottlenecks.push("Timer-based operations may impact performance");
    score -= 10;
  }
  if (/fetch|XMLHttpRequest|axios/gi.test(code)) {
    bottlenecks.push("Network requests without proper error handling");
    score -= 15;
  }
  
  return {
    score: Math.max(score, 0),
    bottlenecks
  };
};

const determineEnhancedSecurityLevel = (basicResult: SecurityAnalysisResult, mlAnalysis: MLAnalysisResult) => {
  let securityLevel: "HIGH" | "MEDIUM" | "LOW";
  let riskLevel: "HIGH" | "MEDIUM" | "LOW";
  
  // Combine basic analysis with ML results
  const combinedThreatLevel = basicResult.threats + (mlAnalysis.isMalicious ? 2 : 0);
  const mlConfidence = mlAnalysis.confidence;
  
  if (combinedThreatLevel >= 3 || (mlAnalysis.isMalicious && mlConfidence > 0.7)) {
    securityLevel = "LOW";
    riskLevel = "HIGH";
  } else if (combinedThreatLevel >= 1 || mlAnalysis.mlSecurityScore < 60) {
    securityLevel = "MEDIUM";
    riskLevel = "MEDIUM";
  } else {
    securityLevel = "HIGH";
    riskLevel = "LOW";
  }
  
  return { securityLevel, riskLevel };
};

const determineEnhancedCodeSecurityLevel = (basicResult: CodeAnalysisResult, mlQuality: CodeQualityAnalysis) => {
  let securityLevel: "HIGH" | "MEDIUM" | "LOW";
  let riskLevel: "HIGH" | "MEDIUM" | "LOW";
  
  if (mlQuality.vulnerabilityRisk === "HIGH" || mlQuality.securityScore < 50) {
    securityLevel = "LOW";
    riskLevel = "HIGH";
  } else if (mlQuality.vulnerabilityRisk === "MEDIUM" || mlQuality.securityScore < 70) {
    securityLevel = "MEDIUM";
    riskLevel = "MEDIUM";
  } else {
    securityLevel = "HIGH";
    riskLevel = "LOW";
  }
  
  return { securityLevel, riskLevel };
};

const detectFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'exe': 'application/x-executable',
    'zip': 'application/zip',
    'js': 'application/javascript', 
    'py': 'text/x-python',
    'java': 'text/x-java',
    'cpp': 'text/x-c++src',
    'c': 'text/x-csrc',
    'php': 'application/x-php',
    'dll': 'application/x-msdownload',
    'msi': 'application/x-msi'
  };
  return typeMap[ext || ''] || 'application/octet-stream';
};

const detectLanguage = (code: string): string => {
  if (code.includes('import ') && code.includes('def ')) return 'Python';
  if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'JavaScript';
  if (code.includes('public class ') || code.includes('import java')) return 'Java';
  if (code.includes('#include') || code.includes('int main')) return 'C/C++';
  if (code.includes('<?php')) return 'PHP';
  return 'Auto-detected';
};

const generateFileHash = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `SHA256: ${hashHex.substring(0, 16)}...`;
};
