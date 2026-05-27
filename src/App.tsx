import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Upload, 
  Copy, 
  Download, 
  Sparkles, 
  History, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Check, 
  RefreshCw, 
  Trash, 
  FileCheck, 
  Layers, 
  Search, 
  FileUp, 
  Info,
  ChevronRight,
  Send,
  MessageSquare,
  Bot,
  User,
  Minus,
  X,
  RotateCcw
} from "lucide-react";
import { Editor } from "./components/Editor";
import { HelpRegulations } from "./components/HelpRegulations";
import { SAMPLE_DOCUMENTS } from "./data";
import { PlanFormData, DraftHistoryItem, LoadingStep, ChatMessage } from "./types";

export default function App() {
  // --- Form & Interactive States ---
  const [formData, setFormData] = useState<PlanFormData>({
    communeName: "UBND xã Chiêm Hóa",
    areaUnit: "UBND tỉnh Tuyên Quang",
    documentType: "Kế hoạch",
    superiorFiles: [],
    referenceFiles: [],
    templateFiles: [],
    documentText: "",
    localNotes: "",
  });

  const [editorContent, setEditorContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // --- UI feedback & History States ---
  const [lastSaved, setLastSaved] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [draftHistory, setDraftHistory] = useState<DraftHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"input" | "history">("input");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>("");

  // --- Dynamic Chatbot States ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Xin chào! Tôi là Trợ lý Hành Chính Công thông minh. Bạn có thể trò chuyện với tôi về thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP, hỏi đáp nghiệp vụ công vụ xã, hoặc yêu cầu trực tiếp chỉnh sửa/bổ sung bất cứ phần nào của bản Kế hoạch trên Canvas bên phải này! 🇻🇳",
      timestamp: ""
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatSending, setIsChatSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // --- Canvas AI Refinement States ---
  const [editCommand, setEditCommand] = useState<string>("");
  const [isEditingWithAi, setIsEditingWithAi] = useState<boolean>(false);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Load Initial States from LocalStorage ---
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem("commune_assistant_form");
      const savedEditor = localStorage.getItem("commune_assistant_editor");
      const savedHistory = localStorage.getItem("commune_assistant_history");
      const savedChat = localStorage.getItem("commune_assistant_chat");

      if (savedForm) {
        try {
          const parsed = JSON.parse(savedForm);
          setFormData({
            communeName: parsed.communeName || "UBND xã Chiêm Hóa",
            areaUnit: parsed.areaUnit || "UBND tỉnh Tuyên Quang",
            documentType: parsed.documentType || "Kế hoạch",
            superiorFiles: parsed.superiorFiles || [],
            referenceFiles: parsed.referenceFiles || [],
            templateFiles: parsed.templateFiles || [],
            documentText: parsed.documentText || "",
            localNotes: parsed.localNotes || "",
          });
        } catch (e) {
          console.error("Lỗi phục hồi form:", e);
        }
      } else {
        // Defaults: prefill with the first sample document to make the initial view lively!
        const firstSample = SAMPLE_DOCUMENTS[0];
        setFormData({
          communeName: "UBND xã Chiêm Hóa",
          areaUnit: "UBND tỉnh Tuyên Quang",
          documentType: "Kế hoạch",
          superiorFiles: [
            {
              name: firstSample.title,
              text: firstSample.content,
              size: firstSample.content.length
            }
          ],
          referenceFiles: [],
          templateFiles: [],
          documentText: "",
          localNotes: "Huy động và kết nối lực lượng, bảo đảm thực hiện thắng lợi các nhiệm vụ chỉ tiêu đề ra tại Chiêm Hóa."
        });
      }

      if (savedEditor) {
        setEditorContent(savedEditor);
      }

      if (savedHistory) {
        setDraftHistory(JSON.parse(savedHistory));
      }

      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      }
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu từ LocalStorage:", e);
    }
  }, []);

  // --- Background Autosave Engine (Runs every 5 seconds) ---
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      try {
        localStorage.setItem("commune_assistant_form", JSON.stringify(formData));
        localStorage.setItem("commune_assistant_editor", editorContent);
        localStorage.setItem("commune_assistant_chat", JSON.stringify(chatMessages));
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        setLastSaved(timeStr);
      } catch (e) {
        console.error("Lỗi tự động lưu:", e);
      }
    }, 5000);

    return () => clearInterval(autosaveInterval);
  }, [formData, editorContent, chatMessages]);

  // --- Handle Higher Directive Sample Clicking ---
  const loadSample = (index: number) => {
    const sample = SAMPLE_DOCUMENTS[index];
    setFormData({
      communeName: "UBND xã Chiêm Hóa",
      areaUnit: "UBND tỉnh Tuyên Quang",
      documentType: "Kế hoạch",
      superiorFiles: [
        {
          name: sample.title,
          text: sample.content,
          size: sample.content.length
        }
      ],
      referenceFiles: [],
      templateFiles: [],
      documentText: "",
      localNotes: sample.notes
    });
    setErrorMsg(null);
  };

  // --- Client Side PDF and TXT file extraction ---
  const handlePdfFile = async (file: File) => {
    setIsPdfLoading(true);
    setPdfProgress("Đang tải tệp PDF...");
    
    return new Promise<string>((resolve, reject) => {
      // Injects pdfJS CDN dynamically
      if (typeof (window as any).pdfjsLib !== "undefined") {
        extractTextWithPdfJsLib(file, resolve, reject);
      } else {
        setPdfProgress("Đang khởi tạo thư viện xử lý PDF...");
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
          extractTextWithPdfJsLib(file, resolve, reject);
        };
        script.onerror = (err) => {
          setIsPdfLoading(false);
          reject(new Error("Lỗi tải thư viện hỗ trợ đọc file PDF."));
        };
        document.head.appendChild(script);
      }
    });
  };

  const extractTextWithPdfJsLib = async (file: File, resolve: (text: string) => void, reject: (err: any) => void) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = (window as any).pdfjsLib;
      setPdfProgress("Phân tích cấu trúc trang...");
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      const maxPages = Math.min(pdf.numPages, 35);
      for (let i = 1; i <= maxPages; i++) {
        setPdfProgress(`Đang xử lý nội dung trang ${i}/${maxPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += `--- TRANG ${i} ---\n` + pageText + "\n";
      }
      
      if (pdf.numPages > 35) {
        fullText += `\n...[Nội dung quá dài, hệ thống thu gọn bớt 35 trang đầu]...`;
      }
      
      setIsPdfLoading(false);
      setPdfProgress("");
      resolve(fullText);
    } catch (err) {
      console.error(err);
      setIsPdfLoading(false);
      setPdfProgress("");
      reject(new Error("Không thể trích xuất văn bản từ file PDF. Hãy thử sao chép và dán trực tiếp."));
    }
  };

  const getDocumentTitle = () => {
    if (formData.superiorFiles && formData.superiorFiles.length > 0) {
      return formData.superiorFiles.map(f => f.name).join(", ");
    }
    return formData.documentText && formData.documentText.trim()
      ? formData.documentText.trim().substring(0, 50) + "..."
      : `Dự thảo ${formData.documentType || "Kế hoạch"}`;
  };

  const parseFile = async (file: File): Promise<string> => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "pdf") {
      return await handlePdfFile(file);
    } else if (fileExtension === "txt") {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === "string") {
            resolve(event.target.result);
          } else {
            reject(new Error("Không thể trích xuất văn bản từ tệp TXT."));
          }
        };
        reader.onerror = () => reject(new Error("Lỗi khi đọc file .txt."));
        reader.readAsText(file);
      });
    } else {
      throw new Error("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .pdf và .txt");
    }
  };

  const handleAddFiles = async (category: "superior" | "reference" | "template", files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    for (const file of Array.from(files)) {
      try {
        const text = await parseFile(file);
        const name = file.name;
        const size = file.size;
        setFormData(prev => {
          const targetKey = `${category}Files` as "superiorFiles" | "referenceFiles" | "templateFiles";
          const currentList = prev[targetKey] || [];
          if (currentList.some((item: any) => item.name === name)) {
            return prev;
          }
          return {
            ...prev,
            [targetKey]: [...currentList, { name, text, size }]
          };
        });
      } catch (err: any) {
        setErrorMsg(`Lỗi khi xử lý tệp '${file.name}': ${err.message}`);
        break;
      }
    }
  };

  const handleRemoveFile = (category: "superior" | "reference" | "template", fileName: string) => {
    setFormData(prev => {
      const targetKey = `${category}Files` as "superiorFiles" | "referenceFiles" | "templateFiles";
      const currentList = prev[targetKey] || [];
      return {
        ...prev,
        [targetKey]: currentList.filter((item: any) => item.name !== fileName)
      };
    });
  };

  const handleResetForm = () => {
    setFormData({
      communeName: "UBND xã Chiêm Hóa",
      areaUnit: "UBND tỉnh Tuyên Quang",
      documentType: "Kế hoạch",
      superiorFiles: [],
      referenceFiles: [],
      templateFiles: [],
      documentText: "",
      localNotes: "",
    });
    setEditorContent("");
    setErrorMsg(null);
    setEditCommand("");
    setEditErrorMsg(null);
    localStorage.removeItem("commune_assistant_form");
    localStorage.removeItem("commune_assistant_editor");
  };

  // --- Trigger Drafting Call and Handle Loading Progress ---
  const handleGeneratePlan = async () => {
    const hasSuperiorContent = (formData.superiorFiles && formData.superiorFiles.length > 0) || formData.documentText.trim().length > 0;
    const hasReferenceContent = formData.referenceFiles && formData.referenceFiles.length > 0;
    const hasTemplateContent = formData.templateFiles && formData.templateFiles.length > 0;

    if (!hasSuperiorContent && !hasReferenceContent && !hasTemplateContent) {
      setErrorMsg("Vui lòng nhập nội dung chỉ đạo hoặc tải lên ít nhất một tài liệu tham chiếu (cấp trên, quy định, hoặc mẫu) để bắt đầu.");
      return;
    }

    setLoading(true);
    setProgressSimulator();
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Giao dịch với AI không thành công, vui lòng thử lại.");
      }

      const data = await response.json();
      const draftResultHtml = data.draftHtml;

      // Animate remaining bars to completion and set output
      setLoadingProgress(100);
      setLoadingText("Hoàn thành! Đang lập bản vẽ văn bản...");
      
      setTimeout(() => {
        setEditorContent(draftResultHtml);
        
        // Add to history
        const now = new Date();
        const timestamp = `${now.getDate()}/${now.getMonth() + 1} lúc ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const newHistoryItem: DraftHistoryItem = {
          id: Date.now().toString(),
          timestamp,
          communeName: formData.communeName,
          documentTitle: getDocumentTitle(),
          htmlContent: draftResultHtml,
          localNotes: formData.localNotes
        };
        const updatedHistory = [newHistoryItem, ...draftHistory];
        setDraftHistory(updatedHistory);
        localStorage.setItem("commune_assistant_history", JSON.stringify(updatedHistory));
        
        setLoading(false);
      }, 800);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Không thể tải bản thảo kế hoạch. Đảm bảo cổng kết nối mạng ổn định.");
      setLoading(false);
    }
  };

  // Simulated indicators to provide intuitive civil service UX showing AI reasoning steps
  const setProgressSimulator = () => {
    setLoadingProgress(5);
    setLoadingText("Khởi tạo hệ thống - Đọc dữ liệu thô tài liệu đầu vào...");
    
    setTimeout(() => {
      setLoadingProgress(25);
      setLoadingText("Đang quét đích danh cụm từ 'UBND xã', 'cơ sở', 'xã, phường, thị trấn'...");
    }, 1500);

    setTimeout(() => {
      setLoadingProgress(55);
      setLoadingText("Bộ lọc AI đang lọc bỏ và đào thải các trách nhiệm chuyên biệt của Sở, Ban, Ngành cấp tỉnh...");
    }, 3500);

    setTimeout(() => {
      setLoadingProgress(78);
      setLoadingText("Đang tích hợp 'Ghi chú đặc thù địa phương' và cá nhân hóa phân công nhiệm vụ công chức...");
    }, 6000);

    setTimeout(() => {
      setLoadingProgress(92);
      setLoadingText("Đang hiệu chỉnh thể thức văn bản hành chính theo quy định Nghị định 30/2020/NĐ-CP...");
    }, 8500);
  };

  // --- Canvas AI Refinement handler ---
  const handleEditWithAi = async (commandToSend?: string) => {
    const finalCommand = commandToSend || editCommand;
    if (!finalCommand.trim()) {
      setEditErrorMsg("Vui lòng nhập hoặc chọn yêu cầu sửa đổi trước khi gửi.");
      return;
    }
    if (!editorContent.trim()) {
      setEditErrorMsg("Bạn cần có bản nháp dự thảo trước khi yêu cầu sửa đổi.");
      return;
    }

    setIsEditingWithAi(true);
    setEditErrorMsg(null);

    try {
      const response = await fetch("/api/edit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHtml: editorContent,
          editCommand: finalCommand,
          communeName: formData.communeName,
          areaUnit: formData.areaUnit
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Giao dịch chỉnh sửa thất bại, vui lòng thử lại.");
      }

      const data = await response.json();
      setEditorContent(data.editedHtml);
      setEditCommand(""); // clear text input

      // Add historical log of the edit activity
      const now = new Date();
      const timestamp = `${now.getDate()}/${now.getMonth() + 1} lúc ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const newHistoryItem: DraftHistoryItem = {
        id: Date.now().toString(),
        timestamp,
        communeName: formData.communeName,
        documentTitle: `[Biên tập] ${getDocumentTitle().replace("[Biên tập] ", "").replace("[PDF] ", "").replace("[TXT] ", "")}`,
        htmlContent: data.editedHtml,
        localNotes: `Biên tập Canvas: ${finalCommand.substring(0, 40)}${finalCommand.length > 40 ? "..." : ""}`
      };
      const updatedHistory = [newHistoryItem, ...draftHistory];
      setDraftHistory(updatedHistory);
      localStorage.setItem("commune_assistant_history", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setEditErrorMsg(err.message || "Không thể thực hiện chỉnh sửa. Vui lòng kết nối ổn định mạng.");
    } finally {
      setIsEditingWithAi(false);
    }
  };

  // --- Send Message in Admin public services AI Chatbot ---
  const handleSendChatMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || chatInput;
    if (!finalMsg.trim() || isChatSending) return;

    if (!textToSend) {
      setChatInput("");
    }

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: finalMsg,
      timestamp
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setIsChatSending(true);
    setChatError(null);

    // Scroll chat window down automatically
    setTimeout(() => {
      const container = document.getElementById("chatbot-messages-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({ role: msg.role, content: msg.content })),
          currentHtml: editorContent,
          communeName: formData.communeName,
          areaUnit: formData.areaUnit
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Giao dịch hội thoại của hội đồng trợ lý thất bại.");
      }

      const resJson = await response.json();
      const assistantMessageId = Date.now().toString() + "-assistant";

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: resJson.responseText || "Tôi đã ghi nhận ý kiến từ đồng chí, vui lòng bổ sung thông tin.",
        timestamp: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
        canvasUpdated: !!resJson.shouldUpdateCanvas
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      if (resJson.shouldUpdateCanvas && resJson.updatedHtml) {
        setEditorContent(resJson.updatedHtml);

        // Also save this update to editor history logs
        const currentTitle = getDocumentTitle();
        const historyItem: DraftHistoryItem = {
          id: Date.now().toString() + "-history",
          timestamp: `${now.getDate()}/${now.getMonth() + 1} lúc ${timestamp}`,
          communeName: formData.communeName,
          documentTitle: `[Quy trình Chat AI] ${currentTitle.replace("[Quy trình Chat AI] ", "").replace("[Chat AI] ", "").replace("[Biên tập] ", "").replace("[PDF] ", "").replace("[TXT] ", "")}`,
          htmlContent: resJson.updatedHtml,
          localNotes: `Cập nhật từ Trại Chat: "${finalMsg.substring(0, 35)}${finalMsg.length > 35 ? "..." : ""}"`
        };

        const updatedHistory = [historyItem, ...draftHistory];
        setDraftHistory(updatedHistory);
        localStorage.setItem("commune_assistant_history", JSON.stringify(updatedHistory));
      }

      // Scroll down for assistant reply
      setTimeout(() => {
        const container = document.getElementById("chatbot-messages-container");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);

    } catch (err: any) {
      console.error("Lỗi hội thoại chatbot:", err);
      setChatError(err.message || "Lỗi giao dịch mạng với máy chủ Trợ lý.");
    } finally {
      setIsChatSending(false);
    }
  };

  const handleClearChat = () => {
    const defaultMsg = [
      {
        id: "welcome",
        role: "assistant",
        content: "Xin chào! Tôi là Trợ lý Hành Chính Công thông minh. Bạn có thể trò chuyện với tôi về thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP, hỏi đáp nghiệp vụ công vụ xã, hoặc yêu cầu trực tiếp chỉnh sửa/bổ sung bất cứ phần nào của bản Kế hoạch trên Canvas bên phải này! 🇻🇳",
        timestamp: ""
      }
    ];
    setChatMessages(defaultMsg);
    localStorage.setItem("commune_assistant_chat", JSON.stringify(defaultMsg));
    setShowClearConfirm(false);
  };

  // --- Copy Rich Text contents cleanly ---
  const handleCopyToClipboard = async () => {
    try {
      // Get readable styled text without XML tags, or copy HTML raw
      const editorDiv = document.getElementById("commune-plan-editable-content");
      if (editorDiv) {
        // Copy formatted HTML with raw text as fallback so clipboard keeps formatting
        const text = editorDiv.innerText;
        const html = editorDiv.innerHTML;
        
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" })
          })
        ]);
        
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Không thể copy:", err);
      // Fallback paste raw text
      try {
        const text = editorContent.replace(/<[^>]*>/g, "");
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (innerErr) {
        alert("Có lỗi xảy ra, xin vui lòng bôi đen và sao chép thủ công.");
      }
    }
  };

  // --- MS Word High-Fidelity .doc / .docx Exporter ---
  const handleDownloadWord = () => {
    // Generate styled DOC
    const editorDiv = document.getElementById("commune-plan-editable-content");
    const contentToExport = editorDiv ? editorDiv.innerHTML : editorContent;
    
    // Fallback if empty
    if (!contentToExport.trim()) {
      alert("Nội dung bản thảo hiện tại đang trống. Vui lòng tạo nội dung hoặc nhập biểu mẫu.");
      return;
    }

    // Standard Vietnamese Administrative official layout wrapping to preserve Times New Roman and correct 20mm/30mm/15mm margins
    const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <o:DocumentProperties>
            <o:Author>Trợ lý Xây dựng Kế hoạch Cấp xã</o:Author>
            <o:Title>Kế hoạch Hành động UBND ${formData.communeName}</o:Title>
          </o:DocumentProperties>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 210mm 297mm; /* A4 Paper geometry */
            margin: 20mm 15mm 20mm 30mm; /* Top margins: 20mm, Right: 15mm, Bottom: 20mm, Left: 30mm (standard Decree 30/2020/NĐ-CP) */
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-page-orientation: portrait;
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13.5pt; /* Size 13 or 14 as required */
            line-height: 1.35;
            color: #000000;
          }
          p {
            margin: 0in;
            margin-bottom: 6pt;
            text-indent: 1.25cm; /* Paragraph indent of 1cm to 1.25cm */
            line-height: 1.35;
            text-align: justify;
          }
          h1, h2, h3, h4, h5 {
            font-family: "Times New Roman", Times, serif;
            margin: 12pt 0in 6pt 0in;
            line-height: 1.2;
            text-indent: 0in;
          }
          h1 {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 18pt;
          }
          h2 {
            font-size: 14pt;
            font-weight: bold;
          }
          h3 {
            font-size: 13pt;
            font-weight: bold;
          }
          strong {
            font-weight: bold;
          }
          em {
            font-style: italic;
          }
          ul, ol {
            margin-top: 0in;
            margin-bottom: 6pt;
            padding-left: 20px;
          }
          li {
            margin-bottom: 3pt;
            line-height: 1.35;
            text-align: justify;
            text-indent: 0in;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12pt;
            margin-bottom: 12pt;
          }
          table, th, td {
            border: 1px solid #000000;
          }
          th, td {
            padding: 6px 10px;
            font-size: 12pt;
            vertical-align: top;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${contentToExport}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedTitle = formData.documentTitle
      .substring(0, 30)
      .replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, "_");
    a.download = `Du_thao_Ke_hoach_${formData.communeName || "UBND_Xa"}_Noi_bo_${sanitizedTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Search history filtering helper ---
  const filteredHistory = draftHistory.filter(item => 
    item.documentTitle.toLowerCase().includes(historySearch.toLowerCase()) || 
    item.communeName.toLowerCase().includes(historySearch.toLowerCase())
  );

  const applyHistoryItem = (item: DraftHistoryItem) => {
    setEditorContent(item.htmlContent);
    setFormData(prev => ({
      ...prev,
      communeName: item.communeName,
      documentTitle: item.documentTitle,
      localNotes: item.localNotes || ""
    }));
    setActiveTab("input");
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = draftHistory.filter(item => item.id !== id);
    setDraftHistory(updated);
    localStorage.setItem("commune_assistant_history", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-between">
      {/* 🇻🇳 Application State Header Banner */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white shadow-md flex-none border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Vietnamese Emblem Simulation Motif */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm select-none border border-slate-200">
              <span className="text-blue-800 font-bold text-xl">🇻🇳</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-blue-100 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border border-white/10">
                  Hành chính Công
                </span>
                <span className="text-blue-200/80 text-xs font-mono">• Trực thuộc cơ sở</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight uppercase">
                {formData.communeName ? formData.communeName.toUpperCase() : "ỦY BAN NHÂN DÂN XÃ CHIÊM HÓA"}
              </h1>
              <p className="text-[11px] text-blue-200/90 font-sans mt-0.5 uppercase tracking-wider font-medium">
                TRỢ LÝ SOẠN THẢO VĂN BẢN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Local Storage Autosave Indicator */}
            <div className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs text-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-450"></span>
              </span>
              <span>Đã lưu bản nháp: </span>
              <strong className="text-white font-mono">
                {lastSaved ? lastSaved : "Đang kết nối..."}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural split screen content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column (6/12): Inputs and setup controls */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="left-column-inputs">
          
          {/* Quick tab toggle for Inputting vs Chat Assistant vs History archives */}
          <div className="bg-slate-200/85 p-1 rounded-lg border border-slate-300 flex gap-0.5">
            <button
              onClick={() => setActiveTab("input")}
              className={`flex-1 py-2 rounded-md font-medium text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "input"
                  ? "bg-white text-blue-900 shadow-sm border border-slate-300/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>Thiết lập</span>
            </button>
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className={`flex-1 py-2 rounded-md font-medium text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer relative ${
                isChatOpen
                  ? "bg-blue-50 text-blue-900 border border-blue-200/50 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${isChatOpen ? "text-blue-700 font-bold" : "text-blue-500 animate-pulse"}`} />
              <span>Trò chuyện AI</span>
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-bold font-mono text-[7px] px-1.5 py-0.5 rounded-full scale-95 shadow-sm">NEW</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-md font-medium text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-blue-900 shadow-sm border border-slate-300/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử ({draftHistory.length})</span>
            </button>
          </div>

          {activeTab === "input" && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md flex-1 flex flex-col gap-5 justify-between">
              
              {/* Form entries */}
              <div className="flex flex-col gap-5 overflow-y-auto max-h-[640px] pr-1">
                
                {/* 1. Tên cơ quan trong văn bản */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-agency-names">
                  <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                    <span className="text-rose-500">1.</span> Tên cơ quan trong văn bản
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tên đơn vị <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="input-commune-name"
                        value={formData.communeName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, communeName: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-rose-600 focus:outline-none transition-all text-xs font-medium shadow-3xs"
                        placeholder="Mặc định: UBND xã Chiêm Hóa"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tên cấp trên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="input-area-unit"
                        value={formData.areaUnit || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, areaUnit: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-rose-600 focus:outline-none transition-all text-xs font-medium shadow-3xs"
                        placeholder="Mặc định: UBND tỉnh Tuyên Quang"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Thể loại văn bản dự thảo */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-document-type">
                  <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                    <span className="text-rose-500">2.</span> Thể loại văn bản dự thảo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Chọn thể loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.documentType || "Kế hoạch"}
                        onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:border-rose-600 focus:outline-none transition-all text-xs font-medium cursor-pointer shadow-3xs"
                      >
                        <option value="Kế hoạch">Kế hoạch</option>
                        <option value="Báo cáo">Báo cáo</option>
                        <option value="Chương trình">Chương trình</option>
                        <option value="Công văn">Công văn</option>
                        <option value="Tờ trình">Tờ trình</option>
                        <option value="Quyết định">Quyết định</option>
                        <option value="Chỉ thị">Chỉ thị</option>
                        <option value="Thông báo">Thông báo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Hoặc nhập tên thể loại khác
                      </label>
                      <input
                        type="text"
                        value={formData.documentType || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-rose-600 focus:outline-none transition-all text-xs font-medium shadow-3xs"
                        placeholder="Ví dụ: Kế hoạch hành động"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Văn bản của cấp trên trực tiếp */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-superior-files">
                  <div className="flex justify-between items-center mb-1.5 border-b border-rose-100 pb-1.5">
                    <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-rose-500">3.</span> Văn bản của cấp trên trực tiếp
                    </h4>
                    <span className="text-[9px] text-slate-450 font-mono">Nhiều tệp (.PDF, .TXT)</span>
                  </div>
                  
                  {/* Dropzone field */}
                  <div className="relative group border border-dashed border-slate-350 hover:border-red-500 rounded-lg p-2.5 text-center cursor-pointer bg-white hover:bg-slate-50/40 transition-colors shadow-3xs">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleAddFiles("superior", e.target.files)}
                      accept=".pdf,.txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {isPdfLoading ? (
                      <div className="flex items-center justify-center gap-2 text-rose-700 py-1 font-mono text-xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{pdfProgress || "Đang trích xuất PDF..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-red-550" />
                        <span className="text-xs font-medium text-slate-650">Kéo thả hoặc bấm để tải lên nhiều tệp</span>
                      </div>
                    )}
                  </div>

                  {/* List of files */}
                  {formData.superiorFiles && formData.superiorFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.superiorFiles.map(file => (
                        <div key={file.name} className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10.5px] font-medium px-2 py-0.5 rounded border border-red-100 max-w-full shadow-3xs">
                          <FileText className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile("superior", file.name)}
                            className="text-red-400 hover:text-red-950 font-extrabold ml-1 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick select sample documents helper */}
                  <div className="mt-2.5 border-t border-slate-200/50 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">⚡️ Chọn nhanh văn bản chỉ thị mẫu của Tỉnh/Trung ương:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {SAMPLE_DOCUMENTS.map((doc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadSample(idx)}
                          className="bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-red-450 rounded px-2 py-1 text-left text-[10.5px] truncate transition-all text-slate-700 font-semibold cursor-pointer shadow-3xs"
                        >
                          📄 Mẫu {idx + 1}: {idx === 0 ? "Chỉ thị Quản lý Đất đai" : "Chuyển Đổi Số Nông Thôn"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Các quy định liên quan tham chiếu */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-reference-files">
                  <div className="flex justify-between items-center mb-1.5 border-b border-rose-100 pb-1.5">
                    <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-rose-500">4.</span> Các quy định liên quan tham chiếu
                    </h4>
                    <span className="text-[9px] text-slate-450 font-mono">Nhiều tệp (.PDF, .TXT)</span>
                  </div>
                  
                  {/* Dropzone field */}
                  <div className="relative group border border-dashed border-slate-350 hover:border-emerald-500 rounded-lg p-2.5 text-center cursor-pointer bg-white hover:bg-slate-50/40 transition-colors shadow-3xs">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleAddFiles("reference", e.target.files)}
                      accept=".pdf,.txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-555" />
                      <span className="text-xs font-medium text-slate-650">Bấm để tải lên quy định, luật liên quan</span>
                    </div>
                  </div>

                  {/* List of files */}
                  {formData.referenceFiles && formData.referenceFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.referenceFiles.map(file => (
                        <div key={file.name} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10.5px] font-medium px-2 py-0.5 rounded border border-emerald-100 max-w-full shadow-3xs">
                          <FileCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile("reference", file.name)}
                            className="text-emerald-400 hover:text-emerald-950 font-extrabold ml-1 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-emerald-100 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Mẫu (nếu có) */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-template-files">
                  <div className="flex justify-between items-center mb-1.5 border-b border-rose-100 pb-1.5">
                    <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-rose-500">5.</span> Mẫu bố cục mong muốn (Nếu có)
                    </h4>
                    <span className="text-[9px] text-slate-450 font-mono">Nhiều tệp (.PDF, .TXT)</span>
                  </div>
                  
                  {/* Dropzone field */}
                  <div className="relative group border border-dashed border-slate-350 hover:border-purple-500 rounded-lg p-2.5 text-center cursor-pointer bg-white hover:bg-slate-50/40 transition-colors shadow-3xs">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleAddFiles("template", e.target.files)}
                      accept=".pdf,.txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-555" />
                      <span className="text-xs font-medium text-slate-650">Bấm để tải lên đề cương mẫu tương tự</span>
                    </div>
                  </div>

                  {/* List of files */}
                  {formData.templateFiles && formData.templateFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.templateFiles.map(file => (
                        <div key={file.name} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10.5px] font-medium px-2 py-0.5 rounded border border-purple-100 max-w-full shadow-3xs">
                          <Layers className="w-3 h-3 text-purple-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile("template", file.name)}
                            className="text-purple-400 hover:text-purple-950 font-extrabold ml-1 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Phần dán văn bản, hoặc chỉ đạo thêm các lưu ý, gợi ý */}
                <div className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/45 shadow-3xs" id="sec-text-notes">
                  <h4 className="text-xs font-extrabold text-[#b91c1c] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                    <span className="text-rose-500">6.</span> Dán văn bản chỉ đạo / ý kiến lưu ý bổ sung
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Phần dán văn bản thô / tài liệu bổ sung
                      </label>
                      <textarea
                        id="input-document-text"
                        value={formData.documentText || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, documentText: e.target.value }))}
                        className="w-full h-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-850 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors text-xs font-sans resize-y leading-relaxed shadow-3xs"
                        placeholder="Hãy dán các vệt văn bản phụ trợ, mốc thông tin tham khảo nhanh..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Chỉ đạo đặc thù hoặc các lưu ý, gợi ý cho dự thảo
                      </label>
                      <textarea
                        id="input-local-notes"
                        value={formData.localNotes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, localNotes: e.target.value }))}
                        className="w-full h-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-850 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors text-xs font-sans resize-none shadow-3xs"
                        placeholder="Có thể nêu rõ phân công phòng ban chính phụ trách, thời gian, giải pháp kinh tế tuần hoàn tại Chiêm Hóa..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Central Drafting command button */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                {errorMsg && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start text-xs text-red-800">
                    <AlertCircle id="error-alert-icon" className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    id="action-btn-draft"
                    disabled={loading}
                    onClick={handleGeneratePlan}
                    className="flex-1 bg-[#b91c1c] hover:bg-[#a11818] hover:shadow-[0_4px_10px_rgba(185,28,28,0.2)] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-150 transform active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>ĐANG TIẾN HÀNH BÓC TÁCH...</span>
                      </>
                    ) : (
                      <>
                        <span>🪄</span>
                        <span>BÓC TÁCH & SOẠN THẢO DỰ THẢO</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    id="action-btn-reset"
                    disabled={loading}
                    onClick={handleResetForm}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 py-3.5 px-5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 transform active:scale-[0.98] cursor-pointer shrink-0"
                    title="Xóa hết dữ liệu đã nhập và đưa bản thảo về trống để nhập mới"
                  >
                    <RotateCcw className="w-4.5 h-4.5 text-slate-500" />
                    <span>LÀM MỚI</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === "history" && (
            /* History archives layout View list */
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:bg-white text-xs"
                    placeholder="Tìm kiếm lịch sử theo địa phương, tài liệu..."
                  />
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-2.5 pr-1">
                  {filteredHistory.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Không tìm thấy bản dự thảo lưu trữ nào phù hợp.
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => applyHistoryItem(item)}
                        className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 text-left transition-all duration-150 cursor-pointer group flex justify-between items-start gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.timestamp}</span>
                            <span>•</span>
                            <span className="text-blue-700 font-bold">{item.communeName}</span>
                          </div>
                          <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 leading-relaxed group-hover:text-blue-600">
                            {item.documentTitle}
                          </h4>
                          {item.localNotes && (
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                              Đặc thù: {item.localNotes}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="hover:bg-red-50 p-1.5 rounded-lg text-slate-400 hover:text-red-600 shrink-0 transition-colors"
                          title="Xóa vĩnh viễn ghi chép nháp"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-center">
                <p className="text-slate-500 text-[10.5px] leading-relaxed">
                  Lịch sử lưu cục bộ trong trình duyệt khách bảo đảm an ninh chính trị, không truyền thông tin ra mạng ngoài khi không hoạt động.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right column (7/12): WYSIWYG Microsoft Word editing zone */}
        <section className="lg:col-span-7 flex flex-col gap-6" id="right-column-results">
          
          {loading ? (
            /* AI Progress Loading Simulation overlay card */
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex-1 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden bg-gradient-to-b from-white to-slate-50 min-h-[500px]">
              
              <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-[#b91c1c] transition-all duration-500 ease-out" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 animate-pulse">
                <RefreshCw className="w-8 h-8 text-[#b91c1c] animate-spin" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Đang bóc tách số liệu & dựng sườn kế hoạch</h3>
              <p className="text-[#b91c1c] font-semibold text-xs md:text-sm animate-pulse max-w-md mx-auto mb-6">
                “Hệ thống đang quét và bóc tách nhiệm vụ cơ sở, vui lòng đợi...”
              </p>

              {/* Progress Detail description lines style card block */}
              <div className="w-full max-w-sm bg-slate-50 rounded-xl p-4 border border-slate-200 text-left flex flex-col gap-3 font-mono">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tiến độ tổng hợp:</span>
                  <span className="text-[#b91c1c] text-sm font-bold">{loadingProgress}%</span>
                </div>
                
                {/* Dynamically simulated logs representing logical AI actions in Vietnam government context */}
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${loadingProgress >= 5 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                  <span className={loadingProgress >= 5 ? "text-emerald-700 font-semibold" : "text-slate-400"}>[1/4] Nhận dạng mục tiêu UBND Xã</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${loadingProgress >= 55 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                  <span className={loadingProgress >= 55 ? "text-emerald-700 font-semibold" : "text-slate-400"}>[2/4] Sa thải nhiệm vụ các Ban Ngành cấp tỉnh</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${loadingProgress >= 78 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                  <span className={loadingProgress >= 78 ? "text-emerald-700 font-semibold" : "text-slate-400"}>[3/4] Đồng bộ hóa tài nguyên đặc thù nông thôn</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${loadingProgress >= 92 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                  <span className={loadingProgress >= 92 ? "text-emerald-700 font-semibold" : "text-slate-400"}>[4/4] Áp cấu trúc Thể thức Nghị định 30</span>
                </div>
              </div>

              <div className="mt-8 text-[11px] text-slate-400 italic">
                Thời gian xử lý trung bình từ 10 - 25 giây phụ thuộc vào dung lượng văn bản tham chiếu. Vui lòng giữ kết nối.
              </div>

            </div>
          ) : (
            /* Document Editor Panel View */
            <div className="flex flex-col gap-4 flex-1">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">ẤN PHẨM KHUNG DỰ THẢO</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs"
                    title="Sao chép nội dung đã soạn thảo ra Clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check id="icon-copied" className="w-3.5 h-3.5 text-emerald-650 font-bold" />
                        <span className="text-emerald-650">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy id="icon-copy" className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  {/* Word Download download button */}
                  <button
                    type="button"
                    id="download-word-btn"
                    onClick={handleDownloadWord}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 border border-blue-800/10 cursor-pointer"
                    title="Tải tệp văn bản chuẩn về mở trên Microsoft Word"
                  >
                    <Download id="icon-word-download" className="w-3.5 h-3.5" />
                    <span>Tải xuống Word</span>
                  </button>
                </div>
              </div>

              {/* Intelligent Canvas Control Widget */}
              <div id="ai-canvas-widget" className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/40 border border-blue-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-blue-100/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🪄</span>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                      Chế độ Canvas: Yêu cầu AI sửa đổi bản thảo
                    </h4>
                    <span className="bg-blue-200/60 text-blue-800 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-sm animate-pulse">
                      Mới
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-700/80 font-medium">Lệnh AI viết lại, bổ sung chi tiết trực tiếp tại vệt Canvas</span>
                </div>

                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={editCommand}
                    onChange={(e) => setEditCommand(e.target.value)}
                    disabled={isEditingWithAi}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditWithAi();
                      }
                    }}
                    placeholder="Ví dụ: 'Sửa mục III giao việc thêm cho bộ phận Địa chính', 'Tóm tắt bớt phần mục đích yêu cầu', 'Thêm danh sách mốc thời gian hoàn thành cụ thể'..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg pl-3 pr-[110px] py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    id="submit-canvas-edit-btn"
                    onClick={() => handleEditWithAi()}
                    disabled={isEditingWithAi || !editCommand.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-700 hover:bg-blue-850 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[11px] px-3.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isEditingWithAi ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Đang sửa...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                        <span>Sửa đổi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Edit feedback error message */}
                {editErrorMsg && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-150 p-2.5 rounded-lg flex items-center gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{editErrorMsg}</span>
                  </div>
                )}

                {/* Quick actions suggest pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 select-none">
                    Lệnh gợi ý nhanh:
                  </span>
                  <button
                    type="button"
                    disabled={isEditingWithAi}
                    onClick={() => {
                      handleEditWithAi("Hãy đổi giọng văn sang phong cách cực kỳ trang nghiêm, chuẩn mượt hành chính công vụ nhất.");
                    }}
                    className="text-[10px] font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded px-2.5 py-1 transition-all cursor-pointer shadow-3xs"
                  >
                    ⚖️ Trang nghiêm hơn
                  </button>
                  <button
                    type="button"
                    disabled={isEditingWithAi}
                    onClick={() => {
                      handleEditWithAi("Hãy tóm tắt và cô đọng nội dung ngắn gọn súc tích lại, loại bỏ các chi tiết và câu từ rườm rà sáo rỗng.");
                    }}
                    className="text-[10px] font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded px-2.5 py-1 transition-all cursor-pointer shadow-3xs"
                  >
                    ✂️ Tóm gọn văn bản
                  </button>
                  <button
                    type="button"
                    disabled={isEditingWithAi}
                    onClick={() => {
                      handleEditWithAi("Hãy bổ sung thêm một mục nhỏ về công tác kiểm tra, giám sát chất lượng và tính minh bạch triển khai tại cơ sở.");
                    }}
                    className="text-[10px] font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded px-2.5 py-1 transition-all cursor-pointer shadow-3xs"
                  >
                    🛡️ Thêm ban giám sát
                  </button>
                  <button
                    type="button"
                    disabled={isEditingWithAi}
                    onClick={() => {
                      handleEditWithAi("Hãy bổ sung các nội dung phân công mốc thời gian hoàn thành (Deadline) cụ thể cho từng bộ phận công chức.");
                    }}
                    className="text-[10px] font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded px-2.5 py-1 transition-all cursor-pointer shadow-3xs"
                  >
                    📅 Bổ sung thời hạn hoàn thành
                  </button>
                </div>
              </div>

              {/* Physical Editor Container Canvas */}
              <div className="flex-1 flex flex-col">
                <Editor 
                  value={editorContent} 
                  onChange={setEditorContent} 
                  communeName={formData.communeName} 
                  areaUnit={formData.areaUnit} 
                />
              </div>

            </div>
          )}

          {/* Help compliant guidelines card section */}
          <HelpRegulations />

        </section>
      </main>

      {/* Corporate signature administrative footer */}
      <footer className="bg-[#0f172a] border-t border-slate-200 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
            <p className="font-medium text-slate-300">
              Hệ thống Trợ lý Hành chính Công - Cấp cơ sở 🇻🇳
            </p>
          </div>
          <p className="font-mono text-[10px] text-slate-400">
            Phiên bản v2.4.1-Stable | Thể thức Nghị định 30/2020/NĐ-CP • Bản quyền © 2026
          </p>
        </div>
      </footer>

      {/* Floating Chat Trigger Button */}
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => {
            setIsChatOpen(true);
            setTimeout(() => {
              const container = document.getElementById("chatbot-messages-container");
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            }, 100);
          }}
          className="fixed bottom-6 right-6 z-50 bg-blue-800 hover:bg-blue-900 text-white rounded-full p-4 shadow-2xl transition-all duration-300 flex items-center justify-center gap-2.5 border border-blue-750 hover:scale-105 active:scale-95 cursor-pointer"
          title="Mở Trợ lý AI công vụ"
        >
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </div>
          <MessageSquare className="w-5 h-5 animate-pulse text-white" />
          <span className="text-xs font-bold tracking-wide pr-1 font-sans">Trợ lý công vụ AI</span>
        </button>
      )}

      {/* Floating Chat Dialog Panel */}
      {isChatOpen && (
        <div 
          id="floating-chatbot-panel"
          className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-8 md:right-8 md:bottom-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border-b border-blue-950 px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs uppercase tracking-wide text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  Trợ lý Hành chính Công
                </span>
                <span className="text-[9px] text-blue-200/80 font-medium font-sans">Bản quyền Nghị định 30/2020/NĐ-CP</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showClearConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="text-[10px] text-white hover:text-red-100 font-bold px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-all cursor-pointer animate-pulse"
                    title="Xác nhận xóa hoàn toàn lịch sử chat"
                  >
                    Xác nhận xóa ✔
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[10px] text-blue-200 hover:text-white font-semibold px-2 py-1 bg-white/10 hover:bg-white/15 rounded transition-all cursor-pointer"
                    title="Hủy bỏ"
                  >
                    Hủy ✖
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[10px] text-blue-200 hover:text-red-300 font-semibold px-2 py-1 bg-white/10 hover:bg-white/15 rounded transition-all cursor-pointer"
                  title="Làm sạch lịch sử trò chuyện"
                >
                  Xóa nháp 🗑️
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/15 rounded text-blue-200 hover:text-white transition-colors cursor-pointer"
                title="Ẩn chatbot xuống thanh tác vụ"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Log Scroll */}
          <div 
            id="chatbot-messages-container"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-50/70"
          >
            {chatMessages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={msg.id || index}
                  className={`flex gap-2.5 max-w-[90%] ${isAssistant ? "self-start" : "self-end flex-row-reverse"}`}
                >
                  {/* Avatar bubble */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-2xs select-none font-bold text-xs ${
                    isAssistant 
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-blue-800 border-blue-900 text-white"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Body text bubble */}
                  <div className="flex flex-col gap-1 max-w-full">
                    <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border shadow-3xs ${
                      isAssistant
                        ? "bg-white border-slate-200 text-slate-800 rounded-tl-none text-left"
                        : "bg-blue-700 border-blue-700 text-white rounded-tr-none text-left font-medium"
                    }`}>
                      <p className="whitespace-pre-wrap text-left">{msg.content}</p>
                      
                      {/* Interactive flag badge indicating dynamic updates */}
                      {msg.canvasUpdated && (
                        <div className={`mt-2 py-1.5 px-2.5 rounded-lg border flex items-start gap-1.5 text-[10px] ${
                          isAssistant 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-white/15 text-white border-white/20"
                        }`}>
                          <span className="shrink-0 mt-0.5 animate-bounce text-sm leading-none">🪄</span>
                          <span className="text-left font-medium">Trợ lý đã tự động cập nhật sửa đổi này trực tiếp lên bản thảo Canvas bên phải!</span>
                        </div>
                      )}
                    </div>

                    {msg.timestamp && (
                      <span className={`text-[9px] text-slate-400 font-mono px-1.5 ${isAssistant ? "text-left" : "text-right"}`}>
                        {msg.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {isChatSending && (
              <div className="flex gap-2.5 max-w-[85%] self-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white border border-slate-200 text-slate-600 text-xs rounded-xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-2 shadow-3xs text-left">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="font-semibold text-slate-700 animate-pulse">Đồng chí vui lòng đợi trong giây lát...</span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="text-[11px] text-red-650 bg-red-50 border border-red-150 p-3 rounded-lg flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
                <span>{chatError}</span>
              </div>
            )}
          </div>

          {/* Quick-reply Suggestive Actions list bar */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-1.5 shrink-0 select-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mr-1 select-none flex items-center">Gợi ý nhanh:</span>
            <button
              type="button"
              disabled={isChatSending}
              onClick={() => handleSendChatMessage("Bổ sung một phần phân công trách nhiệm cho Hội đồng nhân dân cấp xã")}
              className="text-[10px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-3xs text-slate-600 hover:text-blue-900"
            >
              ⚖️ Thêm HĐND giám sát
            </button>
            <button
              type="button"
              disabled={isChatSending}
              onClick={() => handleSendChatMessage("Tôi thuộc xã khó khăn vùng cao, hãy nhấn mạnh ưu tiên phát triển kinh tế tuần hoàn, nông nghiệp hữu cơ.")}
              className="text-[10px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-3xs text-slate-600 hover:text-blue-900"
            >
              🏔️ Mục tiêu vùng cao
            </button>
            <button
              type="button"
              disabled={isChatSending}
              onClick={() => handleSendChatMessage("Chi tiết quy chuẩn Nghị định 30 về Quốc hiệu, tiêu ngữ và cách bố cục chữ ký điện tử trong văn bản")}
              className="text-[10px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-3xs text-slate-600 hover:text-blue-900"
            >
              📜 Hỏi thể thức NĐ 30
            </button>
          </div>

          {/* Input text console */}
          <div className="p-3 bg-white border-t border-slate-150 flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              disabled={isChatSending}
              placeholder="Hỏi đáp hoặc gõ yêu cầu điều chỉnh bản thảo..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all shadow-3xs"
            />
            <button
              type="button"
              onClick={() => handleSendChatMessage()}
              disabled={isChatSending || !chatInput.trim()}
              className="bg-blue-800 hover:bg-blue-900 disabled:bg-slate-250 disabled:text-slate-400 text-white px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
