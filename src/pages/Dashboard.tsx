
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { NotificationCard } from "@/components/ui/notification-card";
import { EventCard } from "@/components/ui/event-card";
import { ClubCard } from "@/components/ui/club-card";

// Mock data
const upcomingEvents = [
  {
    id: "1",
    title: "Campus Tech Fair",
    date: "Mar 15, 2024 • 10:00 AM",
    location: "Main Campus Hall",
    attendees: 85,
    category: "Technology"
  },
  {
    id: "2",
    title: "Spring Music Festival",
    date: "Mar 22, 2024 • 6:00 PM",
    location: "Campus Square",
    attendees: 210,
    category: "Music"
  },
  {
    id: "3",
    title: "Career Workshop",
    date: "Mar 28, 2024 • 2:00 PM",
    location: "Business Building, Room 302",
    attendees: 43,
    category: "Career"
  }
];

const trendingClubs = [
  {
    id: "1",
    name: "Photography Club",
    description: "For students passionate about capturing moments and learning photography skills.",
    members: 67,
    category: "Arts"
  },
  {
    id: "2",
    name: "Coding Society",
    description: "Where developers meet to code, learn and build amazing projects together.",
    members: 104,
    category: "Technology"
  }
];

const notifications = [
  {
    id: "1",
    title: "New Event Added",
    description: "Science Fair has been added to the calendar for April 5th.",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    isUnread: true
  },
  {
    id: "2",
    title: "Club Invitation",
    description: "You've been invited to join the Debate Club by Sarah Johnson.",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    isUnread: true
  },
  {
    id: "3",
    title: "Event Reminder",
    description: "Campus Tech Fair is tomorrow at 10 AM. Don't forget to bring your laptop!",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
    isUnread: false
  }
];

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Welcome Back, Jordan!" 
        description="Here's what's happening around your campus"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - events and clubs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-campus-blue/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-campus-blue" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <Link to="/events">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-campus-purple/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-campus-purple" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-xs text-muted-foreground">Active memberships</p>
                    </div>
                  </div>
                  <Link to="/my-clubs">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Events */}
          <div>
            <SectionHeader 
              title="Upcoming Events" 
              action={
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ChevronRight size={16} />
                  </Button>
                </Link>
              } 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
          
          {/* Trending Clubs */}
          <div>
            <SectionHeader 
              title="Trending Clubs" 
              action={
                <Link to="/clubs">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ChevronRight size={16} />
                  </Button>
                </Link>
              } 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trendingClubs.map((club) => (
                <ClubCard key={club.id} {...club} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Stay updated with the latest activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} {...notification} />
              ))}
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/notifications">View All Notifications</Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/events/new">Create New Event</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/clubs/explore">Explore Clubs</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/profile/settings">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
