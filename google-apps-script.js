/**
 * Google Apps Script สำหรับรับผลสอบจาก Next.js Web App
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheet ที่ต้องการเก็บผลสอบ
 * 2. เมนูด้านบน เลือก "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ไปวางแทนที่
 * 4. กดปุ่มบันทึก 💾 (Save)
 * 5. กดปุ่มสีน้ำเงินมุมขวาบน "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: รูปฟันเฟือง ⚙️ > "เว็บแอป" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: บันทึกผลสอบบทที่ 2
 *    - ดำเนินการในฐานะ (Execute as): "ฉัน" (Me)
 *    - ผู้มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)  <-- สำคัญมาก! ต้องเลือก Anyone
 * 8. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) และกด "ให้สิทธิ์เข้าถึง" (Authorize access)
 * 9. คัดลอก "URL ของเว็บแอป" (Web app URL) ที่ได้ มาใส่ในไฟล์ .env.local หรือในหน้าตั้งค่าของระบบ
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // สร้างหัวตารางอัตโนมัติหากยังไม่มีข้อมูล
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วัน-เวลาที่ส่ง",
        "ชื่อ-นามสกุล",
        "รหัสนักศึกษา/เลขที่",
        "ห้อง/ตอนเรียน",
        "คะแนนที่ได้",
        "คะแนนเต็ม",
        "ร้อยละ (%)",
        "เวลาที่ใช้",
        "รายละเอียดคำตอบ"
      ]);
      
      // จัดรูปแบบหัวตาราง
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#2563eb");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    // บันทึกแถวข้อมูล
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("th-TH"),
      data.fullName || "-",
      data.studentId || "-",
      data.classroom || "-",
      data.score !== undefined ? data.score : 0,
      data.total !== undefined ? data.total : 20,
      data.percentage || "0%",
      data.timeSpent || "-",
      JSON.stringify(data.answers || {})
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data recorded successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script Web App is active and ready."
  })).setMimeType(ContentService.MimeType.JSON);
}
