// src/pages/Publication.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Download, Edit2, Trash2, Loader2, 
  Briefcase, AlertCircle, LogIn, FileText, Building2, 
  Clock, Heart, MessageSquare, Share2
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

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(pub)} className="p-1 hover:bg-gray-100 rounded">
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(pub.id)} className="p-1 hover:bg-gray-100 rounded">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        {pub.fichier && (
                          <button onClick={() => handleDownload(pub.fichier)} className="text-sm text-indigo-600 font-medium">
                            Ouvrir
                          </button>
                        )}
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
    </div>
  );
}