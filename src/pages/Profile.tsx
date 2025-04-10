import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    document.title = "Your Profile | Plore";
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left side - Profile Card */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="text-center border-b pb-6">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt={user?.email || "User"} />
                <AvatarFallback className="text-2xl">{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user?.email?.split('@')[0] || "User"}</CardTitle>
            <CardDescription className="text-sm mt-1">{user?.email}</CardDescription>
            <div className="flex justify-center mt-2 gap-2">
              {isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Shield size={12} />
                  Admin
                </Badge>
              )}
              <Badge>Student</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h4>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email Verification</h4>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Tabs */}
        <div className="flex-1">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="clubs">My Clubs</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your most recent actions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No activity yet.</p>
                    <p className="text-sm mt-1">Start by joining an event or club!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Events</CardTitle>
                  <CardDescription>Events you've created or joined</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't joined any events yet.</p>
                    <p className="text-sm mt-1">Browse events to find something interesting!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="clubs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Clubs</CardTitle>
                  <CardDescription>Clubs you've joined or created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You aren't a member of any clubs yet.</p>
                    <p className="text-sm mt-1">Join a club to see it here!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isAdmin && (
        <Card className="w-full mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Admin Access</CardTitle>
            </div>
            <CardDescription>
              You have administrator privileges on this platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="bg-red-600 hover:bg-red-700" asChild>
              <a href="/admin/dashboard">Go to Admin Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile; 