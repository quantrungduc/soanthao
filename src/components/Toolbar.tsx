import React from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface ToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentChange: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editorRef, onContentChange }) => {
  const executeCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onContentChange();
    }
  };

  const handleHeading = (tag: string) => {
    // Under document.execCommand, formatBlock is used to change tags
    executeCommand("formatBlock", tag);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-300 rounded-t-lg sticky top-0 z-10">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => executeCommand("undo")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Hoàn tác (Ctrl+Z)"
      >
        <Undo id="btn-undo" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("redo")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Làm lại (Ctrl+Y)"
      >
        <Redo id="btn-redo" className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => handleHeading("<h1>")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors font-bold text-xs flex items-center gap-1"
        title="Tiêu đề chính (Phần lớn I, II)"
      >
        <Heading1 id="btn-h1" className="w-4 h-4" />
        <span className="text-[10px]">I</span>
      </button>
      <button
        type="button"
        onClick={() => handleHeading("<h2>")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors font-bold text-xs flex items-center gap-1"
        title="Tiêu đề mục lục (Mục lớn 1., 2.)"
      >
        <Heading2 id="btn-h2" className="w-4 h-4" />
        <span className="text-[10px]">1</span>
      </button>
      <button
        type="button"
        onClick={() => handleHeading("<h3>")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors font-bold text-xs flex items-center gap-1"
        title="Tiêu đề nhỏ (Tiêu đề tiểu mục a., b.)"
      >
        <Heading3 id="btn-h3" className="w-4 h-4" />
        <span className="text-[10px]">a</span>
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Basic text style */}
      <button
        type="button"
        onClick={() => executeCommand("bold")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors font-bold"
        title="In đậm (Ctrl+B)"
      >
        <Bold id="btn-bold" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("italic")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors italic"
        title="In nghiêng (Ctrl+I)"
      >
        <Italic id="btn-italic" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("underline")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors underline"
        title="Gạch chân (Ctrl+U)"
      >
        <Underline id="btn-underline" className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => executeCommand("justifyLeft")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Căn lề trái"
      >
        <AlignLeft id="btn-align-left" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("justifyCenter")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Căn giữa"
      >
        <AlignCenter id="btn-align-center" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("justifyRight")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Căn lề phải"
      >
        <AlignRight id="btn-align-right" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("justifyFull")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Căn đều hai bên (Chuẩn Nghị định 30)"
      >
        <AlignJustify id="btn-align-justify" className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => executeCommand("insertUnorderedList")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Danh sách dấu tròn"
      >
         <List id="btn-list-bullet" className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => executeCommand("insertOrderedList")}
        className="p-1.5 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors"
        title="Danh sách đánh số"
      >
        <ListOrdered id="btn-list-ordered" className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-300 mx-1" />

      {/* Clear style */}
      <button
        type="button"
        onClick={() => {
          executeCommand("removeFormat");
          executeCommand("formatBlock", "<p>");
        }}
        className="p-1.5 hover:bg-red-100 text-red-600 hover:text-red-800 rounded-md transition-colors ml-auto"
        title="Nhập lại dạng thường (Xóa định dạng)"
      >
        <Eraser id="btn-clear-format" className="w-4 h-4" />
      </button>
    </div>
  );
};
