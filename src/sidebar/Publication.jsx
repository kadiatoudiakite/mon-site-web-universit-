// src/pages/Publication.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Download, Edit2, Trash2, Loader2, 
  Briefcase, AlertCircle, LogIn, FileText, Building2, 
  Clock, Heart, MessageSquare, Share2, BarChart3, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import FormPublicationUniversite from '../pages/Form_publication_universite.jsx';

export default function Publication() {
  const [publications, setPublications] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [selectedPublicationDetails, setSelectedPublicationDetails] = useState(null);

  const getToken = () => localStorage.getItem('token');
  const isAuthenticated = () => !!getToken();

  // Déterminer le type de fichier à partir du nom
  const getFileType = (filename) => {
    if (!filename) return null;
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    return 'document';
  };

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const authenticated = isAuthenticated();
      const url = authenticated ? 'http://localhost:5000/api/universites' : 'http://localhost:5000/api/universites/public';
      const opts = authenticated ? { headers: { Authorization: `Bearer ${getToken()}` } } : {};
      const response = await fetch(url, opts);
      
      if (response.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
        return;
      }
      
      const data = await response.json();
      if (data) {
        if (Array.isArray(data)) setPublications(data);
        else if (data.success) setPublications(data.data || []);
        else setPublications([]);
      } else setPublications([]);
    } catch (err) {
      setPublications([]);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/universites/domaines');
      const data = await response.json();
      if (Array.isArray(data)) setDomains(data);
      else if (data.success && Array.isArray(data.data)) setDomains(data.data);
      else setDomains([]);
    } catch (err) {
      setDomains([]);
    }
  };

  useEffect(() => {
    fetchDomains();
    if (isAuthenticated()) fetchPublications();
    else setLoading(false);
  }, []);

  const handleCreate = async (formData) => {
    const body = new FormData();
    body.append('titre', formData.titre);
    body.append('description', formData.description);
    body.append('duree', formData.duree);
    body.append('date_debut', formData.date_debut);
    body.append('date_fin', formData.date_fin);
    body.append('id_domaine', formData.id_domaine);
    if (formData.fichier) body.append('fichier', formData.fichier);

    const response = await fetch('http://localhost:5000/api/universites/publication_universite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors de la création');
    await fetchPublications();
    setShowModal(false);
  };

  const handleUpdate = async (formData) => {
    const body = new FormData();
    body.append('titre', formData.titre);
    body.append('description', formData.description);
    body.append('duree', formData.duree);
    body.append('date_debut', formData.date_debut);
    body.append('date_fin', formData.date_fin);
    body.append('id_domaine', formData.id_domaine);
    if (formData.fichier) body.append('fichier', formData.fichier);

    const response = await fetch(`http://localhost:5000/api/universites/${editingPublication.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors de la modification');
    await fetchPublications();
    setEditingPublication(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/universites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setPublications(prev => prev.filter(p => p.id !== id));
      } else {
        setError(data.message || 'Suppression impossible');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleDownload = (filename) => {
    if (filename) window.open(`http://localhost:5000/api/universites/download/${filename}`, '_blank');
  };

  const openCreateModal = () => {
    if (!isAuthenticated()) {
      setError('Vous devez être connecté pour publier une offre.');
      return;
    }
    setEditingPublication(null);
    setShowModal(true);
  };

  const openEditModal = (pub) => {
    setEditingPublication(pub);
    setShowModal(true);
  };

  const fetchPublicationDetails = async (pub) => {
    // Fetch les stats du serveur
    try {
      const response = await fetch(`http://localhost:5000/api/universites/${pub.id}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPublicationDetails({
          ...pub,
          likes: data.data.likes || 0,
          comments: data.data.comments || 0
        });
      } else {
        // Fallback si erreur
        setSelectedPublicationDetails({
          ...pub,
          likes: 0,
          comments: 0
        });
      }
    } catch (err) {
      console.error('Erreur récupération stats:', err);
      setSelectedPublicationDetails({
        ...pub,
        likes: 0,
        comments: 0
      });
    }
  };

  const totalPublications = publications.length;
  const latestDate = publications.length > 0 
    ? new Date(Math.max(...publications.map(p => new Date(p.created_at || Date.now())))) 
    : null;

  const domainCounts = publications.reduce((acc, p) => {
    const d = p.domaine_nom || 'Inconnu';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const topDomain = Object.keys(domainCounts).length 
    ? Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0][0] 
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-md">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Offres de stage</h1>
              <p className="text-gray-500 mt-1">Gérez vos publications et opportunités</p>
            </div>
          </div>

          
        </motion.div>

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
          </motion.div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mes publications</h3>
                <p className="text-gray-600">
                  Total : <span className="font-bold text-indigo-600">{totalPublications}</span> • 
                  Domaine principal : <span className="font-medium">{topDomain}</span>
                </p>
                {latestDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Dernière publication : {latestDate.toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow"
            >
              <Plus className="h-5 w-5" />
              Nouvelle offre
            </motion.button>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="mt-4 text-gray-500">Chargement des offres...</p>
          </div>
        ) : !isAuthenticated() ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <LogIn className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connexion requise</h3>
            <p className="text-gray-500">Connectez-vous pour gérer vos offres de stage.</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune offre publiée</h3>
            <p className="text-gray-500">Commencez par créer votre première offre.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {publications.map((pub, idx) => {
                const postDate = pub.created_at ? new Date(pub.created_at) : new Date();
                const fileType = getFileType(pub.fichier);

                return (
                  <motion.article
                    key={pub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Image / media top */}
                    {fileType === 'image' ? (
                      <img
                        src={`http://localhost:5000/api/universites/download/${pub.fichier}`}
                        alt={pub.titre}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-50 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-300" />
                      </div>
                    )}

                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="text-sm text-gray-500">{pub.universite_nom || 'Université'}</h4>
                      <h3 className="mt-1 font-semibold text-gray-900 truncate">{pub.titre}</h3>
                      <p className="text-xs text-gray-400 mt-1">{postDate.toLocaleDateString('fr-FR')}</p>

                      <p className="mt-2 text-gray-600 text-sm line-clamp-3 flex-1">{pub.description}</p>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fetchPublicationDetails(pub)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm transition-colors"
                          title="Voir les statistiques"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Détails
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(pub)} 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(pub.id)} 
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal de formulaire */}
      <FormPublicationUniversite
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPublication(null);
        }}
        onSubmit={editingPublication ? handleUpdate : handleCreate}
        initialData={editingPublication}
        domains={domains}
      />

      {/* Modal Détails de la publication */}
      <AnimatePresence>
        {selectedPublicationDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPublicationDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* En-tête du modal */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Statistiques</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPublicationDetails(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Contenu du modal */}
              <div className="p-6 space-y-6">
                {/* Titre et domaine */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                    {selectedPublicationDetails.titre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedPublicationDetails.domaine_nom || 'Domaine'} • 
                    {new Date(selectedPublicationDetails.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Likes */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-red-200 rounded-full">
                        <Heart className="h-5 w-5 text-red-600 fill-red-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedPublicationDetails.likes}
                    </p>
                    <p className="text-xs text-red-700 font-medium mt-1">
                      J'aime{selectedPublicationDetails.likes > 1 ? 's' : ''}
                    </p>
                  </motion.div>

                  {/* Commentaires */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-blue-200 rounded-full">
                        <MessageSquare className="h-5 w-5 text-blue-600 fill-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedPublicationDetails.comments}
                    </p>
                    <p className="text-xs text-blue-700 font-medium mt-1">
                      Commentaire{selectedPublicationDetails.comments > 1 ? 's' : ''}
                    </p>
                  </motion.div>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Période
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedPublicationDetails.date_debut).toLocaleDateString('fr-FR')} → 
                      {new Date(selectedPublicationDetails.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      Durée
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPublicationDetails.duree}
                    </span>
                  </div>
                </div>

                {/* Bouton de fermeture */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPublicationDetails(null)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}