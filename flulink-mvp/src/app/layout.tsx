import type { Metadata } from "next";
import { FluLinkProvider } from "@/context/FluLinkContext";

export const metadata: Metadata = {
  title: "FluLink - 异步社交APP",
  description: "如流感般扩散，连接你在意的每个角落",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <FluLinkProvider>
          {children}
        </FluLinkProvider>
      </body>
    </html>
  );
}

