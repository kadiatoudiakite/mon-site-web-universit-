
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

// Helper pour le temps relatif
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "À l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays} j`;
  return date.toLocaleDateString('fr-FR');
};

export default function Notification({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('token');

  const handleViewPartenariat = () => onNavigate?.('partenariat');
  const handleViewCandidature = () => onNavigate?.('candidature');
  const handleViewPublication = () => onNavigate?.('publication');
  const handleViewMessagerie = () => onNavigate?.('messagerie');

  const getActionButton = (type) => {
    switch (type) {
      case 'partenariat': return { label: 'Voir demandes', action: handleViewPartenariat };
      case 'candidature': return { label: 'Voir candidatures', action: handleViewCandidature };
      case 'offre': return { label: 'Voir offres', action: handleViewPublication };
      case 'message': return { label: 'Voir messages', action: handleViewMessagerie };
      default: return null;
    }
  };

  const fetchNotifications = async (isSilent = false) => {
    if (!token) return;
    try {
      if (!isSilent) setRefreshing(true);
      const res = await fetch('http://localhost:5000/api/universites/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Si on a de nouvelles notifications non lues, on peut jouer un petit son ou toast
        if (isSilent && data.data.length > notifications.length) {
          const newOnes = data.data.filter(n => !notifications.find(old => old.id === n.id));
          if (newOnes.some(n => n.statut === 'non_lu')) {
            toast('Nouvelle notification reçue !', { icon: '🔔' });
          }
        }
        setNotifications(data.data);
        setError(null);
        
        // Marquage automatique si ouverture manuelle
        if (!isSilent && data.data.some(n => n.statut === 'non_lu')) {
          markAllAsRead(true);
        }
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
      if (!isSilent) toast.error('Erreur de mise à jour');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsRead = async (isSilent = false) => {
    try {
      const res = await fetch('http://localhost:5000/api/universites/notifications/marquer-tout-lu', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (!isSilent) toast.success('Toutes les notifications sont lues');
        setNotifications(prev => prev.map(n => ({ ...n, statut: 'lu' })));
      }
    } catch (error) { 
      if (!isSilent) toast.error('Erreur'); 
    }
  };

  // Polling toutes les 30 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/universites/notifications/marquer-lu/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, statut: 'lu' } : n));
        toast.success('Marquée comme lue');
      }
    } catch (error) { toast.error('Erreur'); }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/universites/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if ((await res.json()).success) {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Supprimée');
      }
    } catch (error) { toast.error('Erreur'); }
  };

  const getColorClass = (type) => {
    const colors = {
      candidature: 'bg-blue-50 border-blue-200',
      partenariat: 'bg-purple-50 border-purple-200',
      offre: 'bg-green-50 border-green-200',
      message: 'bg-amber-50 border-amber-200',
      alerte: 'bg-red-50 border-red-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getAvatar = (type) => {
    switch (type) {
      case 'candidature': return '📩';
      case 'partenariat': return '🤝';
      case 'offre': return '💼';
      case 'message': return '💬';
      case 'alerte': return '⚠️';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => n.statut === 'non_lu').length;
  const filteredNotifications = filter === 'all' ? notifications : filter === 'non_lu' ? notifications.filter(n => n.statut === 'non_lu') : notifications.filter(n => n.type === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} alerte${unreadCount > 1 ? 's' : ''}` : 'Votre flux est à jour'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
                Tout marquer lu
              </button>
            )}
            <button onClick={() => fetchNotifications()} disabled={refreshing} className={`p-2 rounded-xl bg-white border-2 border-gray-100 shadow-sm hover:border-indigo-200 transition ${refreshing ? 'animate-pulse' : ''}`}>
              <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtres Premium */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'all', label: 'Toutes', icon: '✨' },
            { key: 'non_lu', label: 'Non lues', icon: '🔴' },
            { key: 'candidature', label: 'Candidatures', icon: '📩' },
            { key: 'partenariat', label: 'Partenariats', icon: '🤝' },
            { key: 'message', label: 'Messages', icon: '💬' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${filter === f.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-gray-600 border-2 border-gray-50 hover:border-indigo-100'}`}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isUnread = notif.statut === 'non_lu';
              const action = getActionButton(notif.type);
              return (
                <motion.div key={notif.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative group rounded-2xl border-2 p-5 transition-all duration-300 ${getColorClass(notif.type)} ${isUnread ? 'border-opacity-100 border-indigo-200 bg-white shadow-md' : 'border-opacity-20 hover:border-opacity-50'}`}>
                  {isUnread && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" />}
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-5">
                      <div className="text-3xl filter drop-shadow-sm">{getAvatar(notif.type)}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`font-bold text-gray-900 ${isUnread ? 'text-lg' : 'text-base'}`}>{notif.titre}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white bg-opacity-50 rounded-lg text-gray-500 border border-gray-100">
                            {getRelativeTime(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                        
                        {(notif.entreprise_nom || notif.etudiant_nom) && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {notif.entreprise_nom && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-gray-700 border border-gray-100 shadow-sm">
                                🏢 {notif.entreprise_nom}
                              </span>
                            )}
                            {notif.etudiant_nom && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-gray-700 border border-gray-100 shadow-sm">
                                🎓 {notif.etudiant_nom}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {action && (
                        <button onClick={action.action} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95">
                          {action.label}
                        </button>
                      )}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button onClick={() => markAsRead(notif.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Marquer lu">
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(notif.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-6xl mb-4">🧘‍♂️</div>
              <h3 className="text-xl font-bold text-gray-800">Tout est calme ici</h3>
              <p className="text-gray-500 mt-2">Aucune notification ne correspond à votre filtre.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
