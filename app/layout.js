import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { ListingsDataProvider } from "./hooks/useListingsData";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata = {
  title: "NYC Airbnb Dashboard",
  description: "Phan tich uy tin va muc do chuyen nghiep cua chu nha Airbnb tai New York City",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} flex min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <ListingsDataProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {children}
          </main>
        </ListingsDataProvider>
      </body>
    </html>
  );
}
