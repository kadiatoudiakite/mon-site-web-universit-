import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/universites/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/universites/notifications/marquer-lu/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, statut: 'lu' } : n));
        toast.success('Marquée comme lue');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/universites/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification supprimée');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getColorClass = (type) => {
    const colors = {
      candidature: 'bg-blue-50 border-blue-200',
      partenariat: 'bg-purple-50 border-purple-200',
      offre: 'bg-green-50 border-green-200',
      alerte: 'bg-red-50 border-red-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getAvatar = (type) => {
    switch (type) {
      case 'candidature': return '📩';
      case 'partenariat': return '🤝';
      case 'offre': return '💼';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600 mb-8">Alertes et mises à jour importantes</p>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3 pb-10">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => {
            const isUnread = notif.statut === 'non_lu';
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 p-4 transition-colors ${getColorClass(notif.type)} ${
                  isUnread ? 'border-opacity-100 border-indigo-200 shadow-sm' : 'border-opacity-30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl ${isUnread ? 'opacity-100' : 'opacity-70'}`}>
                      {getAvatar(notif.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-gray-900 ${isUnread ? 'text-base' : 'text-sm'}`}>
                        {notif.titre}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isUnread && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 text-indigo-600 hover:bg-white rounded-full transition-colors"
                        title="Marquer comme lu"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Aucune notification pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
