import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { NotificationCard } from "@/components/ui/notification-card";
import { EventCard } from "@/components/ui/event-card";
import { ClubCard } from "@/components/ui/club-card";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for events
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category?: string;
  image?: string;
  createdBy: {
    id: string;
    name: string;
  };
  attendees?: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
}

// Define interface for clubs
interface Club {
  id: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  status: string;
  createdBy: {
    id: string;
    name: string;
  };
  _count?: {
    members: number;
  };
}

// Define interface for notifications
interface Notification {
  id: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingClubs, setTrendingClubs] = useState<Club[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState({
    events: true,
    clubs: true,
    notifications: true
  });
  const [error, setError] = useState({
    events: null as string | null,
    clubs: null as string | null,
    notifications: null as string | null
  });
  const [eventCount, setEventCount] = useState(0);
  const [clubCount, setClubCount] = useState(0);

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        
        // Filter for upcoming events only (from today onward)
        const now = new Date();
        const upcoming = response.data.filter(
          (event: Event) => new Date(event.date) >= now
        );
        
        // Sort by date and limit to 3
        const sortedUpcoming = upcoming.sort(
          (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ).slice(0, 3);
        
        setUpcomingEvents(sortedUpcoming);
        setEventCount(upcoming.length);
        setError(prev => ({ ...prev, events: null }));
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(prev => ({ ...prev, events: "Failed to load events" }));
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };
    
    fetchEvents();
  }, []);

  // Fetch trending clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('/api/clubs');
        
        // Sort by member count (trending = most members)
        const sortedClubs = [...response.data].sort(
          (a: Club, b: Club) => (b._count?.members || 0) - (a._count?.members || 0)
        ).slice(0, 2); // Get top 2
        
        setTrendingClubs(sortedClubs);
        
        // If user is authenticated, count their club memberships
        if (user && user.id) {
          try {
            const userClubsResponse = await axios.get(`/api/users/${user.id}/clubs`);
            if (userClubsResponse.data && Array.isArray(userClubsResponse.data)) {
              setClubCount(userClubsResponse.data.length);
            }
          } catch (err) {
            console.error("Error fetching user clubs:", err);
            setClubCount(0);
          }
        }
        
        setError(prev => ({ ...prev, clubs: null }));
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError(prev => ({ ...prev, clubs: "Failed to load clubs" }));
      } finally {
        setLoading(prev => ({ ...prev, clubs: false }));
      }
    };
    
    fetchClubs();
  }, [user]);

  // Fetch user notifications if user is authenticated
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.id) {
        setLoading(prev => ({ ...prev, notifications: false }));
        return;
      }
      
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data.slice(0, 3)); // Get top 3 notifications
        setError(prev => ({ ...prev, notifications: null }));
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(prev => ({ ...prev, notifications: "Failed to load notifications" }));
      } finally {
        setLoading(prev => ({ ...prev, notifications: false }));
      }
    };
    
    fetchNotifications();
  }, [user]);

  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })} • ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: 'numeric'
    })}`;
  };

  // Convert notification data format
  const formatNotifications = (notifications: Notification[]) => {
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      isUnread: !notification.read
    }));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Welcome Back${user?.name ? ', ' + user.name : ''}!`} 
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
                      {loading.events ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{eventCount}</p>
                          <p className="text-xs text-muted-foreground">This month</p>
                        </>
                      )}
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
                      {loading.clubs ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{clubCount}</p>
                          <p className="text-xs text-muted-foreground">Active memberships</p>
                        </>
                      )}
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
            {loading.events ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error.events ? (
              <Card>
                <CardContent className="p-6 text-center text-red-500">
                  {error.events}
                </CardContent>
              </Card>
            ) : upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No upcoming events found
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    id={event.id}
                    title={event.title}
                    date={formatDate(event.date)}
                    location={event.location}
                    attendees={event.attendees?.length || 0}
                    category={event.category}
                    image={event.image}
                  />
                ))}
              </div>
            )}
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
            {loading.clubs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error.clubs ? (
              <Card>
                <CardContent className="p-6 text-center text-red-500">
                  {error.clubs}
                </CardContent>
              </Card>
            ) : trendingClubs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No clubs found
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trendingClubs.map((club) => (
                  <ClubCard 
                    key={club.id} 
                    id={club.id}
                    name={club.name}
                    description={club.description}
                    members={club._count?.members || 0}
                    category={club.category}
                    image={club.image}
                  />
                ))}
              </div>
            )}
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
              {loading.notifications ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </>
              ) : error.notifications ? (
                <div className="text-center text-red-500">
                  {error.notifications}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No notifications found
                </div>
              ) : (
                formatNotifications(notifications).map((notification) => (
                  <NotificationCard key={notification.id} {...notification} />
                ))
              )}
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
              {isAdmin && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/events/new">Create New Event</Link>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/clubs">Explore Clubs</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/profile">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
