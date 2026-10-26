import questionsData from "@/data/questions.json";

function formatThaiDate(date) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0 วินาที";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} วินาที`;
  return `${mins} นาที ${secs} วินาที`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      studentId = "",
      classroom = "",
      answers = {},
      timeSpent = 0,
      googleSheetUrlOverride = "",
    } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return Response.json(
        { success: false, error: "กรุณาระบุชื่อ-นามสกุลของผู้เข้าสอบ" },
        { status: 400 }
      );
    }

    const cleanFullName = fullName.trim();
    const cleanStudentId = (studentId || "").trim();
    const cleanClassroom = (classroom || "").trim();

    // Grade answers
    let score = 0;
    const total = questionsData.length;
    const breakdown = [];
    const answersSummaryMap = {};

    questionsData.forEach((q) => {
      const qId = q.id;
      const selectedKey = (answers[qId] || "").trim();
      const isCorrect = selectedKey === q.correctKey;

      if (isCorrect) {
        score += 1;
      }

      const selectedOption = q.options.find((opt) => opt.key === selectedKey);
      const selectedText = selectedOption ? selectedOption.text : "ไม่ได้ตอบ";

      breakdown.push({
        id: qId,
        question: q.question,
        options: q.options,
        selectedKey: selectedKey || "-",
        selectedText,
        correctKey: q.correctKey,
        correctAnswer: q.correctAnswer,
        isCorrect,
      });

      answersSummaryMap[`ข้อ ${qId}`] = `${selectedKey || "-"} (${isCorrect ? "✓ ถูก" : "✗ ผิด"})`;
    });

    const percentage = Math.round((score / total) * 100);
    const submissionTimestamp = formatThaiDate(new Date());
    const timeSpentFormatted = formatDuration(timeSpent);

    // Determine target Google Sheets URL
    const targetSheetUrl =
      (googleSheetUrlOverride && googleSheetUrlOverride.trim()) ||
      process.env.GOOGLE_SHEET_WEB_APP_URL ||
      "";

    let googleSheetStatus = "not_configured";
    let googleSheetMessage = "ยังไม่ได้เชื่อมต่อ Google Sheets Web App URL";

    if (targetSheetUrl) {
      try {
        const payload = {
          action: "submit",
          timestamp: submissionTimestamp,
          fullName: cleanFullName,
          studentId: cleanStudentId || "-",
          classroom: cleanClassroom || "-",
          score,
          total,
          percentage: `${percentage}%`,
          timeSpent: timeSpentFormatted,
          answers: answersSummaryMap,
        };

        const sheetResponse = await fetch(targetSheetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
        });

        if (sheetResponse.ok || sheetResponse.status === 302) {
          googleSheetStatus = "saved";
          googleSheetMessage = "บันทึกคะแนนลง Google Sheet สำเร็จ";
        } else {
          const respText = await sheetResponse.text().catch(() => "");
          googleSheetStatus = "error";
          googleSheetMessage = `บันทึกไม่สำเร็จ (HTTP ${sheetResponse.status}): ${respText.slice(0, 100)}`;
        }
      } catch (sheetError) {
        console.error("Google Sheets Webhook Error:", sheetError);
        googleSheetStatus = "error";
        googleSheetMessage = `การเชื่อมต่อ Google Sheet ขัดข้อง: ${sheetError.message}`;
      }
    }

    return Response.json({
      success: true,
      result: {
        fullName: cleanFullName,
        studentId: cleanStudentId,
        classroom: cleanClassroom,
        score,
        total,
        percentage,
        timeSpent: timeSpentFormatted,
        submissionTimestamp,
        googleSheetStatus,
        googleSheetMessage,
        breakdown,
      },
    });
  } catch (error) {
    console.error("Submission API Error:", error);
    return Response.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจข้อสอบ: " + error.message },
      { status: 500 }
    );
  }
}
