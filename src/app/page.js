"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RegistrationForm from "@/components/RegistrationForm";
import QuizExam from "@/components/QuizExam";
import ScoreReport from "@/components/ScoreReport";
import GoogleSheetModal from "@/components/GoogleSheetModal";
import publicQuestions from "@/data/public-questions.json";
import "@/styles/quiz.css";

export default function Home() {
  const [phase, setPhase] = useState("register"); // "register" | "quiz" | "result"
  const [student, setStudent] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [lastSubmissionData, setLastSubmissionData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetryingSheet, setIsRetryingSheet] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");

  // Load custom Sheet URL from localStorage if set
  useEffect(() => {
    try {
      const saved = localStorage.getItem("google_sheet_url");
      if (saved) {
        setSheetUrl(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveSheetUrl = (url) => {
    setSheetUrl(url);
    try {
      if (url) {
        localStorage.setItem("google_sheet_url", url);
      } else {
        localStorage.removeItem("google_sheet_url");
      }
    } catch {
      // ignore
    }
  };

  const handleStartQuiz = (studentInfo) => {
    setStudent(studentInfo);
    setPhase("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitExam = async ({ answers, timeSpent }) => {
    setIsSubmitting(true);
    const submissionPayload = {
      fullName: student.fullName,
      studentId: student.studentId,
      classroom: student.classroom,
      answers,
      timeSpent,
      googleSheetUrlOverride: sheetUrl,
    };
    setLastSubmissionData(submissionPayload);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      const data = await res.json();
      if (data.success) {
        setExamResult(data.result);
        setPhase("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("เกิดข้อผิดพลาดในการส่งข้อสอบ: " + (data.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrySheetSave = async () => {
    if (!lastSubmissionData) return;
    setIsRetryingSheet(true);

    try {
      const payload = {
        ...lastSubmissionData,
        googleSheetUrlOverride: sheetUrl,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setExamResult(data.result);
      } else {
        alert("การส่งซ้ำไม่สำเร็จ: " + (data.error || ""));
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsRetryingSheet(false);
    }
  };

  const handleRetake = () => {
    setPhase("register");
    setExamResult(null);
    setLastSubmissionData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <Navbar
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        sheetConnected={!!sheetUrl}
      />

      <main className="main-wrapper">
        {phase === "register" && (
          <RegistrationForm
            onStartQuiz={handleStartQuiz}
            totalQuestions={publicQuestions.length}
          />
        )}

        {phase === "quiz" && student && (
          <QuizExam
            student={student}
            questions={publicQuestions}
            onSubmitExam={handleSubmitExam}
            isSubmitting={isSubmitting}
          />
        )}

        {phase === "result" && examResult && (
          <ScoreReport
            result={examResult}
            onRetake={handleRetake}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
            onRetrySheetSave={handleRetrySheetSave}
            isRetryingSheet={isRetryingSheet}
          />
        )}
      </main>

      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        sheetUrl={sheetUrl}
        onSaveSheetUrl={handleSaveSheetUrl}
      />
    </div>
  );
}
