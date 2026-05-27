import React, { useRef, useEffect, useState } from "react";
import { Toolbar } from "./Toolbar";

interface EditorProps {
  value: string;
  onChange: (newValue: string) => void;
  communeName: string;
  areaUnit: string;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, communeName, areaUnit }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(1);

  // Keep internal HTML matching remote modifications only when they diverge to prevent caret jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Recalculate dynamic pages based on content height
  useEffect(() => {
    if (editorRef.current) {
      const scrollHeight = editorRef.current.scrollHeight;
      // Standard A4 sheet height is 1123px. Padding top/bottommd:p-[65px] sums up around 130px.
      // We calculate exact A4 page folds.
      const calculatedPages = Math.max(1, Math.ceil((scrollHeight + 130) / 1123));
      if (calculatedPages !== numPages) {
        setNumPages(calculatedPages);
      }
    }
  }, [value, numPages]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      const scrollHeight = editorRef.current.scrollHeight;
      const calculatedPages = Math.max(1, Math.ceil((scrollHeight + 130) / 1123));
      if (calculatedPages !== numPages) {
        setNumPages(calculatedPages);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Add manual shortcuts for bold, italic, underline
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        document.execCommand('bold', false);
        handleInput();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        document.execCommand('italic', false);
        handleInput();
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        document.execCommand('underline', false);
        handleInput();
      }
    }
  };

  // Helper template to prefill a standard header structure if editor is empty
  const applyOfficialTemplate = () => {
    const defaultTemplate = `
      <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 20px;">
        <tbody>
          <tr style="border: none;">
            <td style="width: 45%; border: none; text-align: center; font-size: 11pt; font-family: 'Times New Roman', serif; vertical-align: top;">
              <strong>UBND ${communeName.toUpperCase() || "XÃ LÂM SƠN"}</strong><br>
              <strong>Số: &nbsp; &nbsp; &nbsp;/KH-UBND</strong><br>
              <span style="font-size: 11pt;"><i>V/v Ban hành hành động cơ sở</i></span>
            </td>
            <td style="width: 55%; border: none; text-align: center; font-size: 11pt; font-family: 'Times New Roman', serif; vertical-align: top;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              <div style="border-bottom: 1px solid #000; width: 120px; margin: 5px auto 0 auto;"></div>
              <br>
              <span style="font-size: 11pt; font-style: italic;">${communeName || "Lâm Sơn"}, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin-top: 20px; text-transform: uppercase;">
        KẾ HOẠCH<br>
        THỰC HIỆN NHIỆM VỤ ĐƯỢC GIAO TẠI VĂN BẢN CẤP TRÊN TRÊN ĐỊA BÀN ${communeName.toUpperCase() || "XÃ LÂM SƠN"}
      </h1>

      <p>Căn cứ tình hình thực tế và ý kiến chỉ đạo hành động liên quan, UBND ${communeName || "Xã Lâm Sơn"} xây dựng kế hoạch cụ thể hóa hành động như sau:</p>

      <h2 style="font-size: 14pt; font-weight: bold; margin-top: 20px;">I. MỤC ĐÍCH, YÊU CẦU</h2>
      <p>1. Mục đích: Cụ thể hóa kịp thời các mục tiêu của tài liệu cấp trên, bảo đảm tính khả thi cao tại địa bàn cơ sở.</p>
      <p>2. Yêu cầu: Xác định đúng người, đúng đầu việc, phân công nhiệm vụ chi tiết và kiểm soát sát sao kết quả.</p>

      <h2 style="font-size: 14pt; font-weight: bold; margin-top: 20px;">II. NỘI DUNG VÀ NHIỆM VỤ TRỌNG TÂM</h2>
      <p><strong>1. Lĩnh vực phát triển hành chính và chuyển đổi công nghệ:</strong></p>
      <p>– Tổ chức tăng cường tiếp cận dịch vụ trực tuyến địa phương.</p>
      <p>– Tập huấn liên tục cán bộ chuyên trách.</p>

      <h2 style="font-size: 14pt; font-weight: bold; margin-top: 20px;">III. TỔ CHỨC THỰC HIỆN</h2>
      <p>1. Văn phòng UBND xã: Chủ trì theo dõi tiến độ công vụ của các công chức chuyên môn.</p>
      <p>2. Các ban ngành đoàn thể, Trưởng các thôn bản: Phối hợp tuyên truyền cho nhân dân địa bàn cơ sở.</p>
      <br><br>
      <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 30px;">
        <tbody>
          <tr style="border: none;">
            <td style="width: 40%; border: none; font-size: 11pt; font-family: 'Times New Roman', serif; vertical-align: top; text-align: left; padding: 0;">
              <strong>Nơi nhận:</strong><br>
              - UBND Tỉnh (báo cáo);<br>
              - Thường trực Đảng ủy;<br>
              - Thường trực HĐND xã;<br>
              - Các Phòng chuyên môn xã;<br>
              - Lưu: VP.
            </td>
            <td style="width: 60%; border: none; text-align: center; font-size: 11pt; font-family: 'Times New Roman', serif; vertical-align: top; padding: 0;">
              <strong>TM. ỦY BAN NHÂN DÂN</strong><br>
              <strong>CHỦ TỊCH</strong><br>
              <br><br><br><br>
              <strong>Lý Đỗ Thành Quang</strong>
            </td>
          </tr>
        </tbody>
      </table>
    `;
    onChange(defaultTemplate);
  };

  return (
    <div className="flex flex-col h-[850px] bg-slate-50 rounded-lg border border-slate-300 shadow-sm overflow-hidden" id="rich-text-editor-container">
      {/* Top Toolbar */}
      <Toolbar editorRef={editorRef} onContentChange={handleInput} />

      {/* Editor Content Area / Canvas representing physical A4 paper */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-300 flex justify-center items-start h-[760px] shadow-inner">
        <div className="relative w-full max-w-[794px] bg-white shadow-2xl border border-slate-300/80 p-8 md:px-[65px] md:py-[65px] focus:outline-none transition-all duration-300"
             style={{
               fontFamily: "'Times New Roman', Times, serif",
               boxSizing: "border-box",
               minHeight: `${numPages * 1123}px`,
               height: `${numPages * 1123}px`
             }}>
          
          {/* Printable watermarks & guidelines helper */}
          <div className="absolute top-2 left-6 text-[10px] text-slate-400 select-none font-sans flex gap-4">
            <span>Khổ A4 (Chuẩn Nghị định 30/2020/NĐ-CP)</span>
            <span>•</span>
            <span>Lề trái: 30mm | Lề phải: 15mm</span>
          </div>

          {/* Actual contentEditable paper body */}
          <div
            id="commune-plan-editable-content"
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="prose max-w-none focus:outline-none text-justify text-black"
            style={{
              fontSize: "13pt",
              lineHeight: "1.3",
              fontFamily: "'Times New Roman', Times, serif",
              color: "#000000",
              minHeight: `${(numPages * 1123) - 130}px`,
              boxSizing: "border-box"
            }}
          />

          {value.trim() === "" && (
            <div className="absolute inset-x-[65px] top-[100px] text-slate-400 select-none pointer-events-none font-sans text-center">
              <p className="text-sm italic mb-4">Chưa có dữ liệu bản thảo kế hoạch.</p>
              <button
                type="button"
                onClick={applyOfficialTemplate}
                className="mt-2 pointer-events-auto px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-medium cursor-pointer transition-colors"
              >
                Áp dụng mẫu văn bản hành chính cơ bản
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer statistics counter & hints */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-1.5 flex justify-between items-center text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide">
            Độ phân trang chuẩn: A4
          </span>
          <span>Mẹo: Chọn một đoạn văn bản để áp dụng Định dạng tiêu đề (I, II, III).</span>
        </div>
        <div className="flex items-center gap-4 font-semibold text-slate-600">
          <span className="bg-blue-50 text-blue-800 border border-blue-100 rounded-sm px-2 py-0.5 text-[10px]">
             📄 Tổng số trang A4: {numPages} trang
          </span>
          <span>Kích thước: 13pt (Times New Roman)</span>
          <span>Ký tự: {value.length}</span>
        </div>
      </div>
    </div>
  );
};
