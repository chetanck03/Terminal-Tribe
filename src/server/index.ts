import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json());

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const secret = process.env.VITE_JWT_SECRET as string;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Check admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// User routes
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    // Only admins can update role
    if (role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }
    
    // Users can only update their own profile unless they're an admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    const { status } = req.query;
    
    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status as string }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching event' });
  }
});

app.post('/api/events', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, content, date, location, image, clubId } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        content,
        date: new Date(date),
        location,
        image,
        userId: req.user.id,
        ...(clubId && { clubId }),
      },
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.put('/api/events/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, date, location, image } = req.body;
    
    // Check if user is the creator or an admin
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        content,
        ...(date && { date: new Date(date) }),
        location,
        image,
      },
    });
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the creator or an admin
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Event approval/rejection (admin only)
app.post('/api/events/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    
    // Notify the event creator
    await prisma.notification.create({
      data: {
        userId: event.userId,
        message: `Your event "${event.title}" has been approved.`,
        type: 'success',
      },
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error approving event' });
  }
});

app.post('/api/events/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    
    // Notify the event creator
    await prisma.notification.create({
      data: {
        userId: event.userId,
        message: `Your event "${event.title}" has been rejected.`,
        type: 'error',
      },
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting event' });
  }
});

// Event participation
app.post('/api/events/:id/join', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, status: true, title: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Event is not approved yet' });
    }
    
    // Check if user already joined
    const existingJoin = await prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    if (existingJoin) {
      return res.status(400).json({ error: 'Already joined this event' });
    }
    
    // Join the event
    await prisma.eventUser.create({
      data: {
        eventId: id,
        userId,
      },
    });
    
    res.status(201).json({ message: 'Joined event successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error joining event' });
  }
});

app.delete('/api/events/:id/join', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if the join entry exists
    const join = await prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    if (!join) {
      return res.status(404).json({ error: 'Not joined this event' });
    }
    
    // Leave the event
    await prisma.eventUser.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error leaving event' });
  }
});

// Club routes
app.get('/api/clubs', async (req, res) => {
  try {
    const { status } = req.query;
    
    const clubs = await prisma.club.findMany({
      where: {
        ...(status && { status: status as string }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clubs' });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        events: {
          where: {
            status: 'APPROVED',
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club' });
  }
});

app.post('/api/clubs', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, content, image } = req.body;
    
    const club = await prisma.club.create({
      data: {
        name,
        description,
        content,
        image,
        userId: req.user.id,
      },
    });
    
    // Add creator as an admin member
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });
    
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club' });
  }
});

// Admin dashboard stats
app.get('/api/admin/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const clubCount = await prisma.club.count();
    const pendingEvents = await prisma.event.count({
      where: { status: 'PENDING' },
    });
    
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json({
      stats: {
        userCount,
        eventCount,
        clubCount,
        pendingEvents,
      },
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 