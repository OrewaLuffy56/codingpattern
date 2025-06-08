import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Code, Shield, AlertTriangle, CheckCircle, Bug, Info } from "lucide-react";
import { analyzeCodeEnhanced, EnhancedCodeAnalysisResult } from "@/utils/securityAnalyzer";
import jsPDF from "jspdf";
import downloadSvg from "./downloadsvg.svg";

const CodeAnalyzer = () => {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<EnhancedCodeAnalysisResult | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState("");

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
        setDetectedLanguage(result.language);
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

  const generatePDF = (result: EnhancedCodeAnalysisResult) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', putOnlyUsedFonts: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 60;

    // Draw solid black background
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add SVG watermark (centered, faded) using canvas for opacity
    const svgString = `<?xml version="1.0" encoding="UTF-8"?>\
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="225" height="225">\
    <path d='M0 0 C74.25 0 148.5 0 225 0 C225 74.25 225 148.5 225 225 C150.75 225 76.5 225 0 225 C0 150.75 0 76.5 0 0 Z ' fill='#000000' transform='translate(0,0)'/>\
    <path d='M0 0 C0.33 0 0.66 0 1 0 C1.58535417 11.03911596 2.0263533 22.07441985 2.2953043 33.12602139 C2.424574 38.26179302 2.59891282 43.38679349 2.88598633 48.51635742 C4.91510935 85.71749586 4.91510935 85.71749586 -6.29822254 98.28323841 C-11.64714986 103.82284267 -17.57128145 108.76062196 -24 113 C-24.33 113 -24.66 113 -25 113 C-25.20474001 109.31332998 -25.32809831 105.62813257 -25.4375 101.9375 C-25.49615234 100.89916016 -25.55480469 99.86082031 -25.61523438 98.79101562 C-25.78896754 90.97302325 -25.78896754 90.97302325 -23.42602539 88.05883789 C-22.14874077 86.96288915 -20.86474535 85.87471039 -19.57397461 84.79467773 C-16.51116975 81.30240558 -17.27710273 76.95314393 -17.5625 72.5625 C-17.64301011 70.85680409 -17.72088272 69.15098238 -17.79663086 67.44506836 C-17.83501572 66.60608505 -17.87340057 65.76710175 -17.91294861 64.9026947 C-17.95603905 63.96086082 -17.95603905 63.96086082 -18 63 C-30.3346543 75.4187108 -30.33057915 88.79144344 -30.33491707 105.27667809 C-30.31786998 108.67512908 -30.26934803 112.07279001 -30.21887207 115.47088623 C-30.16619651 119.8223587 -30.17683795 124.17366924 -30.18164062 128.52539062 C-30.18193754 137.01798748 -30.11361552 145.50816535 -30 154 C-32.46805259 151.53194741 -33.17278692 149.33393354 -34.42578125 146.07421875 C-34.89306641 144.88505859 -35.36035156 143.69589844 -35.84179688 142.47070312 C-36.57773 140.58351313 -37.30961984 138.69503369 -38.03295898 136.80297852 C-38.73549022 134.97217588 -39.45548845 133.14810655 -40.17578125 131.32421875 C-40.59770752 130.23197998 -41.01963379 129.13974121 -41.4543457 128.0144043 C-43.5275277 123.97119183 -46.25384036 121.13919731 -50.07478333 118.64640808 C-53.26595775 116.23757203 -55.55392309 114.03252863 -56.43814087 110.00363159 C-57.15042816 103.72106349 -56.91608048 97.40287979 -56.78125 91.09375 C-56.76631555 89.04254366 -56.75493422 86.99130864 -56.74694824 84.94006348 C-56.71650907 79.5602234 -56.63801669 74.18213136 -56.54931641 68.80297852 C-56.46724749 63.30639286 -56.43089184 57.8095227 -56.390625 52.3125 C-56.30501469 41.5409017 -56.16860719 30.77059662 -56 20 C-53.16697882 23.58735289 -51.60851565 27.22867322 -50.08203125 31.50390625 C-49.81992355 32.22360092 -49.55781586 32.94329559 -49.2877655 33.68479919 C-48.73746437 35.20070426 -48.19051574 36.71783006 -47.64672852 38.23608398 C-46.81301176 40.56107284 -45.96691283 42.88127626 -45.11914062 45.20117188 C-44.58519698 46.6768156 -44.05196904 48.15271852 -43.51953125 49.62890625 C-43.26645706 50.32270889 -43.01338287 51.01651154 -42.75263977 51.7313385 C-41.72092695 54.62891732 -41 56.89857971 -41 60 C-40.52183838 59.57879883 -40.04367676 59.15759766 -39.55102539 58.72363281 C-38.88578857 58.13936523 -38.22055176 57.55509766 -37.53515625 56.953125 C-36.80184082 56.30794922 -36.06852539 55.66277344 -35.31298828 54.99804688 C-33.85929528 53.74229181 -32.3883767 52.50593657 -30.89404297 51.29882812 C-13.93792588 37.56242796 -7.42443174 19.91475091 0 0 Z ' fill='#FBFBFB' transform='translate(172,41)'/>\
    <path d='M0 0 C2.55129876 2.55129876 3.50003049 5.39897982 4.79296875 8.6953125 C5.3463524 10.06536803 5.9004115 11.43515089 6.45507812 12.8046875 C7.31984522 14.95428628 8.17978211 17.10536995 9.02758789 19.26171875 C12.30507761 27.56917145 15.43181411 34.73255059 22 41 C23.51732486 42.56081132 25.0342284 44.1220323 26.55078125 45.68359375 C28.13541022 47.27083977 29.72267964 48.85545382 31.3125 50.4375 C32.12267578 51.25154297 32.93285156 52.06558594 33.76757812 52.90429688 C34.54166016 53.67708984 35.31574219 54.44988281 36.11328125 55.24609375 C36.81235596 55.94404053 37.51143066 56.6419873 38.23168945 57.36108398 C39.91392168 59.07362678 39.91392168 59.07362678 42 60 C42.20367187 58.85660156 42.40734375 57.71320313 42.6171875 56.53515625 C44.30879025 48.92294389 47.34216558 41.70254236 50.125 34.4375 C50.69457304 32.93706241 51.26358824 31.43641294 51.83203125 29.93554688 C53.2149314 26.28788863 54.60536059 22.64318514 56 19 C56.33 19 56.66 19 57 19 C57.30237002 30.77006805 57.53277211 42.53919987 57.67355824 54.31237316 C57.74116199 59.78053477 57.83270574 65.24602335 57.98071289 70.71264648 C58.1228838 75.9973112 58.19987795 81.2794206 58.23340416 86.56585121 C58.25726554 88.57347133 58.30386628 90.58096496 58.37449074 92.58748436 C58.93495583 109.18428698 58.93495583 109.18428698 54.15629578 114.94062805 C51.96995495 117.21539373 49.65037091 119.18785413 47.17944336 121.14355469 C41.46303979 125.78226596 39.54348671 133.07912754 37.1875 139.8125 C36.67187963 141.19978368 36.15300689 142.58586294 35.63085938 143.97070312 C34.38304302 147.30086497 33.17906863 150.64478289 32 154 C31.67 154 31.34 154 31 154 C31.01411926 153.11289337 31.02823853 152.22578674 31.04278564 151.3117981 C31.16623043 142.86999638 31.23018378 134.43015144 31.23059464 125.98741341 C31.23281636 121.64860534 31.25645255 117.31231271 31.33251953 112.97412109 C32.32686241 86.98988502 32.32686241 86.98988502 20.58105469 64.59716797 C19.72930664 63.74010254 18.87755859 62.88303711 18 62 C17.96716919 62.6237854 17.93433838 63.2475708 17.9005127 63.89025879 C17.85664429 64.72375854 17.81277588 65.5572583 17.76757812 66.41601562 C17.70098999 67.71986206 17.70098999 67.71986206 17.63305664 69.05004883 C17.53535407 70.84903102 17.4140113 72.64676962 17.27929688 74.44335938 C17.13901823 79.68385855 17.13901823 79.68385855 19.79882812 84.01953125 C20.52521484 84.64214844 21.25160156 85.26476562 22 85.90625 C24.6191749 88.20006156 25.84702085 89.3549455 26.65820312 92.77539062 C26.78416505 95.88445085 26.70205585 98.89533418 26.5 102 C26.46390625 103.06089844 26.4278125 104.12179688 26.390625 105.21484375 C26.29697151 107.81372807 26.16602484 110.40490402 26 113 C24.57264526 111.73313354 24.57264526 111.73313354 23.11645508 110.44067383 C20.27604562 107.97443666 17.34901088 105.901519 14.2019043 103.84643555 C6.81384723 98.48030606 0.62348154 92.63082422 -1.00482178 83.38140869 C-2.54328742 70.98272829 -1.82696805 58.34771407 -1.30462646 45.9019165 C-1.10819177 40.72060592 -1.02305697 35.53749743 -0.92773438 30.35351562 C-0.72559417 20.23098965 -0.40256141 10.1164032 0 0 Z ' fill='#FCFCFC' transform='translate(52,41)'/>\
    <path d='M0 0 C0.33 0 0.66 0 1 0 C1 29.04 1 58.08 1 88 C0.67 88 0.34 88 0 88 C-0.01030746 86.99188766 -0.02061493 85.98377533 -0.03123474 84.94511414 C-0.12890445 75.45407472 -0.23163245 65.96310181 -0.33933926 56.47217083 C-0.39455176 51.59255425 -0.44796915 46.71293167 -0.49731445 41.83325195 C-0.54498259 37.12590583 -0.5973264 32.418633 -0.65294075 27.71137428 C-0.67335318 25.91362134 -0.6920681 24.11584831 -0.70907402 22.31805992 C-0.73314258 19.80400697 -0.76319386 17.29009252 -0.79467773 14.77612305 C-0.8004332 14.02949905 -0.80618866 13.28287506 -0.81211853 12.5136261 C-0.85638576 9.41287071 -1.01190669 6.96427994 -2 4 C-1.0625 1.8125 -1.0625 1.8125 0 0 Z ' fill='#E8E8E8' transform='translate(172,41)'/>\
    <path d='M0 0 C0.33 0 0.66 0 1 0 C1 29.04 1 58.08 1 88 C0.67 88 0.34 88 0 88 C-0.01030746 86.99188766 -0.02061493 85.98377533 -0.03123474 84.94511414 C-0.12890445 75.45407472 -0.23163245 65.96310181 -0.33933926 56.47217083 C-0.39455176 51.59255425 -0.44796915 46.71293167 -0.49731445 41.83325195 C-0.54498259 37.12590583 -0.5973264 32.418633 -0.65294075 27.71137428 C-0.67335318 25.91362134 -0.6920681 24.11584831 -0.70907402 22.31805992 C-0.73314258 19.80400697 -0.76319386 17.29009252 -0.79467773 14.77612305 C-0.8004332 14.02949905 -0.80618866 13.28287506 -0.81211853 12.5136261 C-0.85638576 9.41287071 -1.01190669 6.96427994 -2 4 C-1.0625 1.8125 -1.0625 1.8125 0 0 Z ' fill='#E8E8E8' transform='translate(172,41)'/>\
    </svg>`;
    const svg = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svg);
    const img = new window.Image();
    img.onload = function () {
      // Draw SVG to canvas with opacity
      const canvas = document.createElement('canvas');
      canvas.width = 225;
      canvas.height = 225;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 0.08;
        ctx.drawImage(img, 0, 0, 225, 225);
        const pngUrl = canvas.toDataURL('image/png');
        doc.addImage(pngUrl, 'PNG', (pageWidth-225)/2, (pageHeight-225)/2, 225, 225);
      }
      // Draw logo at top center (convert SVG to PNG)
      const logoImg = new window.Image();
      logoImg.onload = function () {
        // Draw logo (white/cyan tint) at top center
        const logoW = 64, logoH = 64;
        doc.addImage(logoImg, 'PNG', (pageWidth-logoW)/2, 24, logoW, logoH);
        drawContent();
        doc.save('code_analysis_report.pdf');
        URL.revokeObjectURL(url);
      };
      // Convert SVG to PNG for logo
      fetch(downloadSvg)
        .then(res => res.text())
        .then(svgText => {
          const logoCanvas = document.createElement('canvas');
          logoCanvas.width = 64;
          logoCanvas.height = 64;
          const logoCtx = logoCanvas.getContext('2d');
          const logoImg2 = new window.Image();
          const svg64 = 'data:image/svg+xml;base64,' + btoa(svgText);
          logoImg2.onload = function () {
            if (logoCtx) {
              logoCtx.clearRect(0,0,64,64);
              logoCtx.globalAlpha = 1;
              logoCtx.drawImage(logoImg2, 0, 0, 64, 64);
              const logoPng = logoCanvas.toDataURL('image/png');
              logoImg.src = logoPng;
            }
          };
          logoImg2.src = svg64;
        });
    };
    img.src = url;

    function drawContent() {
      let y = 100;
      // Title
      doc.setFont('courier', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 255, 255);
      doc.text('Code Security Analysis Report', pageWidth / 2, y, { align: 'center' });
      y += 36;
      // Section: Code Metrics
      doc.setFontSize(13);
      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 255, 255);
      doc.text('Code Metrics', 40, y); y += 18;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255,255,255);
      doc.text(`Lines of Code: ${result.linesOfCode}`, 50, y); y += 14;
      doc.text(`Complexity Score: ${result.codeComplexity}/10`, 50, y); y += 14;
      doc.text(`Security Score: ${result.securityScore}/100`, 50, y); y += 14;
      doc.text(`Language: ${result.language}`, 50, y); y += 14;
      doc.text(`Analysis Time: ${result.fileInfo.scanTime}`, 50, y); y += 20;
      // Section: Security Summary
      doc.setFont('courier', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 255, 255);
      doc.text('Security Summary', 40, y); y += 18;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      const secColor: [number, number, number] = result.securityLevel === 'LOW' ? [255,64,64] : result.securityLevel === 'HIGH' ? [0,255,128] : [255,255,64];
      doc.setTextColor(...secColor);
      doc.text(`Security Level: ${result.securityLevel}`, 50, y); y += 14;
      const riskColor: [number, number, number] = result.riskLevel === 'HIGH' ? [255,64,64] : result.riskLevel === 'LOW' ? [0,255,128] : [255,255,64];
      doc.setTextColor(...riskColor);
      doc.text(`Risk Level: ${result.riskLevel}`, 50, y); y += 14;
      doc.setTextColor(255,255,255);
      doc.text(`Vulnerabilities Found: ${result.detailedVulnerabilities.length}`, 50, y); y += 20;
      // Section: ML Code Quality
      doc.setFont('courier', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 255, 255);
      doc.text('ML Code Quality', 40, y); y += 18;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255,255,255);
      doc.text(`Security Score: ${result.mlCodeQuality.securityScore}`, 50, y); y += 14;
      doc.text(`Maintainability: ${result.mlCodeQuality.maintainabilityScore}`, 50, y); y += 14;
      doc.text(`Complexity: ${result.mlCodeQuality.complexityScore}`, 50, y); y += 14;
      doc.text(`Vulnerability Risk: ${result.mlCodeQuality.vulnerabilityRisk}`, 50, y); y += 20;
      // Section: Performance Impact
      doc.setFont('courier', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 255, 255);
      doc.text('Performance Impact', 40, y); y += 18;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255,255,255);
      doc.text(`Performance Score: ${result.performanceImpact.score}/100`, 50, y); y += 14;
      if (result.performanceImpact.bottlenecks.length > 0) {
        doc.text('Bottlenecks:', 50, y); y += 14;
        result.performanceImpact.bottlenecks.forEach((b) => {
          doc.text('- ' + b, 60, y); y += 12;
        });
        y += 4;
      }
      // Section: Vulnerabilities
      if (result.detailedVulnerabilities.length > 0) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255,64,64);
        doc.text('Vulnerabilities', 40, y); y += 18;
        doc.setFont('courier', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(255,255,255);
        result.detailedVulnerabilities.forEach((v) => {
          doc.text('- ' + v.title + ' (Line: ' + v.line + ')', 50, y); y += 12;
          doc.text('  ' + v.description, 60, y); y += 12;
        });
        y += 4;
      }
      // Section: Recommendations
      if (result.detailedSuggestions.length > 0) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(0,128,255);
        doc.text('Security Recommendations', 40, y); y += 18;
        doc.setFont('courier', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(255,255,255);
        result.detailedSuggestions.forEach((s) => {
          doc.text('- ' + s.title + ' [' + s.priority + ']', 50, y); y += 12;
          doc.text('  ' + s.description, 60, y); y += 12;
        });
        y += 4;
      }
      // Footer: Scan date/time and watermark
      const now = new Date();
      doc.setFontSize(8);
      doc.setTextColor(120,120,120);
      doc.text(`Scan generated: ${now.toLocaleString()}`, 40, pageHeight-30);
      doc.setFontSize(10);
      doc.setTextColor(0,255,255);
      doc.text('CYBERSPACE SECURITY', pageWidth / 2, pageHeight-15, { align: 'center' });
    }
  };

  const handleExportPDF = () => {
    if (analysisResult) {
      generatePDF(analysisResult);
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
            <p className="text-xs text-green-300 mt-1 font-mono">
              Detected Language: <span className="text-green-400 font-semibold">{detectedLanguage}</span>
            </p>
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

      {/* Error Message */}
      { !isAnalyzing && !analysisResult && (
        <div className="text-red-400 text-sm font-mono text-center">
          An error occurred during analysis. Please check your code and try again.
        </div>
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

              <div className="space-y-4">
                <div className="text-green-300 font-mono">
                  Final assessment based on security levels, performance risks, and ML recommendations.
                </div>
                <div className="text-sm text-gray-300 font-mono">
                  Always validate automated analysis with human review for critical applications.
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Export PDF Button */}
          <Button className="mt-2 bg-blue-600 text-white hover:bg-blue-500 font-mono" onClick={handleExportPDF}>
            Export PDF Report
          </Button>
        </div>
      )}
    </div>
  );
};

export default CodeAnalyzer;
