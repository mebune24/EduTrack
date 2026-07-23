
import { Home, Users, FileText, CheckSquare, CreditCard, Award, Calendar, MessageSquare, Settings, BookOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
}

const navItems: { icon: any; label: string; path: string; allowedRoles?: Role[] }[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'My Children', path: '/my-children', allowedRoles: ['parent'] },
  { icon: FileText, label: 'New Admission', path: '/apply', allowedRoles: ['parent', 'student'] },
  { icon: CheckSquare, label: 'Approvals', path: '/approvals', allowedRoles: ['admin', 'bursar'] },
  { icon: BookOpen, label: 'Classes', path: '/classes', allowedRoles: ['admin', 'bursar', 'teacher', 'student', 'parent'] },
  { icon: CreditCard, label: 'Fee Structures', path: '/fee-structures', allowedRoles: ['admin', 'bursar'] },
  { icon: CreditCard, label: 'Fees & Payments', path: '/fees', allowedRoles: ['admin', 'student', 'bursar', 'parent'] },
  { icon: Award, label: 'Results', path: '/results', allowedRoles: ['admin', 'student', 'teacher', 'bursar', 'parent'] },
  { icon: Award, label: 'Score Entry', path: '/score-entry', allowedRoles: ['admin', 'teacher'] },
  { icon: Award, label: 'Class Rankings', path: '/ranking' },
  { icon: Calendar, label: 'Timetable', path: '/timetable' },
  { icon: Calendar, label: 'Timetable Builder', path: '/timetable-admin', allowedRoles: ['admin', 'teacher'] },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const { user } = useAuth();
  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-border sm:translate-x-0",
        {
          "-translate-x-full": !isOpen,
          "translate-x-0": isOpen
        }
      )}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
        <ul className="space-y-2 font-medium">
          {navItems
            .filter(item => !item.allowedRoles || (user && item.allowedRoles.includes(user.role)))
            .map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center p-2 rounded-lg group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <item.icon className={clsx(
                  "w-5 h-5 transition-duration-75",
                  // Inherit color from parent properly depending on active state
                  "group-hover:text-primary-foreground/90"
                )} />
                <span className="ms-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
