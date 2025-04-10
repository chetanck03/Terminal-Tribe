import { useState, useEffect } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { ClubCard } from "@/components/ui/club-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import axios from "axios";

// Define club type interface
interface Club {
  id: string;
  name: string;
  description: string;
  content?: string;
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
  members?: Array<{
    user: {
      id: string;
      name: string;
    };
    role: string;
  }>;
}

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [trendingClubs, setTrendingClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clubs');
        
        const allClubs = response.data;
        
        // Set all active clubs
        setClubs(allClubs);
        
        // Get trending clubs (clubs with most members)
        const sortedByMembers = [...allClubs].sort((a, b) => 
          (b._count?.members || 0) - (a._count?.members || 0)
        );
        setTrendingClubs(sortedByMembers.slice(0, 3)); // Top 3 clubs
        
        // If authenticated, filter my clubs
        if (isAuthenticated && user) {
          // Fetch user's club memberships
          try {
            const userClubsResponse = await axios.get(`/api/users/${user.id}/clubs`);
            if (userClubsResponse.data && Array.isArray(userClubsResponse.data)) {
              setMyClubs(userClubsResponse.data);
            }
          } catch (err) {
            console.error("Error fetching user club memberships:", err);
            
            // Fallback: try to determine my clubs from the club data if it includes members
            const mine = allClubs.filter(club => 
              club.members && club.members.some(member => member.user.id === user.id)
            );
            setMyClubs(mine);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubs();
  }, [isAuthenticated, user]);

  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.category && club.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Club House" 
        description="Discover and join clubs based on your interests"
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clubs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter size={16} /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>All Categories</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Arts</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Technology</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Academic</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Music</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Environment</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Games</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Most Popular</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Recently Added</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Alphabetical</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="explore">
        <TabsList className="mb-6">
          <TabsTrigger value="explore">Explore Clubs</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explore" className="mt-0">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading clubs...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : filteredClubs.length === 0 ? (
            <Card>
              <CardHeader>No clubs found</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">There are no clubs matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
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
        </TabsContent>
        
        <TabsContent value="my-clubs" className="mt-0">
          {!isAuthenticated ? (
            <Card>
              <CardHeader>You need to sign in</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please sign in to see your clubs.</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading your clubs...</p>
              </CardContent>
            </Card>
          ) : myClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <ClubCard 
                  key={club.id} 
                  id={club.id}
                  name={club.name}
                  description={club.description}
                  members={club._count?.members || 0}
                  category={club.category}
                  image={club.image}
                  isJoined={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>You haven't joined any clubs yet</CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Join some clubs to see them here.</p>
                <Button>Explore Clubs</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading trending clubs...</p>
              </CardContent>
            </Card>
          ) : trendingClubs.length === 0 ? (
            <Card>
              <CardHeader>No trending clubs found</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Check back later for trending clubs.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clubs;
