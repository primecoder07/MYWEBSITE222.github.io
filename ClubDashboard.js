import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, Bell, LogOut, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ClubDashboard({ user, onLogout }) {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'general',
    is_urgent: false
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_attendees: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [noticesRes, eventsRes] = await Promise.all([
        axios.get(`${API}/notices`, config),
        axios.get(`${API}/events`, config)
      ]);

      setNotices(noticesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/notices`, noticeForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notice created! Pending admin approval.');
      setShowNoticeDialog(false);
      setNoticeForm({ title: '', content: '', type: 'general', is_urgent: false });
      fetchData();
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...eventForm,
        max_attendees: eventForm.max_attendees ? parseInt(eventForm.max_attendees) : null
      };
      await axios.post(`${API}/events`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event created! Pending admin approval.');
      setShowEventDialog(false);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', max_attendees: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="club-dashboard">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Club Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-notice-btn"
                className="h-32 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-2 border-dashed border-primary/30 text-primary hover:text-primary"
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8" />
                  <span className="font-heading text-lg font-bold">Create Notice</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div>
                  <Label htmlFor="notice-title">Title</Label>
                  <Input
                    id="notice-title"
                    data-testid="notice-title-input"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notice-content">Content</Label>
                  <Textarea
                    id="notice-content"
                    data-testid="notice-content-input"
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notice-type">Type</Label>
                  <select
                    id="notice-type"
                    data-testid="notice-type-select"
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notice-urgent"
                    data-testid="notice-urgent-checkbox"
                    checked={noticeForm.is_urgent}
                    onChange={(e) => setNoticeForm({ ...noticeForm, is_urgent: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="notice-urgent" className="cursor-pointer">Mark as Urgent</Label>
                </div>
                <Button type="submit" data-testid="submit-notice-btn" className="w-full rounded-full">
                  Create Notice
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-event-btn"
                className="h-32 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border-2 border-dashed border-accent/30 text-accent hover:text-accent"
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8" />
                  <span className="font-heading text-lg font-bold">Create Event</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    data-testid="event-title-input"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    data-testid="event-description-input"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      data-testid="event-date-input"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      data-testid="event-time-input"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    data-testid="event-location-input"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-max">Max Attendees (optional)</Label>
                  <Input
                    id="event-max"
                    data-testid="event-max-input"
                    type="number"
                    value={eventForm.max_attendees}
                    onChange={(e) => setEventForm({ ...eventForm, max_attendees: e.target.value })}
                  />
                </div>
                <Button type="submit" data-testid="submit-event-btn" className="w-full rounded-full">
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border" data-testid="club-notices-section">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold">Posted Notices</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notices posted yet</p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    data-testid={`club-notice-${notice.id}`}
                    className="p-3 bg-muted rounded-lg"
                  >
                    <h3 className="font-semibold text-sm mb-1">{notice.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{notice.content}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${notice.status === 'approved' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'}`}>
                        {notice.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border" data-testid="club-events-section">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-xl font-bold">Posted Events</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events posted yet</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    data-testid={`club-event-${event.id}`}
                    className="p-3 bg-muted rounded-lg"
                  >
                    <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'approved' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default ClubDashboard;
