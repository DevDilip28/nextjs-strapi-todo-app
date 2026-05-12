import "./globals.css";

export const metadata = {
  title: "Todo App",
  description: "Todo Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
