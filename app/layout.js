import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';
import MobileFooter from '../components/ui/Footer';
import LoadingModal from '@/components/ui/LoadingModal';
import AuthProvider from '../components/providers/AuthProvider';
import { UIProvider } from '../components/providers/UIProvider';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen ">
        <AuthProvider>
          <UIProvider>
            <LoadingModal />
            <Sidebar />

            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <MobileFooter />
            </div>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
