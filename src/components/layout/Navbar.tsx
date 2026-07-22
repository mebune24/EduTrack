import { LogOut, User, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { NotificationCenter } from '../notifications/NotificationCenter';
interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-secondary border-b border-border shadow-sm">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              onClick={onMenuClick}
              type="button"
              className="inline-flex items-center p-2 text-sm text-gray-400 rounded-lg sm:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex ms-2 md:me-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-white">
                EduTrack
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center ms-3 gap-4">
              <div className="text-white hidden sm:block text-right">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
              </div>
              <NotificationCenter />
              <button className="text-gray-300 hover:text-white flex items-center justify-center p-2 rounded-full hover:bg-gray-700">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center justify-center p-2 rounded-full hover:bg-gray-700"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
