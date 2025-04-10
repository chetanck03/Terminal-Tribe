import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { getDashboardStats } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Calendar, 
  Flag,
  User,
  Clock
} from 'lucide-react';

interface DashboardStats {
  stats: {
    userCount: number;
    eventCount: number;
    clubCount: number;
    pendingEvents: number;
  };
  recentUsers: any[];
  recentEvents: any[];
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.userCount}</div>
            <p className="text-xs text-muted-foreground">
              Campus community members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.eventCount}</div>
            <p className="text-xs text-muted-foreground">
              Total events registered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.clubCount}</div>
            <p className="text-xs text-muted-foreground">
              Active clubs on campus
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events waiting for approval
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Recent Activity */}
      <Tabs defaultValue="recent-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-users">Recent Users</TabsTrigger>
          <TabsTrigger value="recent-events">Recent Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Newly registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-8 w-8 rounded-full bg-gray-100 p-1.5" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="/admin/users">View All Users</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Recently created events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By: {event.createdBy.name} | Status: <span className={
                          event.status === 'APPROVED' ? 'text-green-500' : 
                          event.status === 'REJECTED' ? 'text-red-500' : 
                          'text-yellow-500'
                        }>{event.status}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="/admin/events">Manage Events</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Button asChild className="h-20">
          <a href="/admin/events?status=PENDING">
            <div className="flex flex-col items-center">
              <span>Pending Events</span>
              <span className="text-xs mt-1">Review and approve events</span>
            </div>
          </a>
        </Button>
        
        <Button asChild className="h-20" variant="outline">
          <a href="/admin/users">
            <div className="flex flex-col items-center">
              <span>Manage Users</span>
              <span className="text-xs mt-1">Update roles and permissions</span>
            </div>
          </a>
        </Button>
        
        <Button asChild className="h-20" variant="secondary">
          <a href="/admin/clubs">
            <div className="flex flex-col items-center">
              <span>Manage Clubs</span>
              <span className="text-xs mt-1">Oversee campus clubs</span>
            </div>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard; 