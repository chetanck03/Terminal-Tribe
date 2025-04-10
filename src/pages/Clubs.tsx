
import { useState } from "react";
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

// Mock data
const clubs = [
  {
    id: "1",
    name: "Photography Club",
    description: "For students passionate about capturing moments and learning photography skills.",
    members: 67,
    category: "Arts",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=1000"
  },
  {
    id: "2",
    name: "Coding Society",
    description: "Where developers meet to code, learn and build amazing projects together.",
    members: 104,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?q=80&w=1000"
  },
  {
    id: "3",
    name: "Debate Team",
    description: "Sharpen your critical thinking and public speaking skills through debates.",
    members: 45,
    category: "Academic",
    image: "https://images.unsplash.com/photo-1494059980473-813e73ee784b?q=80&w=1000"
  },
  {
    id: "4",
    name: "Music Band",
    description: "For those who love playing instruments and performing in front of audiences.",
    members: 32,
    category: "Music",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000"
  },
  {
    id: "5",
    name: "Environmental Club",
    description: "Working together to make our campus and community more sustainable and eco-friendly.",
    members: 58,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=1000"
  },
  {
    id: "6",
    name: "Chess Club",
    description: "For beginners and masters alike who enjoy strategic thinking and friendly competition.",
    members: 23,
    category: "Games",
    image: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?q=80&w=1000"
  }
];

const myClubs = [
  {
    id: "2",
    name: "Coding Society",
    description: "Where developers meet to code, learn and build amazing projects together.",
    members: 104,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?q=80&w=1000",
    isJoined: true
  },
  {
    id: "5",
    name: "Environmental Club",
    description: "Working together to make our campus and community more sustainable and eco-friendly.",
    members: 58,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=1000",
    isJoined: true
  }
];

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <ClubCard key={club.id} {...club} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my-clubs" className="mt-0">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <ClubCard key={club.id} {...club} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.slice(0, 3).map((club) => (
              <ClubCard key={club.id} {...club} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clubs;
