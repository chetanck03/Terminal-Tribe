
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, Home, Users, Clock, BookOpen, 
  PlusCircle, Bell, ChevronRight, Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/'
  },
  {
    label: 'Events',
    icon: Calendar,
    href: '/events'
  },
  {
    label: 'Club House',
    icon: Users,
    href: '/clubs'
  },
  {
    label: 'Timeline',
    icon: Clock,
    href: '/timeline'
  },
  {
    label: 'My Clubs',
    icon: BookOpen,
    href: '/my-clubs'
  }
];

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full border-r bg-white w-full">
      <div className="p-4">
        <Link to="/events/new">
          <Button className="w-full gap-2">
            <PlusCircle size={18} /> Add Event
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                location.pathname === item.href ? "bg-muted text-campus-blue" : "text-muted-foreground"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {location.pathname === item.href && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </Link>
          ))}
        </div>
        
        <div className="py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            Trending Clubs
          </h3>
          {['Photography Club', 'Coding Society', 'Debate Team', 'Music Band'].map((club, idx) => (
            <Link
              key={idx}
              to={`/clubs/${club.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-muted text-muted-foreground"
            >
              <span className="h-2 w-2 rounded-full bg-campus-purple"></span>
              <span>{club}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Bell size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
