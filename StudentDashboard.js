import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, Bell, Users, LogOut, MessageCircle, X } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function StudentDashboard({ user, onLogout }) {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [noticesRes, eventsRes, clubsRes] = await Promise.all([
        axios.get(`${API}/notices`, config),
        axios.get(`${API}/events`, config),
        axios.get(`${API}/clubs`, config)
      ]);

      setNotices(noticesRes.data);
      setEvents(eventsRes.data);
      setClubs(clubsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/events/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Registered for event!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const joinClub = async (clubId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/clubs/${clubId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Joined club!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join club');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="student-dashboard">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Smart College Connect</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button
            onClick={onLogout}
            data-testid="logout-btn"
            variant="outline"
            className="rounded-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 md:row-span-2 bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border"
            data-testid="notices-section"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold">Notices</h2>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notices yet</p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    data-testid={`notice-item-${notice.id}`}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    {notice.is_urgent && (
                      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-secondary text-secondary-foreground rounded-full mb-1">
                        URGENT
                      </span>
                    )}
                    <h3 className="font-semibold text-sm mb-1">{notice.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">By: {notice.author_name}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3 bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border"
            data-testid="events-section"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-2xl font-bold">Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.length === 0 ? (
                <p className="text-muted-foreground">No events scheduled</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    data-testid={`event-card-${event.id}`}
                    className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all border border-primary/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 text-xs font-bold bg-secondary text-secondary-foreground rounded-full">
                        {event.date}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>⏰ {event.time}</p>
                      <p>📍 {event.location}</p>
                      <p>👥 By: {event.organizer_name}</p>
                      {event.max_attendees && (
                        <p>🏟️ {event.registrations?.length || 0}/{event.max_attendees} registered</p>
                      )}
                    </div>
                    <Button
                      onClick={() => registerForEvent(event.id)}
                      data-testid={`register-event-btn-${event.id}`}
                      size="sm"
                      className="w-full rounded-full"
                      disabled={event.registrations?.includes(user.id)}
                    >
                      {event.registrations?.includes(user.id) ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border"
            data-testid="clubs-section"
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-2xl font-bold">Clubs & Activities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.length === 0 ? (
                <p className="text-muted-foreground">No clubs available</p>
              ) : (
                clubs.map((club) => (
                  <div
                    key={club.id}
                    data-testid={`club-card-${club.id}`}
                    className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all border border-accent/20"
                  >
                    <div className="mb-3">
                      <span className="px-3 py-1 text-xs font-bold bg-accent text-accent-foreground rounded-full">
                        {club.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2">{club.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{club.description}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      👥 {club.members?.length || 0} members
                    </p>
                    <Button
                      onClick={() => joinClub(club.id)}
                      data-testid={`join-club-btn-${club.id}`}
                      size="sm"
                      className="w-full rounded-full"
                      disabled={club.members?.includes(user.id)}
                    >
                      {club.members?.includes(user.id) ? 'Joined' : 'Join Club'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <ChatWidget userId={user.id} />
    </div>
  );
}

export default StudentDashboard;
