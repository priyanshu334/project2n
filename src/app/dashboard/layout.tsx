import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen">
        {/* Navbar at the top */}
        <Navbar />

        {/* Main content with sidebar and children */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-5 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
