import Navbar from '../components/ui/Navbar';
import MobileFooter from '../components/ui/Footer';
import AuthProvider from '../components/providers/AuthProvider';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
            <div className="flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>         
          <MobileFooter />
        </AuthProvider>
        </div>
      </body>
    </html>
  );
}
