"use client";

import React from "react";

export default function Navbar({ onOpenSheetModal, sheetConnected }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            🌐
          </div>
          <div>
            <h1 className="brand-title">แบบฝึกหัดบทที่ 2: เครือข่ายคอมพิวเตอร์</h1>
            <p className="brand-subtitle">แบบจำลอง OSI & TCP/IP Protocol Suite (20 ข้อ)</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="sheet-status-btn"
            onClick={onOpenSheetModal}
            title="คลิกเพื่อดูวิธีเชื่อมต่อและตั้งค่า Google Sheets"
          >
            <span
              className={`status-dot ${sheetConnected ? "connected" : "pending"}`}
              aria-hidden="true"
            />
            <span>{sheetConnected ? "Google Sheet เชื่อมต่อแล้ว" : "ตั้งค่า Google Sheets"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
