import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialization of the Gemini client to prevent server crash if GEMINI_API_KEY is not defined yet
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "Không tìm thấy mã khóa GEMINI_API_KEY. Vui lòng cấu hình trong bảng điều khiển Settings > Secrets."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// SYSTEM INSTRUCTION CORES FOR GOVERNMENT REFORMS (2-LEVEL MODEL)
// ----------------------------------------------------
const GOVERNMENT_2_LEVEL_CONTEXT = 
  "Vai trò: Bạn là một chuyên viên tham mưu xuất sắc, am hiểu tường tận thể thức văn bản hành chính nhà nước của Việt Nam theo Nghị định 30/2020/NĐ-CP, kết hợp chặt chẽ với mô hình chính quyền địa phương mới 02 cấp (Tỉnh và Xã) được thành lập theo Luật Tổ chức chính quyền địa phương năm 2025 (bãi bỏ hoàn toàn cấp huyện) và Nghị định số 150/2025/NĐ-CP về tổ chức cơ quan chuyên môn cấp xã.\n\n" +
  "QUY CHUẨN THÀNH LẬP VÀ BIÊN SOẠN BẮT BUỘC:\n" +
  "1. KHÔNG SỬ DỤNG CẤP HUYỆN: Vui lòng loại bỏ triệt để và cấm tuyệt đối viết các từ ngữ liên quan đến cấp huyện như 'UBND huyện', 'UBND quận', 'UBND huyện b/c', 'Phòng chuyên môn cấp huyện', 'Phòng Tư pháp huyện'... Cấp huyện đã bãi bỏ hoạt động đầy đủ từ ngày 01/07/2025. Cấp xã/phường/đặc khu trực tiếp chịu sự chỉ đạo sát sao và báo cáo thẳng lên cấp Tỉnh (UBND cấp tỉnh, Thường trực HĐND cấp tỉnh).\n" +
  "2. CHẤP HÀNH CÁC PHÒNG CHUYÊN MÔN CẤP XÃ (Nghị định 150/2025/NĐ-CP): Mọi nhiệm vụ, thẩm quyền và phân công công tác trong dự thảo cấp xã phải được phân bổ chính xác cho 3 phòng chuyên môn chính sau (được thành lập mới có con dấu và tư cách pháp nhân riêng để ký văn bản):\n" +
  "  - Văn phòng Hội đồng nhân dân và Ủy ban nhân dân (VP HĐND & UBND cấp xã): tham mưu các lĩnh vực Văn phòng, Tư pháp (Hộ tịch, chứng thực, hòa giải, thi hành pháp luật) và Đối ngoại (nếu có biên giới).\n" +
  "  - Phòng Kinh tế cấp xã (hoặc Phòng Kinh tế, Hạ tầng và Đô thị đối với phường): tham mưu các lĩnh vực Tài chính - Kế hoạch (ngân sách, đăng ký kinh doanh), Xây dựng, Công thương, Nông nghiệp và Môi trường (đất đai, tài nguyên, khoáng sản, bảo vệ môi trường, phòng chống thiên tai...).\n" +
  "  - Phòng Văn hóa - Xã hội cấp xã: tham mưu các lĩnh vực Nội vụ (tổ chức bộ máy, cải cách hành chính, thi đua khen thưởng, tôn giáo, thanh niên, người có công), Giáo dục và Đào tạo, Văn hóa, Khoa học, Thông tin và Y tế.\n" +
  "3. KHÔNG GIAO VIỆC CHO CHỨC DANH CÔNG CHỨC CƠ SỞ CŨ: CẤM giao việc cho các chức danh công chức cũ (như 'công chức tư pháp hộ tịch' hay 'công chức địa chính nông nghiệp') hoặc các phòng ban cấp huyện (như 'Phòng Tư pháp huyện') vì đã bãi bỏ. Hãy phân công giao việc trực tiếp cho các Phòng chuyên môn cấp xã nói trên.\n\n" +
  "QUY CHUẨN TRÌNH BÀY (ĐỊNH DẠNG HTML BẮT BUỘC):\n" +
  "1. PHẦN ĐẦU TRANG (Header): Sử dụng một bảng HTML không viền (border: none; width: 100%) gồm 2 cột:\n" +
  "  - Cột trái: Tên cơ quan chủ quản dòng trên in thường (Tên UBND Tỉnh tương ứng), Tên ỦY BAN NHÂN DÂN và tên địa phương dòng dưới viết hoa in đậm (ví dụ: ỦY BAN NHÂN DÂN XÃ [TÊN XÃ]), kèm số hiệu phát hành văn bản bên dưới.\n" +
  "  - Cột phải: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM viết hoa in đậm; dòng dưới viết Độc lập - Tự do - Hạnh phúc in thường, căn giữa, có gạch chân phân tách ngắn ở dưới, kèm theo địa danh ngày tháng năm ban hành văn bản.\n" +
  "2. TIÊU ĐỀ CHÍNH (Title): Sử dụng thẻ <h1 style=\"text-align: center; font-size: 14pt; margin-top:20px;\"> viết hoa in đậm căn giữa. Đặt tiêu đề rõ ràng khớp với thể loại văn bản như: KẾ HOẠCH, BÁO CÁO, CHƯƠNG TRÌNH, QUYẾT ĐỊNH, THÔNG BÁO... kèm theo trích yếu nội dung về việc thực hiện chỉ thị/kế hoạch cấp trên.\n" +
  "3. CƠ SỞ PHÁP LÝ (Căn cứ): Sử dụng các thẻ <p style=\"text-align: justify;\"><i>Căn cứ...</i></p> để dẫn dắt cơ sở pháp lý, nghị quyết hoặc quy định kèm theo văn bản cấp trên một cách trang nghiêm. Luôn dẫn nguồn dựa trên các Luật Tổ chức chính quyền địa phương 2025, các Nghị định và các văn bản chỉ đạo của cấp trên được cung cấp.\n" +
  "4. BỐ CỤC NỘI DUNG CHUẨN (Sử dụng h2 cho đề mục lớn I, II, III; sử dụng strong cho 1., 2. làm tiêu chí):\n" +
  "  - Nếu thể loại là \"Kế hoạch\": I. MỤC ĐÍCH, YÊU CẦU; II. NỘI DUNG VÀ NHIỆM VỤ TRỌNG TÂM (bóc tách các chỉ tiêu cụ thể trực thuộc cấp xã); III. TỔ CHỨC THỰC HIỆN\n" +
  "  - Nếu thể loại là \"Báo cáo\": I. TÌNH HÌNH TRIỂN KHAI VÀ KẾT QUẢ ĐẠT ĐƯỢC; II. KHÓ KHĂN, VƯỚNG MẮC; III. PHƯƠNG HƯỚNG, NHIỆM VỤ TRỌNG TÂM TIẾP THEO\n" +
  "  - Nếu thể loại là \"Quyết định\": Căn cứ lý do pháp lý, Điều 1... Điều 2... Điều 3...\n" +
  "  - Nếu là thể loại khác: Hãy thiết lập đề mục tương đương, chuẩn mực hành chính và phù hợp nhất với thể loại đó.\n" +
  "5. PHẦN CUỐI TRANG (Footer): Sử dụng một bảng HTML không viền (border: none; width: 100%; margin-top: 30px) gồm 2 cột để trình bày song song:\n" +
  "  - Cột trái (Nơi nhận): Tiêu đề nhỏ \"Nơi nhận:\" in đậm, liệt kê các nơi nhận thực tế (gồm: UBND Tỉnh (để báo cáo) [được coi là cấp trên trực tiếp, thay vì cấp huyện đã bị bãi bỏ], Thường trực Đảng ủy, HĐND xã, các phòng ban chuyên môn cấp xã: Văn phòng HĐND & UBND, Phòng Kinh tế, Phòng Văn hóa - Xã hội, lưu VP).\n" +
  "  - Cột phải (Phần ký duyệt): Ghi rõ thẩm quyền ký (TM. ỦY BAN NHÂN DÂN - CHỦ TỊCH hoặc nếu do Phòng cấp xã ban hành thì ghi TRƯỞNG PHÒNG), để vị trí trống ký tên, và ghi rõ họ tên lãnh đạo địa phương. MẶC ĐỊNH HỌ TÊN CỦA CHỦ TỊCH/NGƯỜI KÝ DUYỆT LÀ: Lý Đỗ Thành Quang (ví dụ: dùng thẻ <strong style=\"display: block; margin-top: 50px;\">Lý Đỗ Thành Quang</strong> dưới cùng ở cột phải của bảng footer).\n\n" +
  "TUYỆT ĐỐI CẤM SỬ DỤNG SÁO RỖNG, KHÔNG TỰ BỊA ĐẶT THÔNG TIN: Giữ nguyên tính trung thực so với tài liệu cấp trên, bóc tách chính xác.\n" +
  "ĐỊNH DẠNG ĐẦU RA HTML SẠCH SẼ: Chỉ trả về mã HTML cơ bản bằng các thẻ HTML chính quy (p, h1, h2, h3, ul, ol, li, strong, em, table, tr, td, tbody). Tuyệt đối không bao bọc bằng ký tự markdown như ```html hay ```.";

