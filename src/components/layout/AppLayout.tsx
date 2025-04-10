
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-campus-gray/30">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block fixed h-[calc(100vh-4rem)] top-16 left-0 w-64 z-10">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto md:ml-64">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
