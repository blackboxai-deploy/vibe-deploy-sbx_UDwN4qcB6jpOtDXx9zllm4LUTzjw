import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Todo List",
  description: "A minimal todo list built with Next.js 14 and the App Router",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Todo List</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <span>
              Built with Next.js
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
