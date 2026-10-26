"use client";

import React, { useState } from "react";

export default function ScoreReport({
  result,
  onRetake,
  onOpenSheetModal,
  onRetrySheetSave,
  isRetryingSheet,
}) {
  const [filter, setFilter] = useState("all"); // "all" | "correct" | "wrong"

  const {
    fullName,
    studentId,
    classroom,
    score,
    total,
    percentage,
    timeSpent,
    submissionTimestamp,
    googleSheetStatus,
    googleSheetMessage,
    breakdown = [],
  } = result;

  const correctCount = breakdown.filter((item) => item.isCorrect).length;
  const wrongCount = total - correctCount;

  const filteredBreakdown = breakdown.filter((item) => {
    if (filter === "correct") return item.isCorrect;
    if (filter === "wrong") return !item.isCorrect;
    return true;
  });

  const isPassed = percentage >= 50;

  return (
    <div className="animate-fade-in">
      {/* Hero Score Card */}
      <div className="report-hero-card">
        <div
          className={`report-badge ${isPassed ? "passed" : "needs-work"}`}
        >
          {isPassed ? "🎉 ผ่านเกณฑ์การประเมิน" : "💪 พยายามอีกนิดนะ สู้ๆ!"}
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
          ผลคะแนนแบบทดสอบบทที่ 2
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.35rem" }}>
          แบบจำลองเครือข่าย OSI และ TCP/IP Protocol Suite
        </p>

        <div className="score-display-wrapper">
          <div className="score-big-number">
            {score}
            <span style={{ fontSize: "2.25rem", color: "var(--text-dim)", fontWeight: 500 }}>
              /{total}
            </span>
          </div>
          <div className="score-total-label">
            คิดเป็น <strong>{percentage}%</strong> (ตอบถูก {correctCount} ข้อ, ตอบผิด {wrongCount} ข้อ)
          </div>
        </div>

        <div className="student-info-strip">
          <span>
            ผู้เข้าสอบ: <strong>{fullName}</strong>
          </span>
          {studentId && (
            <span>
              รหัส/เลขที่: <strong>{studentId}</strong>
            </span>
          )}
          {classroom && (
            <span>
              ห้อง/กลุ่ม: <strong>{classroom}</strong>
            </span>
          )}
          <span>
            เวลาที่ใช้: <strong>{timeSpent}</strong>
          </span>
          <span>
            ส่งเมื่อ: <strong>{submissionTimestamp}</strong>
          </span>
        </div>

        {/* Google Sheets Status Banner */}
        <div
          className={`sheet-result-banner ${
            googleSheetStatus === "saved"
              ? "success"
              : googleSheetStatus === "not_configured"
              ? "warning"
              : "error"
          }`}
        >
          {googleSheetStatus === "saved" && (
            <>
              <span>✅</span>
              <span><strong>Google Sheets:</strong> บันทึกคะแนนและคำตอบลงชีตเรียบร้อยแล้ว</span>
            </>
          )}

          {googleSheetStatus === "not_configured" && (
            <>
              <span>⚠️</span>
              <span>
                <strong>Google Sheets:</strong> ยังไม่ได้ตั้งค่า Web App URL (
                <button
                  type="button"
                  onClick={onOpenSheetModal}
                  style={{ textDecoration: "underline", color: "inherit", fontWeight: 600 }}
                >
                  คลิกที่นี่เพื่อตั้งค่า
                </button>
                )
              </span>
            </>
          )}

          {googleSheetStatus === "error" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <span>❌</span>
              <span>
                <strong>Google Sheets:</strong> {googleSheetMessage}
              </span>
              <button
                type="button"
                onClick={onRetrySheetSave}
                disabled={isRetryingSheet}
                className="btn-secondary"
                style={{ minHeight: "34px", padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
              >
                {isRetryingSheet ? "กำลังส่งใหม่..." : "ลองส่งใหม่อีกครั้ง 🔄"}
              </button>
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
          >
            🖨️ พิมพ์รายงาน / บันทึก PDF
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "auto" }}
            onClick={onRetake}
          >
            🔄 ทำแบบทดสอบใหม่อีกครั้ง
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="review-controls">
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#ffffff" }}>
          เฉลยข้อสอบอย่างละเอียด
        </h3>

        <div className="review-tabs">
          <button
            type="button"
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            ทั้งหมด ({total})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === "correct" ? "active" : ""}`}
            onClick={() => setFilter("correct")}
          >
            ตอบถูก ({correctCount})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === "wrong" ? "active" : ""}`}
            onClick={() => setFilter("wrong")}
          >
            ตอบผิด ({wrongCount})
          </button>
        </div>
      </div>

      {/* Filtered Question Cards */}
      <div>
        {filteredBreakdown.map((item) => (
          <div
            key={item.id}
            className={`review-card ${item.isCorrect ? "correct" : "wrong"}`}
          >
            <div className="review-header">
              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <div className="question-number-badge">
                  <span>{item.id}</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#ffffff", lineHeight: 1.5 }}>
                  {item.question}
                </h4>
              </div>
              <div className={`status-badge ${item.isCorrect ? "correct" : "wrong"}`}>
                {item.isCorrect ? "✓ ถูกต้อง (+1)" : "✗ ไม่ถูกต้อง (0)"}
              </div>
            </div>

            <div className="review-answer-box">
              <div
                className={`answer-pill user ${item.isCorrect ? "correct" : "wrong"}`}
              >
                <div className="answer-pill-label">คำตอบของคุณ:</div>
                <div style={{ fontWeight: 600 }}>
                  ข้อ {item.selectedKey}: {item.selectedText}
                </div>
              </div>

              <div className="answer-pill correct-key">
                <div className="answer-pill-label">เฉลยที่ถูกต้อง:</div>
                <div style={{ fontWeight: 600 }}>
                  ข้อ {item.correctKey}: {item.correctAnswer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
