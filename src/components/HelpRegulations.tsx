import React from "react";
import { Info, CheckCircle2, FileText, AlertCircle } from "lucide-react";

export const HelpRegulations: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm" id="regulatory-compliance-card">
      <div className="flex items-center gap-2 mb-3">
        <Info id="icon-info-regulations" className="w-5 h-5 text-blue-700 animate-pulse" />
        <h3 className="font-bold text-slate-800 text-sm md:text-base">Mẹo Soạn thảo đúng Nghị định 30/2020/NĐ-CP</h3>
      </div>
      
      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Nghị định số <strong>30/2020/NĐ-CP</strong> quy định về công tác văn thư và thể thức trình bày văn bản hành chính nhà nước thống nhất:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <h4 className="font-semibold text-xs text-slate-800">Khổ giấy & Phông</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Khổ <strong>A4 (210mm x 297mm)</strong>, in đứng. Phông chuẩn: <strong>Times New Roman</strong> tiếng Việt, màu đen.
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <h4 className="font-semibold text-xs text-slate-800">Căn lề chuẩn</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Lề trên/dưới: <strong>20 - 25 mm</strong>.<br />
            Lề trái: <strong>30 - 35 mm</strong> (để khâu đóng tập).<br />
            Lề phải: <strong>15 - 20 mm</strong>.
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <h4 className="font-semibold text-xs text-slate-800">Cỡ chữ & Khoảng cách</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Phần nội dung chính dùng cỡ <strong>13 hoặc 14pt</strong>. Khoảng cách dòng từ Single đến 1.5 lines. lùi đầu dòng <strong>1 - 1.27cm</strong>.
          </p>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500">
        <span>Giao diện bám sát chuẩn canh lề in ấn</span>
        <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">Tự động cân chỉnh khi xuất Word</span>
      </div>
    </div>
  );
};
