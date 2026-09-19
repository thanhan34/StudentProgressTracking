import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { getCurrentAccess } from "@/lib/auth";
import { RoleProvider } from "@/components/role-provider";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "PTE Intensive — Theo dõi tiến độ học viên PTE",
  description: "Theo dõi task PTE, lịch thi và tình hình học tập hằng tuần của học viên.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const access = await getCurrentAccess();
  return (
    <html lang="vi">
      <body className={beVietnamPro.variable}>
        <ClerkProvider>
          <RoleProvider role={access?.role ?? null}>{children}</RoleProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}