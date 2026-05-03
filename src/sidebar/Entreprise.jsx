import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  PlusIcon, 
  FunnelIcon, 
  ArrowPathIcon as Loader2,
  MagnifyingGlassIcon as Search,
  ChartBarIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import FormulaireEntreprise from '../pages/Form_creaction_entreprise';
import { toast, Toaster } from 'react-hot-toast';

export default function Entreprise() {
  const [entreprises, setEntreprises] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [showFormulaire, setShowFormulaire] = useState(false);
  const [entrepriseSelectionnee, setEntrepriseSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [entRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/entreprises'),
        fetch('http://localhost:5000/api/universites/analyse/globale', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const entData = await entRes.json();
      const statsData = await statsRes.json();

      if (entData.success) setEntreprises(entData.data);
      if (statsData.success) setStats(statsData.data.entreprises);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEntreprises = entreprises.filter(e => 
    (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.domaine_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (chargement) {
    return (
      <div className="flex flex-col items-center justify-center py-10 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Analyse du réseau...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <Toaster position="top-right" />

      {/* Header Compact */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-indigo-600" />
            Partenaires
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Gestion du réseau entreprise</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-48 md:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFormulaire(true)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Analyse Mini (Compacte) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                 <BuildingOfficeIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Partenaires</p>
                 <h3 className="text-xl font-black text-gray-900">{stats.total}</h3>
              </div>
           </div>
           <div className="md:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide">
                 {stats.domaines.slice(0, 5).map((d, i) => (
                   <div key={i} className="flex-shrink-0 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">{d.nom} ({d.count})</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Liste Compacte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEntreprises.map((entreprise) => (
          <motion.div
            key={entreprise.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative overflow-hidden"
          >
            {/* Badge Publication */}
            <div className="absolute top-4 right-4 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-indigo-100">
               <BriefcaseIcon className="w-3 h-3" />
               {entreprise.nb_publications} OFFRES
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {entreprise.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{entreprise.nom}</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">{entreprise.domaine_nom || 'Secteur indéfini'}</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                  <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{[entreprise.commune, entreprise.quartier].filter(Boolean).join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                  <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{entreprise.email}</span>
                </div>
              </div>

              <div className="flex gap-2">
                 <button 
                  onClick={() => setEntrepriseSelectionnee(entreprise)}
                  className="flex-1 py-2.5 bg-gray-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                 >
                   Voir les détails
                 </button>
                 <button className="px-3 py-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                    <ChartBarIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {entrepriseSelectionnee && (
          <DetailsModal 
            entreprise={entrepriseSelectionnee} 
            onClose={() => setEntrepriseSelectionnee(null)} 
          />
        )}
      </AnimatePresence>

      <FormulaireEntreprise
        isOpen={showFormulaire}
        onClose={() => setShowFormulaire(false)}
        onSubmit={fetchData}
      />
    </div>
  );
}

function DetailsModal({ entreprise, onClose }) {
  const [offres, setOffres] = useState([]);
  const [loadingOffres, setLoadingOffres] = useState(true);

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/entreprises/${entreprise.id}/offres`);
        const data = await res.json();
        if (data.success) setOffres(data.data);
      } catch (error) {
        toast.error("Erreur de chargement des offres");
      } finally {
        setLoadingOffres(false);
      }
    };
    fetchOffres();
  }, [entreprise.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar Infos */}
        <div className="w-full md:w-80 bg-gray-50 p-8 border-r border-gray-100 overflow-y-auto">
           <div className="flex justify-between items-start mb-8 md:hidden">
              <h2 className="text-xl font-black text-gray-900">Détails Partenaire</h2>
              <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm"><XMarkIcon className="w-6 h-6" /></button>
           </div>

           <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-200 mb-4">
                {entreprise.nom.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-gray-900">{entreprise.nom}</h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{entreprise.domaine_nom}</p>
           </div>

           <div className="space-y-6">
              <InfoBlock icon={EnvelopeIcon} label="Email Professionnel" value={entreprise.email} />
              <InfoBlock icon={PhoneIcon} label="Téléphone" value={entreprise.telephone || 'Non renseigné'} />
              <InfoBlock icon={MapPinIcon} label="Localisation" value={`${entreprise.commune}, ${entreprise.quartier}`} />
              <div className="pt-4 border-t border-gray-200">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                 <p className="text-xs text-gray-600 leading-relaxed italic">
                   {entreprise.description || "Aucune description fournie pour cette entreprise."}
                 </p>
              </div>
           </div>
        </div>

        {/* Main Content: Offres */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
           <div className="flex justify-between items-center mb-8 hidden md:flex">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                 <BriefcaseIcon className="w-7 h-7 text-indigo-600" />
                 Offres de Stage
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
           </div>

           {loadingOffres ? (
             <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
           ) : (
             <div className="space-y-4">
                {offres.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                     <p className="text-sm font-bold text-gray-400">Cette entreprise n'a pas encore publié d'offres.</p>
                  </div>
                ) : (
                  offres.map((offre) => (
                    <div key={offre.id} className="p-5 border border-gray-100 rounded-2xl hover:border-indigo-200 transition-all group bg-white shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{offre.titre}</h4>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">
                            {offre.domaine_nom}
                          </span>
                       </div>
                       <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(offre.created_at).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" /> {offre.lieu}</div>
                          <div className="flex items-center gap-1.5 text-indigo-500"><ChevronRightIcon className="w-3.5 h-3.5" /> Voir les détails</div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
       <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-indigo-600"><Icon className="w-4 h-4" /></div>
       <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
          <p className="text-xs font-bold text-gray-700 break-all">{value}</p>
       </div>
    </div>
  );
}