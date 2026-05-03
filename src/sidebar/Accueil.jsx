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

export default function Accueil({ userId, userData }) {
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/universites/analyse/globale', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

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
    { label: 'Partenaires actifs', value: stats?.entreprises.total || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

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
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform">
              Nouvelle Publication
            </button>
            <button className="px-6 py-3 bg-indigo-500/30 text-white border border-indigo-400/30 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-indigo-500/50 transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Graphique Simplifié d'Evolution */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-50">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Activité du Système
              </h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-full">+12% ce mois</span>
           </div>
           
           <div className="relative h-48 w-full flex items-end justify-between px-2 gap-4">
              {stats?.offres.evolution.map((m, i) => {
                const max = Math.max(...stats.offres.evolution.map(x => x.total), 1);
                const height = (m.total / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-indigo-100 rounded-t-xl group-hover:bg-indigo-600 transition-all duration-500 cursor-help"
                      style={{ height: `${height}%` }}
                      title={`${m.total} offres`}
                    />
                    <span className="text-[9px] font-bold text-gray-400 mt-3 uppercase">{m.mois}</span>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Quick Links / Alertes */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-50">
           <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
             <ClockIcon className="w-6 h-6 text-orange-600" />
             Rappels
           </h3>
           <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                 <div>
                    <p className="text-sm font-bold text-gray-800">Candidatures en attente</p>
                    <p className="text-xs text-gray-400 mt-0.5">15 nouveaux dossiers à valider.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                 <div>
                    <p className="text-sm font-bold text-gray-800">Partenariat Entreprise</p>
                    <p className="text-xs text-gray-400 mt-0.5">Vérification du dossier "TechLabs".</p>
                 </div>
              </div>
              <div className="flex items-start gap-4 opacity-50">
                 <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                 <div>
                    <p className="text-sm font-bold text-gray-800">Mise à jour système</p>
                    <p className="text-xs text-gray-400 mt-0.5">Planifiée pour ce soir 00:00.</p>
                 </div>
              </div>
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
