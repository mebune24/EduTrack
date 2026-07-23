import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../error/ErrorBoundary';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="p-4 sm:ml-64 pt-20">
        <main className="rounded-lg border-2 border-dashed border-slate-200 min-h-[calc(100vh-6rem)] p-4 bg-white">
          <ErrorBoundary sectionName="Main Content">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
