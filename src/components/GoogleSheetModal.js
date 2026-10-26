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
      <div className="modal-content animate-fade-in" style={{ maxWidth: "740px" }}>
        {/* Futuristic Modal Header */}
        <div className="modal-header">
          <div>
            <div className="cyber-badge" style={{ marginBottom: "0.4rem" }}>
              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }} />
              SYSTEM PROTOCOL // CLOUD SYNC
            </div>
            <h3 className="modal-title">
              <span style={{ color: "#38bdf8" }}>⚡</span>
              <span style={{ background: "linear-gradient(135deg, #ffffff 40%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ตั้งค่าเชื่อมต่อ Google Sheets
              </span>
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: "0.925rem", color: "#94a3b8", lineHeight: 1.65 }}>
          {/* Futuristic Info Banner */}
          <div
            style={{
              padding: "0.85rem 1.15rem",
              background: "rgba(2, 132, 199, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              color: "#e0f2fe",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.65rem",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1, color: "#38bdf8" }}>🌐</span>
            <span>
              ระบบจะบันทึกคะแนนและคำตอบแบบ <strong style={{ color: "#ffffff" }}>Real-time</strong> ไปยัง Google Sheet อัตโนมัติผ่าน{" "}
              <strong style={{ color: "#38bdf8" }}>Google Apps Script Web App</strong> (ฟรี 100% ไม่ต้องใช้ API Key หรือ GCP)
            </span>
          </div>

          {/* Deployment Step Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div className="cyber-step-card" style={{ padding: "0.95rem 1.15rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#00f0ff", fontFamily: "var(--font-code)", background: "rgba(0, 240, 255, 0.12)", padding: "0.15rem 0.45rem", borderRadius: "4px", border: "1px solid rgba(0, 240, 255, 0.3)" }}>
                  STEP 01
                </span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>สร้าง Google Sheets ใหม่</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0 }}>
                เปิดสร้างชีตใหม่ที่{" "}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "underline", fontWeight: 600 }}
                >
                  sheets.new ↗
                </a>{" "}
                จากนั้นไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
              </p>
            </div>

            <div className="cyber-step-card" style={{ padding: "0.95rem 1.15rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", fontFamily: "var(--font-code)", background: "rgba(56, 189, 248, 0.12)", padding: "0.15rem 0.45rem", borderRadius: "4px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                  STEP 02
                </span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>คัดลอกโค้ดสคริปต์ไปวาง</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0 }}>
                ลบโค้ดเริ่มต้นในหน้าต่าง Apps Script ออกทั้งหมด แล้วกดปุ่ม <strong>"คัดลอกโค้ด"</strong> ด้านล่างนี้ไปวางแทนที่
              </p>
            </div>

            <div className="cyber-step-card" style={{ padding: "0.95rem 1.15rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#60a5fa", fontFamily: "var(--font-code)", background: "rgba(96, 165, 250, 0.12)", padding: "0.15rem 0.45rem", borderRadius: "4px", border: "1px solid rgba(96, 165, 250, 0.3)" }}>
                  STEP 03
                </span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>Deploy ให้สิทธิ์เข้าถึง</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1", margin: 0 }}>
                กด <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้รายการใหม่</strong> &gt; ประเภท <strong>เว็บแอป (Web app)</strong> 
                {" "}ตั้งค่า <em style={{ color: "#ffffff" }}>ดำเนินการในฐานะ: ฉัน</em> และ <strong style={{ color: "#00f0ff" }}>ผู้มีสิทธิ์เข้าถึง: ทุกคน (Anyone)</strong>
              </p>
            </div>
          </div>

          {/* Futuristic Code Terminal */}
          <div style={{ marginTop: "1rem" }}>
            <div className="cyber-terminal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                <span style={{ marginLeft: "0.5rem", color: "#e2e8f0", fontWeight: 600 }}>APPS_SCRIPT_CORE.gs</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  minHeight: "28px",
                  padding: "0.2rem 0.75rem",
                  fontSize: "0.775rem",
                  background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(2, 132, 199, 0.25)",
                  borderColor: copied ? "#10b981" : "#38bdf8",
                  color: copied ? "#34d399" : "#ffffff",
                }}
                onClick={handleCopyCode}
              >
                {copied ? "✓ คัดลอกสำเร็จ!" : "📋 คัดลอกโค้ดสคริปต์"}
              </button>
            </div>
            <pre className="code-block" style={{ maxHeight: "160px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              {APPS_SCRIPT_SNIPPET}
            </pre>
          </div>

          {/* Futuristic URL Input & Test */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label htmlFor="modal-sheet-url" className="form-label" style={{ color: "#ffffff", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <span style={{ color: "#38bdf8" }}>🔗</span> Web App URL จาก Google Apps Script:
              </label>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "var(--font-code)" }}>TARGET ENDPOINT</span>
            </div>

            <div style={{ display: "flex", gap: "0.65rem" }}>
              <input
                id="modal-sheet-url"
                type="url"
                className="form-input"
                style={{
                  flex: 1,
                  background: "rgba(4, 11, 28, 0.9)",
                  borderColor: "rgba(56, 189, 248, 0.35)",
                  color: "#ffffff",
                  boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.5)",
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTestConnection}
                disabled={testing}
                style={{
                  whiteSpace: "nowrap",
                  background: "rgba(2, 132, 199, 0.2)",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              >
                {testing ? "⚡ กำลังทดสอบ..." : "⚡ ทดสอบระบบ"}
              </button>
            </div>
          </div>

          {/* Test Result Message HUD */}
          {testResult && (
            <div
              style={{
                marginTop: "0.85rem",
                padding: "0.85rem 1.15rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                background: testResult.success ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                border: `1px solid ${testResult.success ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                color: testResult.success ? "#6ee7b7" : "#fca5a5",
                boxShadow: testResult.success ? "0 0 16px rgba(16, 185, 129, 0.2)" : "0 0 16px rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>{testResult.success ? "🟢 ONLINE:" : "🔴 ERROR:"}</span>
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Futuristic Tip Box */}
          <div
            style={{
              marginTop: "1.15rem",
              fontSize: "0.8rem",
              color: "#94a3b8",
              background: "rgba(8, 20, 48, 0.4)",
              border: "1px dashed rgba(56, 189, 248, 0.2)",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            💡 <strong style={{ color: "#ffffff" }}>Production Note:</strong> คุณสามารถนำ URL นี้ไปใส่ใน Vercel Environment Variables ชื่อ{" "}
            <code style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
              GOOGLE_SHEET_WEB_APP_URL
            </code>{" "}
            เพื่อให้ระบบเชื่อมต่ออัตโนมัติบนเซิร์ฟเวอร์
          </div>
        </div>

        {/* Futuristic Action Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.85rem",
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(56, 189, 248, 0.15)",
          }}
        >
          <button type="button" className="btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "auto", minWidth: "160px" }}
            onClick={handleSave}
          >
            ✓ บันทึกการเชื่อมต่อ
          </button>
        </div>
      </div>
    </div>
  );
}
