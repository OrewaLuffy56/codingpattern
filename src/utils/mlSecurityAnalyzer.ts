import { pipeline } from '@huggingface/transformers';

export interface MLAnalysisResult {
  isMalicious: boolean;
  confidence: number;
  threats: string[];
  mlSecurityScore: number;
  anomalyDetection: {
    isAnomaly: boolean;
    anomalyScore: number;
    suspiciousPatterns: string[];
  };
}

export interface CodeQualityAnalysis {
  securityScore: number;
  maintainabilityScore: number;
  complexityScore: number;
  vulnerabilityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

interface TextClassifier {
  (input: string): Promise<{ score: number; confidence: number }>;
}

class MLSecurityAnalyzer {
  private textClassifier: TextClassifier | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing ML models...');
      
      // Try WebGPU first
      const classifier: any = await pipeline(
        'text-classification',
        'microsoft/DialoGPT-medium',
        { device: 'webgpu' }
      );
      this.textClassifier = async (input: string) => {
        const result = await classifier(input);
        // Defensive: handle HuggingFace pipeline output
        if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
          return {
            score: result[0].score || 0,
            confidence: result[0].score || 0 // Use score as confidence if not present
          };
        }
        return { score: 0, confidence: 0 };
      };
    } catch (error) {
      console.warn('WebGPU initialization failed, falling back to CPU:', error);
      try {
        // Fallback to CPU
        const cpuClassifier: any = await pipeline(
          'text-classification',
          'microsoft/DialoGPT-medium'
        );
        this.textClassifier = async (input: string) => {
          const result = await cpuClassifier(input);
          if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
            return {
              score: result[0].score || 0,
              confidence: result[0].score || 0
            };
          }
          return { score: 0, confidence: 0 };
        };
      } catch (fallbackError) {
        console.warn('CPU initialization failed, using fallback analysis:', fallbackError);
        this.initialized = false;
        return;
      }
    }

    this.initialized = true;
    console.log('ML models initialized successfully');
  }

  async analyzeMalware(content: string, filename: string): Promise<MLAnalysisResult> {
    await this.initialize();

    // Enhanced pattern-based analysis with ML scoring
    const malwarePatterns = this.detectMalwarePatterns(content, filename);
    const anomalyAnalysis = this.detectAnomalies(content);
    
    let mlScore = 0;
    let confidence = 0;

    if (this.initialized && this.textClassifier) {
      try {
        // Use ML model for content analysis
        const mlResult = await this.performMLAnalysis(content);
        mlScore = mlResult.score;
        confidence = mlResult.confidence;
      } catch (error) {
        console.warn('ML analysis failed, using pattern-based fallback:', error);
      }
    }

    // Combine ML results with pattern-based analysis
    const combinedScore = this.combineScores(malwarePatterns.score, mlScore, anomalyAnalysis.score);
    const isMalicious = combinedScore > 0.6;

    return {
      isMalicious,
      confidence: Math.max(confidence, malwarePatterns.confidence),
      threats: [...malwarePatterns.threats, ...anomalyAnalysis.threats],
      mlSecurityScore: Math.round(combinedScore * 100),
      anomalyDetection: {
        isAnomaly: anomalyAnalysis.isAnomaly,
        anomalyScore: anomalyAnalysis.score,
        suspiciousPatterns: anomalyAnalysis.patterns
      }
    };
  }

  async analyzeCodeQuality(code: string): Promise<CodeQualityAnalysis> {
    await this.initialize();

    const metrics = this.calculateCodeMetrics(code);
    const vulnerabilities = this.detectAdvancedVulnerabilities(code);
    const securityScore = this.calculateSecurityScore(vulnerabilities, metrics);
    
    return {
      securityScore: Math.round(securityScore),
      maintainabilityScore: Math.round(metrics.maintainability),
      complexityScore: Math.round(metrics.complexity),
      vulnerabilityRisk: this.assessVulnerabilityRisk(vulnerabilities),
      recommendations: this.generateMLRecommendations(vulnerabilities, metrics)
    };
  }

  private detectMalwarePatterns(content: string, filename: string) {
    const advancedMalwareSignatures = [
      // Advanced persistent threats
      { pattern: /CreateRemoteThread|VirtualAllocEx|WriteProcessMemory/gi, weight: 0.9, threat: 'Process injection detected' },
      { pattern: /SetWindowsHookEx|keylogger|GetAsyncKeyState/gi, weight: 0.8, threat: 'Keylogging capability detected' },
      { pattern: /bitcoin|cryptocurrency|mining|wallet\.dat/gi, weight: 0.7, threat: 'Cryptocurrency mining/theft detected' },
      { pattern: /ransomware|encrypt.*files|\.locked|\.encrypted/gi, weight: 0.95, threat: 'Ransomware behavior detected' },
      
      // Network threats
      { pattern: /botnet|c2|command.*control|backdoor/gi, weight: 0.85, threat: 'Botnet/C2 communication detected' },
      { pattern: /ddos|denial.*service|flood.*attack/gi, weight: 0.75, threat: 'DDoS capability detected' },
      
      // Data exfiltration
      { pattern: /exfiltrate|steal.*data|send.*password|upload.*file/gi, weight: 0.8, threat: 'Data exfiltration detected' },
      { pattern: /credit.*card|ssn|social.*security|bank.*account/gi, weight: 0.9, threat: 'Financial data harvesting detected' }
    ];

    let totalScore = 0;
    let threatCount = 0;
    const threats: string[] = [];

    advancedMalwareSignatures.forEach(sig => {
      const matches = content.match(sig.pattern);
      if (matches) {
        totalScore += sig.weight * matches.length;
        threatCount += matches.length;
        threats.push(sig.threat);
      }
    });

    // File extension analysis
    const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.pif', '.com'];
    if (suspiciousExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
      totalScore += 0.3;
      threats.push('Suspicious executable file type');
    }

    return {
      score: Math.min(totalScore / 3, 1), // Normalize to 0-1
      confidence: Math.min(threatCount * 0.2, 1),
      threats
    };
  }

  private detectAnomalies(content: string) {
    const anomalyPatterns = [
      // Obfuscation patterns
      { pattern: /\\x[0-9a-f]{2}/gi, weight: 0.6, name: 'Hex encoding obfuscation' },
      { pattern: /base64|atob|btoa/gi, weight: 0.4, name: 'Base64 encoding detected' },
      { pattern: /eval\(|Function\(|setTimeout\(/gi, weight: 0.7, name: 'Dynamic code execution' },
      
      // Suspicious API calls
      { pattern: /RegCreateKey|RegSetValue|RegDeleteKey/gi, weight: 0.8, name: 'Registry manipulation' },
      { pattern: /CreateFile|WriteFile|DeleteFile/gi, weight: 0.5, name: 'File system manipulation' },
      { pattern: /LoadLibrary|GetProcAddress|VirtualAlloc/gi, weight: 0.9, name: 'Dynamic library loading' }
    ];

    let anomalyScore = 0;
    const patterns: string[] = [];
    const threats: string[] = [];

    anomalyPatterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        anomalyScore += pattern.weight * matches.length;
        patterns.push(pattern.name);
        threats.push(`Anomaly detected: ${pattern.name}`);
      }
    });

    // Entropy analysis (simplified)
    const entropy = this.calculateEntropy(content);
    if (entropy > 7) { // High entropy suggests encryption/obfuscation
      anomalyScore += 0.8;
      patterns.push('High entropy content (possible encryption/packing)');
      threats.push('High entropy content detected - possible packed/encrypted malware');
    }

    return {
      score: Math.min(anomalyScore / 5, 1),
      isAnomaly: anomalyScore > 1,
      patterns,
      threats
    };
  }

  private async performMLAnalysis(content: string) {
    if (!this.textClassifier) {
      // Fallback: simple keyword-based scoring if ML model is not available
      const suspiciousKeywords = ['malware', 'virus', 'trojan', 'exploit', 'payload'];
      const keywordCount = suspiciousKeywords.reduce((count, keyword) => 
        count + (content.toLowerCase().match(new RegExp(keyword, 'gi'))?.length || 0), 0
      );
      return {
        score: Math.min(keywordCount * 0.2, 1),
        confidence: Math.min(keywordCount * 0.15, 0.9)
      };
    }
    // If ML model is available, call it and expect a result with score/confidence
    const result = await this.textClassifier(content);
    // Defensive: handle result shape
    if (typeof result === 'object' && 'score' in result && 'confidence' in result) {
      return {
        score: result.score || 0,
        confidence: result.confidence || 0
      };
    }
    // If result is not as expected, fallback
    return { score: 0, confidence: 0 };
  }

  private calculateEntropy(content: string): number {
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
  }

  private combineScores(patternScore: number, mlScore: number, anomalyScore: number): number {
    // Weighted combination of different analysis methods
    return (patternScore * 0.4) + (mlScore * 0.35) + (anomalyScore * 0.25);
  }

  private calculateCodeMetrics(code: string) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    // Complexity analysis
    const complexityIndicators = [
      /if\s*\(/, /else/, /for\s*\(/, /while\s*\(/, /switch\s*\(/,
      /try\s*{/, /catch\s*\(/, /&&/, /\|\|/
    ];
    
    let complexity = 0;
    nonEmptyLines.forEach(line => {
      complexityIndicators.forEach(indicator => {
        if (indicator.test(line)) complexity++;
      });
    });

    // Maintainability factors
    const avgLineLength = nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length;
    const functionCount = (code.match(/function\s+\w+|=>\s*{|def\s+\w+/g) || []).length;
    const commentRatio = (code.match(/\/\/|\/\*|\*/g) || []).length / nonEmptyLines.length;

    return {
      complexity: Math.min((complexity / nonEmptyLines.length) * 50, 100),
      maintainability: Math.max(100 - (avgLineLength * 0.5) - (complexity * 0.3) + (commentRatio * 20), 0)
    };
  }

  private detectAdvancedVulnerabilities(code: string) {
    const advancedVulnerabilities = [
      {
        pattern: /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\+|\|\|).*(?:input|request|params|\$_GET|\$_POST)/gi,
        severity: 'HIGH' as const,
        type: 'SQL Injection',
        impact: 'Database compromise possible'
      },
      {
        pattern: /innerHTML\s*=\s*.*(?:input|request|params|\$_GET|\$_POST)/gi,
        severity: 'HIGH' as const,
        type: 'Cross-Site Scripting (XSS)',
        impact: 'Client-side code execution'
      },
      {
        pattern: /system\(.*\$_(?:GET|POST|REQUEST)|exec\(.*\$_(?:GET|POST|REQUEST)/gi,
        severity: 'HIGH' as const,
        type: 'Command Injection',
        impact: 'Server compromise possible'
      },
      {
        pattern: /(?:api_key|secret_key|private_key|password)\s*=\s*["'][^"']+["']/gi,
        severity: 'MEDIUM' as const,
        type: 'Hardcoded Credentials',
        impact: 'Credential exposure risk'
      },
      {
        pattern: /eval\s*\(|Function\s*\(.*\)/gi,
        severity: 'MEDIUM' as const,
        type: 'Code Injection',
        impact: 'Dynamic code execution risk'
      }
    ];

    const vulnerabilities: any[] = [];
    const lines = code.split('\n');

    advancedVulnerabilities.forEach(vuln => {
      lines.forEach((line, index) => {
        if (vuln.pattern.test(line)) {
          vulnerabilities.push({
            ...vuln,
            line: index + 1,
            code: line.trim()
          });
        }
      });
    });

    return vulnerabilities;
  }

  private calculateSecurityScore(vulnerabilities: any[], metrics: any): number {
    const highSeverityCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumSeverityCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    
    let score = 100;
    score -= highSeverityCount * 25; // High severity vulnerabilities
    score -= mediumSeverityCount * 10; // Medium severity vulnerabilities
    score -= Math.max(0, (metrics.complexity - 50) * 0.5); // Complexity penalty
    
    return Math.max(score, 0);
  }

  private assessVulnerabilityRisk(vulnerabilities: any[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    
    if (highCount >= 2) return 'HIGH';
    if (highCount >= 1 || mediumCount >= 3) return 'MEDIUM';
    return 'LOW';
  }

  private generateMLRecommendations(vulnerabilities: any[], metrics: any): string[] {
    const recommendations: string[] = [];
    
    const vulnTypes = new Set(vulnerabilities.map(v => v.type));
    
    if (vulnTypes.has('SQL Injection')) {
      recommendations.push('Implement parameterized queries and input validation');
    }
    if (vulnTypes.has('Cross-Site Scripting (XSS)')) {
      recommendations.push('Add output encoding and Content Security Policy');
    }
    if (vulnTypes.has('Command Injection')) {
      recommendations.push('Use safe command execution methods and input sanitization');
    }
    if (vulnTypes.has('Hardcoded Credentials')) {
      recommendations.push('Move sensitive data to environment variables or secure vaults');
    }
    
    if (metrics.complexity > 70) {
      recommendations.push('Refactor complex functions to improve maintainability');
    }
    if (metrics.maintainability < 60) {
      recommendations.push('Add documentation and reduce code complexity');
    }
    
    return recommendations;
  }
}

export const mlSecurityAnalyzer = new MLSecurityAnalyzer();