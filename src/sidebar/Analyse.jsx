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
  CheckCircleIcon as CheckCircle,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

export default function Analyse({ userId }) {
  const [activeTab, setActiveTab] = useState('candidatures');
  const [subTab, setSubTab] = useState('vue-globale');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterDomaine, setFilterDomaine] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalyse();
  }, [userId]);

  const fetchAnalyse = async () => {
    setLoading(true);
    try {
      const [analyseRes, candRes] = await Promise.all([
        fetch('http://localhost:5000/api/universites/analyse/globale', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/universites/analyse/candidatures-globales', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const analyseData = await analyseRes.json();
      const candData = await candRes.json();

      if (analyseData.success) setData(analyseData.data);
      if (candData.success) setCandidatures(candData.data);
    } catch (error) {
      console.error('❌ [ANALYSE] Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      'ID Étudiant', 
      'Étudiant', 
      'Email', 
      'Filière', 
      'Type d\'Offre',
      'Poste', 
      'Entreprise', 
      'Statut', 
      'Date de Candidature', 
      'Domaine'
    ];

    const rows = filteredData.map(c => [
      c.etudiant_id,
      c.nom,
      c.email,
      c.filiere,
      c.entreprise_nom === 'Université (Interne)' ? 'Interne' : 'Externe (Entreprise)',
      c.poste,
      c.entreprise_nom || 'N/A',
      c.statut,
      new Date(c.date_candidature).toLocaleDateString('fr-FR'),
      c.domaine_nom || 'N/A'
    ]);

    // Construction du contenu CSV avec BOM pour UTF-8 (permet à Excel de lire les accents)
    // Utilisation du point-virgule ';' comme séparateur pour Excel en français
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => {
        // Échappement des guillemets et gestion des cellules nulles/indéfinies
        const content = cell === null || cell === undefined ? '' : String(cell).replace(/"/g, '""');
        return `"${content}"`;
      }).join(';'))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analyse_Candidatures_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Rapport Excel généré avec succès');
  };

  const getFilteredData = () => {
    let filtered = candidatures;

    if (filterStatut !== 'tous') {
      filtered = filtered.filter(c => c.statut === filterStatut);
    }
    if (filterDomaine !== 'tous') {
      filtered = filtered.filter(c => c.domaine_nom === filterDomaine);
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.poste.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date_candidature) - new Date(a.date_candidature);
      if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
      if (sortBy === 'statut') return a.statut.localeCompare(b.statut);
      return 0;
    });
  };

  const filteredData = getFilteredData();
  const domainesUnique = [...new Set(candidatures.map(c => c.domaine_nom).filter(Boolean))];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Acceptée': return 'bg-green-100 text-green-800';
      case 'Refusée': return 'bg-red-100 text-red-800';
      case 'Vue': return 'bg-blue-100 text-blue-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: candidatures.length,
    acceptees: candidatures.filter(c => c.statut === 'Acceptée').length,
    refusees: candidatures.filter(c => c.statut === 'Refusée').length,
    enAttente: candidatures.filter(c => c.statut === 'En attente').length,
    vues: candidatures.filter(c => c.statut === 'Vue').length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-bold">Chargement des données...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
          <ChartBarIcon className="w-10 h-10 text-indigo-600" />
          Analyse des Candidatures
        </h1>
        <p className="text-gray-600">Suivi complet des candidatures et placements d'étudiants</p>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'candidatures', label: 'Candidatures', icon: DocumentTextIcon },
          { id: 'statistiques', label: 'Statistiques', icon: ChartBarIcon },
          { id: 'rapports', label: 'Rapports', icon: Download }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: CANDIDATURES */}
      {activeTab === 'candidatures' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Candidatures" value={stats.total} icon={DocumentTextIcon} color="indigo" />
            <StatCard label="Étudiants" value={data?.etudiants?.total || 0} icon={UserGroupIcon} color="blue" />
            <StatCard label="Entreprises" value={data?.entreprises?.total || 0} icon={Building2} color="purple" />
            <StatCard label="Acceptées" value={stats.acceptees} icon={CheckCircle} color="green" />
            <StatCard label="En attente" value={stats.enAttente} icon={Loader2} color="yellow" />
            <StatCard label="Vues" value={stats.vues} icon={EyeIcon} color="blue" />
          </div>

          {/* Sous-onglets */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'vue-globale', label: 'Vue globale' },
              { id: 'tableau-detail', label: 'Tableau détaillé' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSubTab(st.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  subTab === st.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Vue globale avec graphes */}
          {subTab === 'vue-globale' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphe Statuts */}
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Distribution par statut</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Acceptées', value: stats.acceptees, color: 'bg-green-500' },
                      { label: 'Refusées', value: stats.refusees, color: 'bg-red-500' },
                      { label: 'En attente', value: stats.enAttente, color: 'bg-yellow-500' },
                      { label: 'Vues', value: stats.vues, color: 'bg-blue-500' }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${(item.value / (stats.total || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graphe Domaines */}
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Par domaine</h3>
                  <div className="space-y-3">
                    {domainesUnique.slice(0, 6).map((domaine, i) => {
                      const count = candidatures.filter(c => c.domaine_nom === domaine).length;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 truncate">{domaine}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                              {Math.round((count / stats.total) * 100)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tableau détaillé */}
          {subTab === 'tableau-detail' && (
            <div className="bg-white rounded-2xl shadow border border-gray-100">
              {/* Filtres */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nom, email, poste..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="tous">Tous les statuts</option>
                      <option value="En attente">En attente</option>
                      <option value="Vue">Vue</option>
                      <option value="Acceptée">Acceptée</option>
                      <option value="Refusée">Refusée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domaine</label>
                    <select
                      value={filterDomaine}
                      onChange={(e) => setFilterDomaine(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="tous">Tous les domaines</option>
                      {domainesUnique.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="date">Date récente</option>
                      <option value="nom">Nom (A-Z)</option>
                      <option value="statut">Statut</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tableau */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Étudiant</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Filière</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Poste</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Entreprise</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{c.nom}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{c.filiere}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{c.poste}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-indigo-600">{c.entreprise_nom}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{c.domaine_nom || 'Général'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(c.statut)}`}>
                            {c.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-600">
                            {new Date(c.date_candidature).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {c.cv_fichier && (
                              <a
                                href={`http://localhost:5000${c.cv_fichier}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                                title="CV"
                              >
                                📄 CV
                              </a>
                            )}
                            {c.lettre_motivation && c.lettre_motivation.startsWith('/') && (
                              <a
                                href={`http://localhost:5000${c.lettre_motivation}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
                                title="Lettre"
                              >
                                📋 Lettre
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredData.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucune candidature ne correspond aux filtres
                </div>
              )}

              {/* Résumé */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                Affichage de {filteredData.length} sur {stats.total} candidatures
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: STATISTIQUES */}
      {activeTab === 'statistiques' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Répartition Étudiants</h3>
              <div className="flex flex-col items-center gap-4">
                 <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Hommes</p>
                      <p className="text-2xl font-bold text-blue-600">{data?.etudiants?.hommes || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Femmes</p>
                      <p className="text-2xl font-bold text-pink-600">{data?.etudiants?.femmes || 0}</p>
                    </div>
                 </div>
                 <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${(data?.etudiants?.hommes / (data?.etudiants?.total || 1)) * 100}%` }} />
                    <div className="bg-pink-500 h-full" style={{ width: `${(data?.etudiants?.femmes / (data?.etudiants?.total || 1)) * 100}%` }} />
                 </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Offres de Stage</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entreprises</span>
                  <span className="font-bold text-indigo-600">{data?.offres?.parType?.entreprise || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Université</span>
                  <span className="font-bold text-emerald-600">{data?.offres?.parType?.universite || 0}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-extrabold">{data?.offres?.total || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Taux de Placement</h3>
              <div className="text-center">
                <p className="text-5xl font-black text-indigo-600 mb-2">
                  {data?.etudiants?.total > 0 ? Math.round((data.etudiants.placements / data.etudiants.total) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500">Étudiants ayant trouvé un stage</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance des candidatures</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Taux acceptation', value: stats.total > 0 ? Math.round((stats.acceptees / stats.total) * 100) : 0, color: 'text-green-600' },
                  { label: 'Taux rejet', value: stats.total > 0 ? Math.round((stats.refusees / stats.total) * 100) : 0, color: 'text-red-600' },
                  { label: 'Taux vue', value: stats.total > 0 ? Math.round((stats.vues / stats.total) * 100) : 0, color: 'text-blue-600' },
                  { label: 'Taux attente', value: stats.total > 0 ? Math.round((stats.enAttente / stats.total) * 100) : 0, color: 'text-yellow-600' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{item.label}</p>
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Répartition par Filière (Top 5)</h3>
              <div className="space-y-3">
                {data?.etudiants?.filieres?.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{f.nom}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{f.total}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(f.total / (data.etudiants.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RAPPORTS */}
      {activeTab === 'rapports' && (
        <div className="space-y-4">
          <button
            onClick={exportToExcel}
            className="w-full p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6" />
              <div className="text-left">
                <p className="font-bold">Exporter le rapport complet (Excel)</p>
                <p className="text-xs text-indigo-200">Format .csv optimisé pour Microsoft Excel</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5" />
          </button>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé du rapport</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Période :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
              <p><strong>Total candidatures :</strong> {stats.total}</p>
              <p><strong>Taux acceptation :</strong> {stats.total > 0 ? Math.round((stats.acceptees / stats.total) * 100) : 0}%</p>
              <p><strong>Étudiants impliqués :</strong> {new Set(candidatures.map(c => c.etudiant_id)).size}</p>
            </div>
          </div>
        </div>
      )}
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
