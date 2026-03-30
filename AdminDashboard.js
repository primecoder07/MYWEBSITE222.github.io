import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Bell, Calendar, Users, LogOut, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminDashboard({ user, onLogout }) {
  const [pendingNotices, setPendingNotices] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [noticesRes, eventsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/pending-notices`, config),
        axios.get(`${API}/admin/pending-events`, config),
        axios.get(`${API}/admin/users`, config)
      ]);

      setPendingNotices(noticesRes.data);
      setPendingEvents(eventsRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const approveNotice = async (noticeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/notices/${noticeId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notice approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve notice');
    }
  };

  const approveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/events/${eventId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Event approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="text-3xl font-heading font-bold text-primary mb-2">
              {pendingNotices.length}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Pending Notices</div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
            <div className="text-3xl font-heading font-bold text-accent mb-2">
              {pendingEvents.length}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Pending Events</div>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 border border-secondary/20">
            <div className="text-3xl font-heading font-bold text-secondary mb-2">
              {allUsers.filter(u => u.role === 'student').length}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Total Students</div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
            <div className="text-3xl font-heading font-bold text-primary mb-2">
              {allUsers.filter(u => u.role === 'club').length}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Total Clubs</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border" data-testid="pending-notices-section">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-bold">Pending Notices</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {pendingNotices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending notices</p>
              ) : (
                pendingNotices.map((notice) => (
                  <div
                    key={notice.id}
                    data-testid={`pending-notice-${notice.id}`}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    {notice.is_urgent && (
                      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-secondary text-secondary-foreground rounded-full mb-2">
                        URGENT
                      </span>
                    )}
                    <h3 className="font-semibold mb-1">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{notice.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">By: {notice.author_name}</span>
                      <Button
                        onClick={() => approveNotice(notice.id)}
                        data-testid={`approve-notice-btn-${notice.id}`}
                        size="sm"
                        className="rounded-full"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border" data-testid="pending-events-section">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-heading text-xl font-bold">Pending Events</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {pendingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending events</p>
              ) : (
                pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    data-testid={`pending-event-${event.id}`}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <p>📅 {event.date} at {event.time}</p>
                      <p>📍 {event.location}</p>
                      <p>👤 By: {event.organizer_name}</p>
                    </div>
                    <Button
                      onClick={() => approveEvent(event.id)}
                      data-testid={`approve-event-btn-${event.id}`}
                      size="sm"
                      className="rounded-full w-full"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border"
          data-testid="all-users-section"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">College ID</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{u.name}</td>
                    <td className="py-3 px-4 text-sm">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                        u.role === 'student' ? 'bg-primary/20 text-primary' :
                        u.role === 'club' ? 'bg-accent/20 text-accent' :
                        'bg-secondary/20 text-secondary'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{u.college_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminDashboard;
