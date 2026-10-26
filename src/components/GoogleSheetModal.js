"use client";

import React, { useState } from "react";

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
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
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#2563eb");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
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
  return ContentService.createTextOutput("Google Apps Script Quiz Webhook Ready");
}`;

export default function GoogleSheetModal({
  isOpen,
  onClose,
  sheetUrl,
  onSaveSheetUrl,
}) {
  const [inputUrl, setInputUrl] = useState(sheetUrl || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({
        success: false,
        message: "กรุณาวาง Web App URL ก่อนกดทดสอบ",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSheetUrl(inputUrl.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h3 className="modal-title">
            <span>📊 ตั้งค่าการเชื่อมต่อ Google Sheets</span>
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: "0.925rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <p style={{ marginBottom: "1rem" }}>
            ระบบนี้จะส่งคะแนนและรายละเอียดการทำข้อสอบไปบันทึกลงใน Google Sheet ของคุณโดยอัตโนมัติ 
            ผ่าน <strong>Google Apps Script Web App</strong> (ฟรี 100% ไม่ต้องเปิดบัตรเครดิตหรือ GCP)
          </p>

          <h4 style={{ color: "#ffffff", fontWeight: 600, marginTop: "1.25rem", marginBottom: "0.5rem" }}>
            📌 วิธีตั้งค่า Google Sheets (ทำครั้งเดียว):
          </h4>
          <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            <li>เปิด <a href="https://sheets.new" target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>Google Sheets</a> แผ่นใหม่</li>
            <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
            <li>ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดด้านล่างนี้ลงไป</li>
            <li>กดปุ่มสีน้ำเงิน <strong>"ทำให้ใช้งานได้" (Deploy)</strong> &gt; <strong>"การทำให้ใช้งานได้รายการใหม่" (New deployment)</strong></li>
            <li>เลือกประเภท ⚙️ <strong>"เว็บแอป" (Web app)</strong></li>
            <li>
              ตั้งค่า:
              <ul style={{ paddingLeft: "1.25rem", marginTop: "0.25rem" }}>
                <li>ดำเนินการในฐานะ: <strong>ฉัน (Me)</strong></li>
                <li>ผู้มีสิทธิ์เข้าถึง: <strong style={{ color: "var(--accent-cyan)" }}>ทุกคน (Anyone)</strong> *(สำคัญมาก)*</li>
              </ul>
            </li>
            <li>กด <strong>Deploy</strong> แล้วกดให้สิทธิ์ (Authorize) &gt; คัดลอก <strong>URL ของเว็บแอป</strong> มาวางในช่องด้านล่าง</li>
          </ol>

          {/* Code block with copy button */}
          <div style={{ marginTop: "1rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>โค้ด Apps Script:</span>
              <button
                type="button"
                className="btn-secondary"
                style={{ minHeight: "32px", padding: "0.2rem 0.65rem", fontSize: "0.8rem" }}
                onClick={handleCopyCode}
              >
                {copied ? "✓ คัดลอกแล้ว!" : "📋 คัดลอกโค้ด"}
              </button>
            </div>
            <pre className="code-block" style={{ maxHeight: "180px" }}>{APPS_SCRIPT_SNIPPET}</pre>
          </div>

          {/* URL Input & Test */}
          <div style={{ marginTop: "1.5rem" }}>
            <label htmlFor="modal-sheet-url" className="form-label">
              วาง Google Apps Script Web App URL:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
              <input
                id="modal-sheet-url"
                type="url"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="https://script.google.com/macros/s/.../exec"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTestConnection}
                disabled={testing}
                style={{ whiteSpace: "nowrap" }}
              >
                {testing ? "กำลังทดสอบ..." : "⚡ ทดสอบ"}
              </button>
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                background: testResult.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${testResult.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                color: testResult.success ? "#34d399" : "#f87171",
              }}
            >
              {testResult.success ? "✅ " : "❌ "}
              {testResult.message}
            </div>
          )}

          <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            💡 <em>ทิปเมื่อขึ้น Vercel:</em> คุณสามารถนำ URL นี้ไปใส่ใน Vercel Environment Variables ชื่อ{" "}
            <code>GOOGLE_SHEET_WEB_APP_URL</code> เพื่อให้ระบบใช้งานได้ทันทีโดยไม่ต้องตั้งค่าในเบราว์เซอร์
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className="btn-primary" style={{ width: "auto" }} onClick={handleSave}>
            บันทึก URL
          </button>
        </div>
      </div>
    </div>
  );
}
