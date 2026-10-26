"use client";

import React, { useState, useEffect, useRef } from "react";

export default function QuizExam({
  student,
  questions,
  onSubmitExam,
  isSubmitting,
}) {
  const [answers, setAnswers] = useState({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const questionRefs = useRef({});

  // Stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const scrollToQuestion = (id) => {
    const element = questionRefs.current[id];
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);
  const unansweredCount = totalCount - answeredCount;

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    setShowConfirmModal(false);
    onSubmitExam({
      answers,
      timeSpent: secondsElapsed,
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Sticky Header Status */}
      <div className="quiz-sticky-status">
        <div className="status-bar-card">
          <div className="status-info-row">
            <div className="student-tag">
              <span>👤 {student.fullName}</span>
              {student.studentId && (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  ({student.studentId})
                </span>
              )}
            </div>
            <div className="timer-tag" title="เวลาที่ใช้ในการทำข้อสอบ">
              <span aria-hidden="true">⏱️</span>
              <span>{formatTimer(secondsElapsed)}</span>
            </div>
          </div>

          <div className="progress-track" aria-hidden="true">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="progress-meta">
            <span>
              ตอบแล้ว <strong>{answeredCount}</strong> จาก {totalCount} ข้อ ({progressPercent}%)
            </span>
            {unansweredCount > 0 ? (
              <span style={{ color: "var(--warning)" }}>
                เหลืออีก {unansweredCount} ข้อ
              </span>
            ) : (
              <span style={{ color: "var(--success)" }}>
                ✓ ตอบครบทุกข้อแล้ว
              </span>
            )}
          </div>

          {/* Quick Navigator Pills */}
          <div className="nav-pills-container" aria-label="ข้ามไปยังข้อสอบ">
            {questions.map((q) => {
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`nav-pill ${isAnswered ? "answered" : ""}`}
                  onClick={() => scrollToQuestion(q.id)}
                  title={`ข้อที่ ${q.id}: ${isAnswered ? "ตอบแล้ว" : "ยังไม่ได้ตอบ"}`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handlePreSubmit}>
        {questions.map((q) => {
          const selectedKey = answers[q.id];
          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              ref={(el) => (questionRefs.current[q.id] = el)}
              className={`question-card ${selectedKey ? "active" : ""}`}
            >
              <div className="question-header">
                <div className="question-number-badge">
                  <span>{q.id}</span>
                </div>
                <h3 className="question-text">{q.question}</h3>
              </div>

              <div className="options-list" role="radiogroup" aria-label={`ตัวเลือกข้อที่ ${q.id}`}>
                {q.options.map((opt) => {
                  const isSelected = selectedKey === opt.key;
                  return (
                    <label
                      key={opt.key}
                      className={`option-item ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={opt.key}
                        checked={isSelected}
                        onChange={() => handleSelectOption(q.id, opt.key)}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: 0,
                          height: 0,
                        }}
                      />
                      <div className="option-key-badge" aria-hidden="true">
                        {opt.key}
                      </div>
                      <div className="option-text">{opt.text}</div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Actions Box */}
        <div className="quiz-submit-box">
          <div className="submit-stats">
            <div>
              ตอบเสร็จแล้ว <strong>{answeredCount}</strong> / {totalCount} ข้อ
            </div>
            {unansweredCount > 0 && (
              <div className="unanswered-warning">
                ⚠️ ยังไม่ได้ตอบอีก {unansweredCount} ข้อ
              </div>
            )}
          </div>

          <button
            id="submit-exam-btn"
            type="button"
            onClick={handlePreSubmit}
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>กำลังตรวจข้อสอบและบันทึกลง Google Sheet... ⏳</span>
            ) : (
              <span>ส่งคำตอบและตรวจข้อสอบ 🚀</span>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal when questions remain */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span>⚠️ ตรวจสอบข้อสอบ</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              คุณยังตอบคำถามไม่ครบ ยังเหลืออีก{" "}
              <strong style={{ color: "var(--warning)" }}>{unansweredCount} ข้อ</strong>{" "}
              ที่ยังไม่ได้เลือกคำตอบ ต้องการส่งข้อสอบเลยหรือไม่?
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowConfirmModal(false)}
              >
                กลับไปทำต่อ
              </button>
              <button
                id="confirm-submit-modal-btn"
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={doSubmit}
                disabled={isSubmitting}
              >
                ยืนยันส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
