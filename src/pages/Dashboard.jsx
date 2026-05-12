import { useState, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import {
  HomeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon as Shield
} from '@heroicons/react/24/outline';

import Accueil from '../sidebar/Accueil';
import Etudiant from '../sidebar/Etudiant';
import Analyse from '../sidebar/Analyse';
import Entreprise from '../sidebar/Entreprise';
import Messagerie from '../sidebar/Messagerie';
import Notification from '../sidebar/NotificationUniversite';
import Publication from '../sidebar/Publication';
import Partenariat from '../sidebar/Partenariat';
import ProfilEntreprise from '../sidebar/Profil';
import AdminManagement from '../sidebar/AdminManagement';
import Candidature from '../sidebar/candidature';

const components = {
  accueil: Accueil,
  etudiant: Etudiant,
  analyse: Analyse,
  entreprise: Entreprise,
  candidature: Candidature,
  messagerie: Messagerie,
  notification: Notification,
  publication: Publication,
  partenariat: Partenariat,
  'profil-entreprise': ProfilEntreprise,
  'admin-management': AdminManagement
};

export default function Dashboard({ userEmail, userId, userData, onLogout }) {
  const [activeTab, setActiveTab] = useState('accueil');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const fetchDataCounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Messages non lus
      const resMsg = await fetch('http://localhost:5000/api/messagerie/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataMsg = await resMsg.json();
      setUnreadCount(dataMsg.count || 0);

      // Notifications non lues
      const resNotif = await fetch('http://localhost:5000/api/universites/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataNotif = await resNotif.json();
      setNotifCount(dataNotif.count || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDataCounts();
    const interval = setInterval(fetchDataCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'accueil', label: 'Accueil', icon: HomeIcon },
    { id: 'etudiant', label: 'Étudiant', icon: AcademicCapIcon },
    { id: 'analyse', label: 'Analyse', icon: ChartBarIcon },
    { id: 'entreprise', label: 'Entreprise', icon: BriefcaseIcon },
    { id: 'candidature', label: 'Candidatures', icon: DocumentTextIcon },
    { id: 'messagerie', label: 'Messagerie', icon: ChatBubbleLeftIcon, count: unreadCount },
    { id: 'notification', label: 'Notification', icon: BellIcon, count: notifCount },
    { id: 'partenariat', label: 'Partenariat', icon: Handshake },
    { id: 'publication', label: 'Publication', icon: DocumentTextIcon },
    { id: 'profil-entreprise', label: 'Mon Profil', icon: UserCircleIcon }
  ];

  const CurrentComponent = components[activeTab];

  // Fournir des props utiles aux composants
  const getComponentProps = () => {
    const base = { userId, userEmail, userData, onNavigate: setActiveTab, onLogout };

    return base;
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navbar Gauche */}
      <nav className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-lg flex flex-col">
        {/* Logo/Titre */}
        <div className="p-6 border-b border-indigo-700">
          <h1 className="text-2xl font-bold">StageTrack</h1>
          <p className="text-sm text-indigo-200 mt-1">Gestion des stages</p>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  aria-current={activeTab === item.id ? 'true' : 'false'}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left relative ${
                    activeTab === item.id
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 ring-1 ring-white/20'
                      : 'hover:bg-indigo-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5 text-white/90" />
                  <span className="truncate">{item.label}</span>
                  {item.count > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-red-500/30">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Section Super Admin */}
            {userData?.role === 'super_admin' && (
              <div className="pt-4 mt-4 border-t border-indigo-700/50">
                <p className="px-4 text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Administration</p>
                <button
                  onClick={() => setActiveTab('admin-management')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                    activeTab === 'admin-management'
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50 ring-1 ring-white/20'
                      : 'hover:bg-indigo-700/50 text-indigo-100'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span className="truncate">Gestion Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Info et Logout */}
        <div className="border-t border-indigo-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-700/60 rounded-full p-2">
              <UserCircleIcon className="h-8 w-8 text-white/95" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-200">Connecté en tant que</p>
              <p className="text-sm font-medium truncate">{userEmail || 'Utilisateur'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profil-entreprise')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <UserCircleIcon className="h-4 w-4" />
              <span>Mon profil</span>
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <CurrentComponent {...getComponentProps()} />
        </div>
      </main>
    </div>
  );
}
