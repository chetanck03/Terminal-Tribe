
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
  image?: string;
}

export function EventCard({ id, title, date, location, attendees, category, image }: EventCardProps) {
  return (
    <Card className="overflow-hidden card-hover h-full flex flex-col">
      <div className="aspect-[16/9] relative overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000'} 
          alt={title}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2 bg-campus-blue">{category}</Badge>
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{attendees} attending</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/events/${id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