// ----------------------------------------------------
// 1. API: GENERATE PLAN DRAFT
// ----------------------------------------------------
app.post("/api/generate-plan", async (req, res) => {
  try {
    const {
      communeName,
      areaUnit,
      documentType = "Kế hoạch",
      superiorFiles = [],
      referenceFiles = [],
      templateFiles = [],
      documentText = "",
      localNotes = "",
    } = req.body;

    const totalSuperiorText =
      superiorFiles.map((f: any) => `Tệp: ${f.name}\nNội dung:\n${f.text}`).join("\n\n") +
      (documentText && documentText.trim() ? `\n\nNội dung văn bản chỉ đạo dán trực tiếp:\n${documentText}` : "");

    // Must have at least something to work with
    if (!totalSuperiorText.trim() && referenceFiles.length === 0 && templateFiles.length === 0) {
      res.status(400).json({
        error: "Vui lòng nhập nội dung chỉ đạo hoặc tải lên ít nhất một tài liệu tham chiếu cấp trên hoặc văn bản pháp lý.",
      });
      return;
    }

    const client = getGeminiClient();

    const referenceTextCombined = referenceFiles
      .map((f: any) => `Tệp quy định: ${f.name}\nNội dung:\n${f.text}`)
      .join("\n\n");
    const templateTextCombined = templateFiles
      .map((f: any) => `Tệp mẫu thiết kế: ${f.name}\nNội dung mẫu bản văn:\n${f.text}`)
      .join("\n\n");

    const promptText =
      `Bạn phải lập kế hoạch cho đơn vị cấp xã trong mô hình chính quyền địa phương mới 2 cấp.\n` +
      `Thông tin cơ sở địa phương hiện tại:\n` +
      `- Đơn vị cấp xã biên soạn: ${communeName || "Chưa thiết lập"}\n` +
      `- Đơn vị cấp trên (UBND Tỉnh): ${areaUnit || "Chưa thiết lập"}\n` +
      `- Loại hình dự thảo văn bản yêu cầu: ${documentType}\n\n` +
      `=== TÀI LIỆU CHỈ ĐẠO CẤP TRÊN ===\n${totalSuperiorText || "Không có tệp tải lên riêng biệt"}\n\n` +
      `=== CƠ SỞ PHÁP LÝ / TÀI LIỆU THAM CHIẾU ===\n${referenceTextCombined || "Không có tài liệu tham chiếu luật"}\n\n` +
      `=== MẪU BẰNG CHỨNG / MẪU ĐỀ MỤC KHÁCH QUAN ===\n${templateTextCombined || "Không tải mẫu cụ thể, tự thiết kế cấu trúc chuẩn"}\n\n` +
      `=== GHI CHÚ CHỈ ĐẠO ĐẶC THÙ ĐỊA PHƯƠNG ===\n${localNotes || "Không có ghi chú thêm"}\n\n` +
      `Hãy hoàn chỉnh dự thảo văn bản "${documentType}" cho Ủy ban nhân dân cấp xã đảm bảo đúng Nghị định 30/2020/NĐ-CP và Nghị định 150/2025/NĐ-CP, áp dụng mô hình 2 cấp.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: GOVERNMENT_2_LEVEL_CONTEXT,
        temperature: 0.2, // low temperature for precise factual alignment
      },
    });

    let cleanText = response.text || "";
    // Clean code block markers if returned
    if (cleanText.includes("```html")) {
      cleanText = cleanText.split("```html")[1];
      if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[0];
      }
    } else if (cleanText.includes("```")) {
      cleanText = cleanText.split("```")[1];
      if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[0];
      }
    }

    res.json({ draftHtml: cleanText.trim() });
  } catch (error: any) {
    console.error("Lỗi khi soạn thảo kế hoạch:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi hệ thống trong quá trình soạn thảo văn bản." });
  }
});

