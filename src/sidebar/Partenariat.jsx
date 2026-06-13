import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Handshake, CheckCircle2, XCircle, Building2, Mail, Calendar,
  Search, Filter, Loader2, Clock, RefreshCw, AlertCircle
} from 'lucide-react';

export default function Partenariat({ onNavigate, setPrefillData }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous n’êtes pas connecté. Veuillez vous identifier.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/universites/partenariat/mes-demandes', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/connexion';
          return;
        } else {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setDemandes(data.data || []);
      } else {
        setError(data.message || 'Impossible de charger les demandes');
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError('Erreur de connexion au serveur. Vérifiez que le backend est en ligne.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (demande, nouveauStatut) => {
    const id = demande.id;
    setActionLoading(id);
    setMessage(null);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/universites/partenariat/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/connexion';
          return;
        }
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      if (data.success) {
        setMessage({ type: 'success', text: `Demande ${nouveauStatut.toLowerCase()} avec succès !` });
        
        // Redirection via le Dashboard si acceptée
        if (nouveauStatut === 'Acceptée') {
          setTimeout(() => {
            // On stocke les données pour l'autre composant
            setPrefillData({
              nom: demande.nom_entreprise,
              email: demande.email_entreprise,
              domaine: demande.domaine,
              description: demande.description
            });
            // On change d'onglet
            onNavigate('entreprise');
          }, 1500);
        } else {
          fetchDemandes();
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Une erreur est survenue' 
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Filtrage
  const filteredDemandes = demandes.filter(d => {
    const matchFilter = filter === 'Tous' || d.statut === filter;
    const matchSearch = 
      d.nom_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.domaine?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchFilter && matchSearch;
  });

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'Acceptée':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> Acceptée
          </span>
        );
      case 'Refusée':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={14} /> Refusée
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={14} /> En attente
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Handshake className="text-indigo-600" size={36} />
            Demandes de Partenariat
          </h1>
          <p className="text-gray-500 mt-2">
            Gérez les demandes des entreprises pour votre université
          </p>
        </div>

        {message && (
          <div className={`px-6 py-3 rounded-2xl shadow-sm border text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher entreprise, email ou domaine..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl">
            {['Tous', 'En attente', 'Acceptée', 'Refusée'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={fetchDemandes} 
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          disabled={loading}
          title="Rafraîchir"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={fetchDemandes} 
            className="mt-5 px-6 py-2.5 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Chargement */}
      {loading && !error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-gray-500 mt-4">Chargement des demandes...</p>
        </div>
      ) : !error && filteredDemandes.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
          <Handshake size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700">Aucune demande trouvée</h3>
          <p className="text-gray-500 mt-2">Les demandes de partenariat apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDemandes.map((demande) => (
            <motion.div 
              key={demande.id} 
              onClick={() => setDemandeSelectionnee(demande)}
              whileHover={{ y: -4 }}
              className="cursor-pointer bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-3">
                  <Building2 className="text-indigo-600 mt-1" size={28} />
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{demande.nom_entreprise}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {demande.domaine} • {new Date(demande.date_demande).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {getStatutBadge(demande.statut)}
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm">
                <Mail size={18} className="text-indigo-500" />
                <span className="text-gray-700">{demande.email_entreprise}</span>
              </div>

              <p className="text-gray-600 text-[15px] leading-relaxed border-l-4 border-indigo-200 pl-4 py-1">
                {demande.description}
              </p>

              {demande.statut === 'En attente' && (
                <div className="flex gap-3 mt-6 pt-5 border-t">
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatut(demande, 'Acceptée'); }}
                    disabled={actionLoading === demande.id}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70"
                  >
                    {actionLoading === demande.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    Accepter
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatut(demande, 'Refusée'); }}
                    disabled={actionLoading === demande.id}
                    className="flex-1 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-2xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70"
                  >
                    <XCircle size={18} />
                    Refuser
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {demandeSelectionnee && (
          <DetailsDemandeModal 
            demande={demandeSelectionnee} 
            onClose={() => setDemandeSelectionnee(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailsDemandeModal({ demande, onClose }) {
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
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <XCircle size={24} className="text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-200 mb-4">
             {demande.nom_entreprise.charAt(0).toUpperCase()}
           </div>
           <h3 className="text-2xl font-black text-gray-900">{demande.nom_entreprise}</h3>
           <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mt-1">{demande.domaine}</p>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <Mail className="text-indigo-500 w-6 h-6" />
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Contact</p>
                 <p className="text-sm font-bold text-gray-800">{demande.email_entreprise}</p>
              </div>
           </div>

           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <Calendar className="text-indigo-500 w-6 h-6" />
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date de la demande</p>
                 <p className="text-sm font-bold text-gray-800">{new Date(demande.date_demande).toLocaleDateString('fr-FR')}</p>
              </div>
           </div>

           <div className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Handshake size={14} /> Description / Projet
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                 "{demande.description}"
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}