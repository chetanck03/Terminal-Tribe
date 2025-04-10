
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Calendar, label: 'Events', href: '/events' },
  { icon: Users, label: 'Clubs', href: '/clubs' },
  { icon: Clock, label: 'Timeline', href: '/timeline' },
  { icon: BookOpen, label: 'My Clubs', href: '/my-clubs' },
];

const MobileNav = () => {
  const location = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 z-10">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full",
            location.pathname === item.href
              ? "text-campus-blue"
              : "text-muted-foreground"
          )}
        >
          <item.icon size={20} />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileNav;