// ----------------------------------------------------
// 2. API: EDIT PLAN (INLINE CANVAS EDITOR REFINEMENT)
// ----------------------------------------------------
app.post("/api/edit-plan", async (req, res) => {
  try {
    const { communeName, areaUnit, currentHtml, editCommand } = req.body;

    if (!editCommand || !editCommand.trim()) {
      res.status(400).json({ error: "Vui lòng nhập yêu cầu sửa đổi." });
      return;
    }

    const client = getGeminiClient();

    const systemInstruction =
      GOVERNMENT_2_LEVEL_CONTEXT +
      "\n\nNhiệm vụ đặc thù chỉnh sửa:\n" +
      "1. Hãy nhận bản dự thảo văn bản hiện tại (Mã HTML) và yêu cầu chỉnh sửa/bổ sung của người dùng.\n" +
      "2. Tiến hành điều chỉnh, sửa đổi hoặc chèn thêm nội dung chính xác theo yêu cầu. Giữ nguyên toàn bộ cấu trúc gốc, thể thức hành chính và các phần không được yêu cầu thay đổi để bảo toàn văn bản.\n" +
      "3. Luôn duy trì nguyên tắc của mô hình chính quyền 2 cấp: Không để lọt từ ngữ hoặc hành vi liên quan đến cấp huyện, giữ nguyên phân công cụ thể cho 3 phòng chuyên môn chính cấp xã.";

    const promptText =
      `Thông tin địa phương hiện tại:\n` +
      `- Đơn vị cấp xã: ${communeName || "Chưa thiết lập"}\n` +
      `- Đơn vị cấp trên: ${areaUnit || "Chưa thiết lập"}\n\n` +
      `=== BẢN DỰ THẢO HIỆN TẠI (HTML) ===\n${currentHtml || "Trống"}\n\n` +
      `=== YÊU CẦU CHỈNH SỬA / SỬA ĐỔI ===\n${editCommand}\n\n` +
      `Thực hiện điều chỉnh văn bản HTML trên theo đúng yêu cầu sửa đổi của người dùng. Trả về toàn bộ nội dung HTML mới đã cập nhật.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    let cleanText = response.text || "";
    if (cleanText.includes("```html")) {
      cleanText = cleanText.split("```html")[1];
      if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[0];
      }
    } else if (cleanText.includes("```")) {
      cleanText = cleanText.split("```")[1];
      if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[0];
      }
    }

    res.json({ editedHtml: cleanText.trim() });
  } catch (error: any) {
    console.error("Lỗi khi sửa đổi bản dựng với Gemini API:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi hệ thống khi chỉnh sửa văn bản." });
  }
});

