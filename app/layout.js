import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata = {
  title: "NYC Airbnb Dashboard",
  description: "Phân tích uy tín và mức độ chuyên nghiệp của chủ nhà Airbnb tại New York City",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} flex min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
