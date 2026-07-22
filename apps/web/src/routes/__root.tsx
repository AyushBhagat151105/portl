import { Outlet } from '@tanstack/react-router';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { QrModal } from '../components/qr-modal';
import { QrProvider, useQrModal } from '../contexts/qr-context';

export function RootComponent() {
  return (
    <QrProvider>
      <RootLayout />
    </QrProvider>
  );
}

function RootLayout() {
  const { qrOpen, closeQr } = useQrModal();

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300 relative bg-grain">
      {/* Navbar with Floating Glass Island */}
      <Navbar />

      {/* Main Page Route Content */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Mobile QR Modal Overlay */}
      <QrModal isOpen={qrOpen} onClose={closeQr} />
    </div>
  );
}
