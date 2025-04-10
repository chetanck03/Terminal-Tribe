
import { Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export interface ClubCardProps {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  image?: string;
  isJoined?: boolean;
}

export function ClubCard({ id, name, description, members, category, image, isJoined }: ClubCardProps) {
  return (
    <Card className="overflow-hidden card-hover h-full flex flex-col">
      <div className="aspect-[16/9] relative overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000'} 
          alt={name}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2 bg-campus-purple/90">{category}</Badge>
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        <div className="flex items-center mt-3 text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{members} members</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/clubs/${id}`} className="w-full">
          <Button 
            variant={isJoined ? "outline" : "default"} 
            className="w-full"
          >
            {isJoined ? 'View Club' : 'Join Club'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