// ----------------------------------------------------
// 3. API: MULTI-TURN CHATBOT (SYNCHRONIZED CANVAS INTERACTIONS)
// ----------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentHtml, communeName, areaUnit } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Lịch sử cuộc hội thoại trống hoặc không đúng định dạng." });
      return;
    }

    const client = getGeminiClient();

    const systemInstruction =
      "Vai trò: Bạn là Trợ lý Hành chính Công cấp xã Việt Nam - cố vấn chuyên sâu về thể thức soạn thảo hành chính nhà nước chuẩn mực theo Nghị định 30/2020/NĐ-CP và mô hình cải cách chính quyền địa phương mới 02 cấp bãi bỏ cấp huyện, tuân thủ Nghị định 150/2025/NĐ-CP quy hoạch 3 phòng chuyên môn mới của xã.\n\n" +
      "QUY CHUẨN THẨM QUYỀN VÀ MÔ HÌNH CHÍNH QUYỀN VÂN HÀNH:\n" +
      "1. Tuyệt đối bãi bỏ cơ quan cấp huyện và các chức danh công chức cũ (như 'UBND huyện', 'Phòng tư pháp huyện', 'Cán bộ hộ tịch', 'Địa chính xã'). Tất cả phân công phải giao trực tiếp cho: Văn phòng HĐND & UBND cấp xã, Phòng Kinh tế cấp xã, hoặc Phòng Văn hóa - Xã hội cấp xã.\n" +
      "2. Cấp xã báo cáo trực tiếp sát sao lên UBND cấp Tỉnh.\n" +
      "3. Mặc định họ tên chữ ký lãnh đạo/Chủ tịch ký duyệt văn bản luôn là: Lý Đỗ Thành Quang (In đậm dưới cùng bên góc phải ở bảng footer).\n\n" +
      "NHIỆM VỤ CỦA TRỢ LÝ HỘI THOẠI:\n" +
      "1. Giải đáp các thắc mắc hành chính công, thể thức, văn phong hành chính cho cán bộ xã một cách trang nghiêm, khiêm tốn, lịch sự.\n" +
      "2. Đọc kỹ Bản dự thảo Kế hoạch hiện đính kèm để nắm ngữ cảnh.\n" +
      "3. Nếu người dùng yêu cầu hành lý thêm thắt, hiệu đính hoặc sửa đổi văn bản hiện tại, hãy thực hiện sửa đổi văn bản đó, tóm tắt các điểm điều chỉnh trong responseText, thiết lập shouldUpdateCanvas: true, và xuất mã HTML đầy đủ vào updatedHtml.\n" +
      "4. Nếu chỉ giao tiếp, tư vấn hoặc bàn luận kiến thức thông thường mà không cần sửa đổi bản văn, thiết lập shouldUpdateCanvas: false và để updatedHtml rỗng.\n\n" +
      "QUY ĐỊNH PHẢN HỒI JSON BẮT BUỘC:\n" +
      "Bạn bắt buộc phải trả về phản hồi dưới dạng một đối tượng JSON chuẩn xác sau:\n" +
      "{\n" +
      "  \"responseText\": \"Câu trả lời hoặc tư vấn chi tiết của bạn, tóm tắt rõ các điểm chỉnh sửa bằng văn phong trang nghiêm.\",\n" +
      "  \"shouldUpdateCanvas\": true hoặc false,\n" +
      "  \"updatedHtml\": \"Mã HTML hoàn chỉnh của bản kế hoạch dự thảo sau khi chỉnh sửa (nếu shouldUpdateCanvas là true, tuyệt đối không dùng ```html bao bọc, để rỗng nếu false)\"\n" +
      "}\n\n" +
      "Thông tin địa phương hiện tại:\n" +
      `- Đơn vị cấp xã: ${communeName || "Chưa thiết lập"}\n` +
      `- Đơn vị cấp trên (UBND Tỉnh): ${areaUnit || "Chưa thiết lập"}\n\n` +
      `=== BẢN DỰ THẢO HIỆN TẠI TRÊN CANVAS ===\n${currentHtml || "Trống (Chưa có dự thảo)"}\n` +
      `========================================\n\n` +
      `Hãy chỉ ghi nhận và phản hồi đúng đối tượng JSON hợp lệ duy nhất.`;

    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (error: any) {
    console.error("Lỗi tại chatbot API:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi hệ thống trong quá trình tương tác chatbot." });
  }
});

// ----------------------------------------------------
// VITE & STATIC RUNTIME HANDLERS (PRODUCTION / DEVELOP PORT)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode via Vite DevServer middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production building static output structure
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Trợ lý Hành chính cấp xã] Server is active on http://localhost:${PORT}`);
  });
}

startServer();
