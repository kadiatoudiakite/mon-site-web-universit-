import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon as Building2, 
  BriefcaseIcon, 
  ArrowPathIcon as Loader2, 
  ChartPieIcon as PieChart, 
  AcademicCapIcon as GraduationCap, 
  ArrowUpRightIcon as ArrowUpRight, 
  ArrowDownTrayIcon as Download, 
  PrinterIcon as Printer, 
  FunnelIcon as Filter,
  CheckCircleIcon as CheckCircle
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

export default function Analyse({ userId }) {
  const [activeTab, setActiveTab] = useState('entreprises');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalyse();
  }, [userId]);

  const fetchAnalyse = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/universites/analyse/globale', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('❌ [ANALYSE] Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-bold">Chargement des statistiques...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="text-center py-20">
      <p className="text-gray-500 font-medium">Données indisponibles.</p>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
        : 'bg-white text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
            <ChartBarIcon className="w-10 h-10 text-indigo-600" />
            Analyses
          </h1>
          <p className="text-gray-500 font-medium mt-1">Supervision de l'écosystème StageTrack.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 print:hidden">
        <TabButton id="entreprises" label="Entreprises" icon={Building2} />
        <TabButton id="etudiants" label="Étudiants" icon={GraduationCap} />
        <TabButton id="offres" label="Offres" icon={BriefcaseIcon} />
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === 'entreprises' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Partenaires" value={data.entreprises.total} icon={Building2} color="indigo" />
              <StatCard label="Domaines" value={data.entreprises.nbDomaines} icon={Filter} color="purple" />
              <StatCard label="Engagement" value="84%" icon={TrendingUpIcon} color="green" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-indigo-600" />
                  Secteurs d'activité
                </h3>
                <div className="space-y-6">
                  {data.entreprises.domaines.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600 uppercase">{d.nom}</span>
                        <span className="text-xs font-bold text-indigo-600">{d.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${(d.count / (data.entreprises.total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'etudiants' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total" value={data.etudiants.total} icon={UserGroupIcon} color="indigo" />
              <StatCard label="Placés" value={data.etudiants.placements} icon={CheckCircle} color="green" />
              <StatCard label="Insertion" value={`${data.etudiants.total > 0 ? Math.round((data.etudiants.placements / data.etudiants.total) * 100) : 0}%`} icon={TrendingUpIcon} color="blue" />
              <StatCard label="Féminin" value={data.etudiants.femmes} icon={UserGroupIcon} color="pink" />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md">
               <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                 <GraduationCap className="w-6 h-6 text-indigo-600" />
                 Par Filière
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.etudiants.filieres.map((f, i) => (
                    <div key={i} className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                       <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">{f.nom}</h4>
                       <p className="text-3xl font-extrabold text-indigo-900">{f.total}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'offres' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Total Offres" value={data.offres.total} icon={BriefcaseIcon} color="orange" />
              <StatCard label="Entreprises" value={data.offres.parType.entreprise} icon={Building2} color="blue" />
              <StatCard label="Université" value={data.offres.parType.universite} icon={GraduationCap} color="purple" />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md">
               <h3 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-3">
                 <TrendingUpIcon className="w-6 h-6 text-orange-600" />
                 Publications mensuelles
               </h3>
               <div className="h-64 w-full flex items-end justify-between px-4 gap-4">
                  {data.offres.evolution.map((m, i) => {
                    const max = Math.max(...data.offres.evolution.map(x => x.total || 0), 1);
                    const height = (m.total / max) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-indigo-600 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{m.mois}</span>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
    </div>
  );
}
