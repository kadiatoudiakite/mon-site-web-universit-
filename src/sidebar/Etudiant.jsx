import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  ArrowPathIcon as Loader2, 
  MagnifyingGlassIcon as Search,
  ArrowDownTrayIcon as Download,
  FunnelIcon as Filter,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  ClockIcon as Clock,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

export default function Etudiant({ userId }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ filieres: [], niveaux: [], candidatures: [] });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch('http://localhost:5000/api/universites/etudiants/analyse/statistiques', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/universites/etudiants/analyse/liste-complete', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const listData = await listRes.json();

      if (statsData.success) setStats(statsData.data);
      if (listData.success) setStudents(listData.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données étudiants");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.nom} ${s.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.filiere?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Filière', 'Niveau', 'Nombre de Candidatures', 'Stages Trouvés'];
    const rows = filteredStudents.map(s => [
      s.nom || '',
      s.prenom || '',
      s.email || '',
      s.telephone || '',
      s.filiere || 'N/A',
      s.niveau || 'N/A',
      s.nb_candidatures || 0,
      s.nb_stages || 0
    ]);
    
    // Nettoyer les valeurs et les entourer de guillemets pour éviter tout décalage
    const formatValue = (val) => {
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    };

    const csvContent = [
      headers.map(formatValue).join(';'),
      ...rows.map(r => r.map(formatValue).join(';'))
    ].join('\r\n');

    // Ajouter le BOM UTF-8 (\uFEFF) pour qu'Excel ouvre le fichier avec le bon encodage et sans erreurs de caractères (accents)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `liste_etudiants_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Liste exportée avec succès sous Excel !");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-bold">Analyse des effectifs étudiants...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
            <UserGroupIcon className="w-10 h-10 text-indigo-600" />
            Gestion des Étudiants
          </h1>
          <p className="text-gray-500 font-medium mt-1">Analyse détaillée de la réussite et du placement des étudiants.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Download className="w-5 h-5" />
          Exporter Liste
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Répartition par Filière</h3>
           <div className="space-y-4">
              {stats.filieres.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 uppercase">{f.label}</span>
                    <span className="text-indigo-600">{f.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ width: `${students.length > 0 ? (f.value / students.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50">
           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Statuts Candidatures</h3>
           <div className="flex flex-col h-full justify-between pb-4">
              {stats.candidatures.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl mb-2">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${c.label === 'Accepté' ? 'bg-green-500' : c.label === 'Refusé' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-gray-700">{c.label}</span>
                   </div>
                   <span className="text-sm font-black text-gray-900">{c.value}</span>
                </div>
              ))}
              {stats.candidatures.length === 0 && <p className="text-center text-gray-400 italic">Aucune candidature</p>}
           </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white flex flex-col justify-center">
           <p className="text-xs font-black uppercase tracking-widest opacity-70">Taux de placement Global</p>
           <h2 className="text-6xl font-black mt-2 tracking-tighter">
             {students.length > 0 ? Math.round((students.filter(s => s.nb_stages > 0).length / students.length) * 100) : 0}%
           </h2>
           <p className="text-sm font-medium mt-4 opacity-90">Des étudiants ont trouvé un stage correspondant à leur profil.</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h3 className="text-xl font-bold text-gray-900">Liste des Étudiants</h3>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Étudiant</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Parcours</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Activité</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                          {s.nom.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-gray-900">{s.prenom} {s.nom}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                             <Mail className="w-3 h-3" /> {s.email}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-700">{s.filiere || 'N/A'}</p>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mt-1 tracking-widest">{s.niveau}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="text-center">
                          <p className="text-sm font-black text-gray-900">{s.nb_candidatures}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Candidatures</p>
                       </div>
                       <div className="w-px h-8 bg-gray-100" />
                       <div className="text-center">
                          <p className={`text-sm font-black ${s.nb_stages > 0 ? 'text-green-600' : 'text-gray-400'}`}>{s.nb_stages}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Stage trouvé</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <a href={`mailto:${s.email}`} className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all"><Mail className="w-5 h-5" /></a>
                       <a href={`tel:${s.telephone}`} className="p-2.5 bg-gray-50 text-gray-400 hover:text-green-600 rounded-xl transition-all"><Phone className="w-5 h-5" /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center">
               <p className="text-gray-400 font-medium italic">Aucun étudiant trouvé correspondant à votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
