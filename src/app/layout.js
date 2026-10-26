import { Prompt, Inter } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "แบบฝึกหัดบทที่ 2: แบบจำลองเครือข่าย OSI & TCP/IP",
  description: "ระบบทำแบบทดสอบออนไลน์ ตรวจข้อสอบอัตโนมัติตามเฉลย พร้อมบันทึกคะแนนเข้า Google Sheets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${promptFont.variable} ${interFont.variable}`}>
      <body className={promptFont.className}>{children}</body>
    </html>
  );
}
