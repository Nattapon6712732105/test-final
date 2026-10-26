export async function POST(request) {
  try {
    const { url } = await request.json();
    const targetUrl = (url && url.trim()) || process.env.GOOGLE_SHEET_WEB_APP_URL || "";

    if (!targetUrl) {
      return Response.json(
        { success: false, error: "กรุณาระบุ Google Sheets Web App URL" },
        { status: 400 }
      );
    }

    const testPayload = {
      action: "test_connection",
      timestamp: new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date()),
      fullName: "ทดสอบการเชื่อมต่อระบบ (Test)",
      studentId: "TEST-001",
      classroom: "ทดสอบ",
      score: 20,
      total: 20,
      percentage: "100%",
      timeSpent: "1 วินาที",
      answers: { "ทดสอบ": "ระบบทำงานปกติ" },
    };

    const resp = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
      redirect: "follow",
    });

    if (resp.ok || resp.status === 302) {
      return Response.json({
        success: true,
        message: "เชื่อมต่อ Google Sheet สำเร็จ! ส่งแถวข้อมูลทดสอบเรียบร้อย",
      });
    } else {
      const text = await resp.text().catch(() => "");
      return Response.json(
        {
          success: false,
          error: `Google Sheets ส่งคืนสถานะ HTTP ${resp.status}: ${text.slice(0, 150)}`,
        },
        { status: 400 }
      );
    }
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: `ไม่สามารถเชื่อมต่อ Google Sheets Web App ได้ (${err.message}) ตรวจสอบว่าได้เลือก 'Who has access: Anyone' แล้วหรือยัง`,
      },
      { status: 500 }
    );
  }
}
