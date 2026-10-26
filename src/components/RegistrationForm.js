"use client";

import React, { useState } from "react";

export default function RegistrationForm({ onStartQuiz, totalQuestions = 20 }) {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classroom, setClassroom] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("กรุณากรอกชื่อ-นามสกุลก่อนเริ่มทำแบบทดสอบ");
      return;
    }
    setErrorMsg("");
    onStartQuiz({
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      classroom: classroom.trim(),
    });
  };

  return (
    <div className="welcome-card animate-fade-in">
      <div className="welcome-badge">
        <span>📝 บทเรียนที่ 2 • เครือข่ายคอมพิวเตอร์</span>
      </div>

      <h2 className="welcome-title">แบบทดสอบวัดความรู้บทที่ 2</h2>
      <p className="welcome-desc">
        แบบจำลองของอินเทอร์เน็ต (TCP/IP) และแบบจำลอง OSI การทำงานแต่ละเลเยอร์ 
        ตรวจข้อสอบทันทีหลังส่ง และบันทึกคะแนนเข้าสู่ระบบ Google Sheets อัตโนมัติ
      </p>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon" aria-hidden="true">
            📋
          </div>
          <div>
            <div className="stat-num">{totalQuestions} ข้อ</div>
            <div className="stat-label">ปรนัย 4 ตัวเลือก</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" aria-hidden="true">
            ⚡
          </div>
          <div>
            <div className="stat-num">อัตโนมัติ</div>
            <div className="stat-label">ตรวจคำตอบทันที</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" aria-hidden="true">
            📊
          </div>
          <div>
            <div className="stat-num">Google Sheets</div>
            <div className="stat-label">บันทึกผลคะแนน</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-title">
          <span>👤 ข้อมูลผู้เข้าทดสอบ</span>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="student-fullname" className="form-label">
              ชื่อ - นามสกุล <span className="required">*</span>
            </label>
            <input
              id="student-fullname"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="ตัวอย่าง: นายสมชาย ใจดี"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-id" className="form-label">
              รหัสนักศึกษา / เลขที่ (ถ้ามี)
            </label>
            <input
              id="student-id"
              name="studentId"
              type="text"
              className="form-input"
              placeholder="ตัวอย่าง: 65012345 หรือ เลขที่ 12"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-classroom" className="form-label">
              ชั้นเรียน / ตอนเรียน (ถ้ามี)
            </label>
            <input
              id="student-classroom"
              name="classroom"
              type="text"
              className="form-input"
              placeholder="ตัวอย่าง: ม.6/1 หรือ Sec 01"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "var(--error)",
              fontSize: "0.9rem",
              marginBottom: "1.25rem",
              fontWeight: 500,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="rules-box">
          <div className="rules-title">
            <span>📌 คำชี้แจงในการทำแบบทดสอบ</span>
          </div>
          <ol className="rules-list">
            <li>แบบทดสอบมีทั้งหมด {totalQuestions} ข้อ เลือกคำตอบที่ถูกต้องที่สุดเพียง 1 ตัวเลือก</li>
            <li>สามารถคลิกเปลี่ยนคำตอบหรือเลือกข้ามไปทำข้ออื่นก่อนได้</li>
            <li>เมื่อทำเสร็จแล้ว ให้กดปุ่ม "ส่งคำตอบและตรวจข้อสอบ" ด้านล่างสุด</li>
            <li>ระบบจะตรวจคำตอบ แสดงคะแนนเฉลยละเอียด และส่งคะแนนเข้า Google Sheets</li>
          </ol>
        </div>

        <button type="submit" className="btn-primary">
          <span>เริ่มทำข้อสอบทันที</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  );
}
