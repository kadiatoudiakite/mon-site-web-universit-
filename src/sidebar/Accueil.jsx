import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  DocumentCheckIcon, 
  BuildingOfficeIcon as Building2,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUp,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Accueil({ userId, userData, onNavigate }) {

  const [analyseEtudiants, setAnalyseEtudiants] = useState(null);

  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const token = localStorage.getItem('token');


  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [resAnalyse, resNotif, resEtudiants] = await Promise.all([
          fetch('http://localhost:5000/api/universites/analyse/globale', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/universites/notifications', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/universites/analyse/etudiants', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const data = await resAnalyse.json();
        if (resNotif && resNotif.ok) {
          const notifData = await resNotif.json();
          if (notifData.success) setNotifications(notifData.data || []);
        }
        if (resEtudiants && resEtudiants.ok) {
          const etuData = await resEtudiants.json();
          if (etuData.success) setAnalyseEtudiants(etuData.data);
        }

        if (data.success) {
          setStats(data.data);
        } else {
          setErreur(data.message);
        }
      } catch (error) {
        setErreur("Connexion impossible au serveur");
      } finally {
        setChargement(false);
      }
    };

    if (userId) chargerDonnees();
  }, [userId]);

  if (chargement) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-indigo-100 rounded-full"></div>
        <p className="mt-4 text-gray-500 font-bold">Initialisation du tableau de bord...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Étudiants inscrits', value: stats?.etudiants.total || 0, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Offres disponibles', value: stats?.offres.total || 0, icon: BriefcaseIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Placements réussis', value: stats?.etudiants.placements || 0, icon: CheckBadgeIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Nouvelles notifications', value: (notifications.filter(n => n.statut === 'non_lu').length) || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Préparation des données pour affichage simple
  const filieres = analyseEtudiants?.filieres || [];
  const domaines = analyseEtudiants?.domaines || [];
  const totalEtudiants = stats?.etudiants?.total || 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Banner de Bienvenue */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl shadow-indigo-200"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white">Bonjour, {userData?.prenom || 'Administrateur'} 👋</h1>
          <p className="text-indigo-100 mt-2 text-lg font-medium max-w-xl">
            Voici l'état actuel de votre plateforme StageTrack. Le système est opérationnel et prêt pour la gestion académique.
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => onNavigate('publication')}
              className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
            >
              Nouvelle Publication
            </button>

            <button 
              onClick={() => onNavigate('analyse')}
              className="px-6 py-3 bg-indigo-500/30 text-white border border-indigo-400/30 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-indigo-500/50 transition-all"
            >
              Consulter les rapports
            </button>

          </div>
        </div>
        <AcademicCapIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 -rotate-12" />
      </motion.div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center text-center group hover:scale-105 transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${kpi.bg} ${kpi.color} shadow-inner`}>
              <kpi.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-50 space-y-8">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Analyse Étudiants (données clés)
          </h3>
          <div>
            <h4 className="font-bold text-gray-700 mb-2">Nombre total d'étudiants</h4>
            <div className="text-3xl font-black text-indigo-700 mb-4">{totalEtudiants}</div>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 mb-2">Répartition par filière</h4>
            <ul className="list-disc ml-6 text-gray-800">
              {filieres.length === 0 && <li>Aucune donnée</li>}
              {filieres.map((f, i) => (
                <li key={i} className="mb-1">{f.filiere} : <span className="font-bold">{f.total}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 mb-2">Répartition par domaine</h4>
            <ul className="list-disc ml-6 text-gray-800">
              {domaines.length === 0 && <li>Aucune donnée</li>}
              {domaines.map((d, i) => (
                <li key={i} className="mb-1">{d.domaine} : <span className="font-bold">{d.total}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Links / Alertes */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-50">
           <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
             <ClockIcon className="w-6 h-6 text-orange-600" />
             Rappels
           </h3>
            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
               notifications.slice(0,5).map((n) => (
                <div key={n.id} className={`flex items-start gap-4 ${n.statut === 'non_lu' ? '' : 'opacity-60'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${n.statut === 'non_lu' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <div>
                   <p className="text-sm font-bold text-gray-800">{n.titre || (n.message && n.message.substring(0,40))}</p>
                   <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                </div>
               ))
              ) : (
               <div className="text-sm text-gray-500">Aucune notification récente.</div>
              )}
            </div>
           
           <div className="mt-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 italic">
                "La réussite de nos étudiants est le reflet de l'excellence de nos partenariats."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
