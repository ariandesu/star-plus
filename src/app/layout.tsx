import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'STAR PLUS — NASA Space Health & Astronaut Telemetry System',
  description: 'Predictive health monitoring, biomarker anomaly detection, and operational readiness for long-duration space missions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7FAFF] text-[#12213F] antialiased">
        {children}
      </body>
    </html>
  );
}
