import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — QR Code Studio',
  description: 'Read the Privacy Policy for QR Code Studio.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
