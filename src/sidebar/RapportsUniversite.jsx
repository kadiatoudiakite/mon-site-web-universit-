import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowDownTrayIcon,
  AcademicCapIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';

export default function Rapport() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [filter, setFilter] = useState('tous');

  const token = localStorage.getItem('token');

  const fetchRapports = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rapports/universite/tous', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRapports(data.data || []);
      } else {
        toast.error(data.message || 'Erreur de chargement');
      }
    } catch (err) {
      console.error(err);
      toast.error('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapports();
  }, []);

  const handleValidation = async (id, statut = 'valide') => {
    try {
      const res = await fetch(`http://localhost:5000/api/rapports/universite/noter/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: null,
          commentaire_validation: null,
          statut: statut
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          statut === 'valide' 
            ? 'Rapport validé !' 
            : statut === 'corriger' 
            ? 'Demande de correction envoyée !' 
            : 'Rapport rejeté.'
        );
        setSelectedRapport(null);
        fetchRapports();
      } else {
        toast.error(data.message || 'Erreur lors du traitement');
      }
    } catch (err) {
      toast.error('Erreur réseau lors du traitement');
    }
  };

  const filteredRapports = filter === 'tous' ? rapports : rapports.filter(r => r.statut === filter);

  // Statistiques en temps réel (4 colonnes)
  const stats = {
    total: rapports.length,
    valides: rapports.filter(r => r.statut === 'valide').length,
    corriger: rapports.filter(r => r.statut === 'corriger').length,
    rejete: rapports.filter(r => r.statut === 'rejete').length,
    soumis: rapports.filter(r => r.statut === 'soumis').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <AcademicCapIcon className="h-12 w-12 text-indigo-600" />
            Suivi & Évaluation des Rapports
          </h1>
          <p className="text-gray-500 font-semibold text-lg mt-1">Espace de pilotage académique et de coordination avec les entreprises</p>
        </div>

        <button 
          onClick={fetchRapports}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-600 font-bold hover:bg-gray-50 hover:shadow transition-all"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Actualiser
        </button>
      </div>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Reçus</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{stats.total}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Validés</p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">{stats.valides}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <ExclamationCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">À Corriger</p>
            <h4 className="text-2xl font-black text-amber-600 mt-1">{stats.corriger}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <XMarkIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rejetés</p>
            <h4 className="text-2xl font-black text-rose-600 mt-1">{stats.rejete}</h4>
          </div>
        </div>
      </div>

      {/* Barre de filtrage */}
      <div className="flex gap-2 bg-gray-150 p-1.5 rounded-2xl max-w-lg mb-8">
        {['tous', 'soumis', 'valide', 'corriger', 'rejete'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {f === 'corriger' ? 'À Corriger' : f === 'rejete' ? 'Rejeté' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des rapports */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-3xl" />)}
            </div>
          ) : filteredRapports.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] text-center border-4 border-dashed border-gray-100 shadow-sm">
              <DocumentTextIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Aucun rapport sous ce filtre</p>
            </div>
          ) : (
            filteredRapports.map((r) => (
              <div 
                key={r.id} 
                onClick={() => {
                  setSelectedRapport(r);
                }}
                className={`bg-white p-6 rounded-[2rem] border-2 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedRapport?.id === r.id ? 'border-indigo-600 shadow-xl shadow-indigo-50/30' : 'border-gray-50 shadow-sm'}`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`p-4 rounded-2xl ${r.statut === 'valide' ? 'bg-emerald-50 text-emerald-600' : r.statut === 'corriger' ? 'bg-amber-50 text-amber-600' : r.statut === 'rejete' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <DocumentTextIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 tracking-tight text-lg">{r.titre}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold mt-1">
                      <span className="text-indigo-600 uppercase font-bold">Par {r.etudiant_prenom} {r.etudiant_nom}</span>
                      <span className="text-gray-300">•</span>
                      <span>🏢 {r.entreprise_nom}</span>
                      {r.offre_titre && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">💼 {r.offre_titre}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    r.statut === 'valide' ? 'bg-emerald-100 text-emerald-700' : 
                    r.statut === 'corriger' ? 'bg-amber-100 text-amber-700' : 
                    r.statut === 'rejete' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {r.statut === 'corriger' ? 'À CORRIGER' : r.statut === 'rejete' ? 'REJETÉ' : r.statut}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panneau de détails */}
        <div className="lg:col-span-1">
          {selectedRapport ? (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-2xl shadow-indigo-100/50 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  Détails du Rapport
                </h2>
                <button 
                  onClick={() => setSelectedRapport(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Document de Stage</label>
                  <a 
                    href={`http://localhost:5000/${selectedRapport.fichier_rapport}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700 font-black text-sm hover:bg-indigo-100 transition-all border-2 border-indigo-100 border-dashed"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Télécharger le rapport
                  </a>
                </div>

               
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center py-32 shadow-sm">
              <AcademicCapIcon className="h-14 w-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-xs font-black uppercase tracking-wider">Sélectionnez un rapport pour commencer la modération</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
