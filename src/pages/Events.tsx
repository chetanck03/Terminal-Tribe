
import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Grid, List, PlusCircle, Search } from "lucide-react";
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
import { EventCard } from "@/components/ui/event-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data
const events = [
  {
    id: "1",
    title: "Campus Tech Fair",
    date: "Mar 15, 2024 • 10:00 AM",
    location: "Main Campus Hall",
    attendees: 85,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000"
  },
  {
    id: "2",
    title: "Spring Music Festival",
    date: "Mar 22, 2024 • 6:00 PM",
    location: "Campus Square",
    attendees: 210,
    category: "Music",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000"
  },
  {
    id: "3",
    title: "Career Workshop",
    date: "Mar 28, 2024 • 2:00 PM",
    location: "Business Building, Room 302",
    attendees: 43,
    category: "Career",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1000"
  },
  {
    id: "4",
    title: "Film Screening Night",
    date: "Apr 5, 2024 • 7:00 PM",
    location: "Student Center, Theater Room",
    attendees: 62,
    category: "Entertainment",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000"
  },
  {
    id: "5",
    title: "Science Fair",
    date: "Apr 10, 2024 • 1:00 PM",
    location: "Science Building Atrium",
    attendees: 105,
    category: "Academic",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000"
  },
  {
    id: "6",
    title: "International Food Festival",
    date: "Apr 18, 2024 • 11:00 AM",
    location: "Campus Lawn",
    attendees: 187,
    category: "Culture",
    image: "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?q=80&w=1000"
  }
];

const EventListItem = ({ event }: { event: typeof events[0] }) => {
  return (
    <Card className="card-hover">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 sm:h-full">
          <img 
            src={event.image} 
            alt={event.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col justify-between p-4 flex-1">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <Badge className="bg-campus-blue">{event.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{event.date}</p>
            <p className="text-sm text-muted-foreground">{event.location}</p>
            <p className="text-sm mt-2">{event.attendees} attending</p>
          </div>
          <div className="mt-4">
            <Link to={`/events/${event.id}`}>
              <Button variant="outline">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Events = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Upcoming Events" 
        description="Discover and join events happening around campus"
      >
        <Link to="/events/new">
          <Button className="w-full md:w-auto gap-1">
            <PlusCircle size={16} /> Add Event
          </Button>
        </Link>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              <DropdownMenuCheckboxItem>Technology</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Music</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Career</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Entertainment</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Academic</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Culture</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>All Time</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Week</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Month</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Year</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border rounded-md p-1 flex">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-events" className="mt-0">
          <Card>
            <CardHeader>You haven't created any events yet</CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Create your first event to see it here.</p>
              <Link to="/events/new">
                <Button>Create an Event</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <Card>
            <CardHeader>No past events found</CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Past events will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
