import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const Candidature = () => {
  const API_URL = 'http://localhost:5000/api/universites/candidatures';
  const OFFRES_URL = 'http://localhost:5000/api/universites';
  const token = localStorage.getItem('token');
  
  const [activeTab, setActiveTab] = useState('candidatures');
  const [candidatures, setCandidatures] = useState([]);
  const [offres, setOffres] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('toutes');
  const [filterOffre, setFilterOffre] = useState('toutes');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [candRes, stagRes, anaRes, offresRes] = await Promise.all([
        axios.get(`${API_URL}/recues`, { headers }),
        axios.get(`${API_URL}/stagiaires`, { headers }),
        axios.get(`${API_URL}/analyse`, { headers }),
        axios.get(`${OFFRES_URL}`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setCandidatures(candRes.data.data || []);
      setStagiaires(stagRes.data.data || []);
      setAnalyse(anaRes.data.data || {});
      setOffres(offresRes.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCandidatures = () => {
    let filtered = candidatures;

    if (filterStatus !== 'toutes') {
      filtered = filtered.filter(c => c.statut.toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterOffre !== 'toutes') {
      filtered = filtered.filter(c => c.offre_id === parseInt(filterOffre));
    }

    return filtered;
  };

  const handleMarquerVue = async (id) => {
    setLoadingAction(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/marquer-vue/${id}`, {}, { headers });
      loadAllData();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatut = async (id, statut) => {
    setLoadingAction(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/statut/${id}`, { statut }, { headers });
      loadAllData();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'acceptée':
        return 'bg-green-100 text-green-800';
      case 'refusée':
        return 'bg-red-100 text-red-800';
      case 'vue':
        return 'bg-blue-100 text-blue-800';
      case 'en attente':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'acceptée':
        return <CheckIcon className="h-4 w-4" />;
      case 'refusée':
        return '✕';
      default:
        return null;
    }
  };

  const getOffreTitle = (offreId) => {
    return offres.find(o => o.id === offreId)?.titre || `Offre #${offreId}`;
  };

  const getCandidatureCountByOffre = (offreId) => {
    return candidatures.filter(c => c.offre_id === offreId).length;
  };

  if (loading && candidatures.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredCandidatures = getFilteredCandidatures();
  const statsParOffre = offres.map(offre => ({
    ...offre,
    total: getCandidatureCountByOffre(offre.id),
    acceptes: candidatures.filter(c => c.offre_id === offre.id && c.statut === 'Acceptée').length,
    en_attente: candidatures.filter(c => c.offre_id === offre.id && c.statut === 'En attente').length,
    refuses: candidatures.filter(c => c.offre_id === offre.id && c.statut === 'Refusée').length
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Candidatures</h1>
        <p className="text-gray-600">Gérez les candidatures des étudiants pour vos offres de stage</p>
      </div>
        import React, { useState, useEffect } from 'react';

      {/* Stats Cards Globales */}
      {analyse && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <div className="text-2xl font-bold text-indigo-600">{analyse.global?.total || 0}</div>
            <div className="text-sm text-gray-600">Candidatures totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="text-2xl font-bold text-green-600">{analyse.global?.acceptes || 0}</div>
            <div className="text-sm text-gray-600">Acceptées</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
            <div className="text-2xl font-bold text-yellow-600">{analyse.global?.en_attente || 0}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <div className="text-2xl font-bold text-red-600">{analyse.global?.refuses || 0}</div>
            <div className="text-sm text-gray-600">Refusées</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 bg-white rounded-t-lg">
        <button
          onClick={() => {
            setActiveTab('candidatures');
            setFilterStatus('toutes');
            setFilterOffre('toutes');
          }}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'candidatures'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Candidatures ({candidatures.length})
        </button>
        <button
          onClick={() => setActiveTab('offres')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'offres'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes Offres ({offres.length})
        </button>
        <button
          onClick={() => setActiveTab('stagiaires')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'stagiaires'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Stagiaires ({stagiaires.length})
        </button>
        <button
          onClick={() => setActiveTab('analyse')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'analyse'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Analyse
        </button>
      </div>

      {/* TAB: TOUTES LES CANDIDATURES */}
      {activeTab === 'candidatures' && (
        <div className="bg-white rounded-b-lg shadow">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par offre</label>
              <select
                value={filterOffre}
                onChange={(e) => setFilterOffre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="toutes">Toutes les offres</option>
                {offres.map(offre => (
                  <option key={offre.id} value={offre.id}>
                    {offre.titre} ({getCandidatureCountByOffre(offre.id)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="toutes">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="vue">Vue</option>
                <option value="acceptée">Acceptée</option>
                <option value="refusée">Refusée</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredCandidatures.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune candidature trouvée
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Candidat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Offre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Filière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCandidatures.map((candidature) => (
                    <tr key={candidature.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {candidature.photo ? (
                            <img
                              src={`http://localhost:5000/${candidature.photo.startsWith('uploads/') ? '' : 'uploads/profiles/'}${candidature.photo}`}
                              alt={candidature.nom}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 font-bold text-sm">
                              {candidature.nom.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{candidature.nom}</div>
                            <div className="text-sm text-gray-500">{candidature.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600">{candidature.poste}</div>
                        <div className="text-xs text-gray-500">ID: {candidature.offre_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidature.filiere}</div>
                        <div className="text-xs text-gray-500">{candidature.niveau}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            candidature.statut
                          )}`}
                        >
                          {getStatusIcon(candidature.statut)}
                          {candidature.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedCandidature(candidature);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: MES OFFRES */}
      {activeTab === 'offres' && (
        <div className="bg-white rounded-b-lg shadow">
          {offres.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Vous n'avez pas encore créé d'offres de stage
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {statsParOffre.map((offre) => (
                <div key={offre.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{offre.titre}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offre.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domaine:</span>
                      <span className="font-medium text-gray-900">{offre.domaine_nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium text-gray-900">{offre.duree}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Du:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(offre.date_debut).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Stats Mini */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{offre.total}</div>
                      <div className="text-xs text-gray-600">Candidatures</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{offre.acceptes}</div>
                      <div className="text-xs text-gray-600">Acceptés</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">{offre.en_attente}</div>
                      <div className="text-xs text-gray-600">En attente</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">{offre.refuses}</div>
                      <div className="text-xs text-gray-600">Refusés</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterOffre(offre.id.toString());
                      setActiveTab('candidatures');
                    }}
                    className="w-full mt-4 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition"
                  >
                    Voir candidatures
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: STAGIAIRES */}
      {activeTab === 'stagiaires' && (
        <div className="bg-white rounded-b-lg shadow overflow-x-auto">
          {stagiaires.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun stagiaire pour le moment
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dates
                  </th>
                
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stagiaires.map((stagiaire) => (
                  <tr key={stagiaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stagiaire.nom}</div>
                      <div className="text-xs text-gray-500">{stagiaire.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stagiaire.poste}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(stagiaire.dateDebut).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(stagiaire.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                 
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: ANALYSE */}
      {activeTab === 'analyse' && analyse && (
        <div className="bg-white rounded-b-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Offres */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Top offres</h3>
              {analyse.topOffres && analyse.topOffres.length > 0 ? (
                <div className="space-y-3">
                  {analyse.topOffres.map((offre, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-indigo-600">
                      <span className="text-sm text-gray-700 font-medium">{offre.titre}</span>
                      <span className="text-lg font-bold text-indigo-600">{offre.total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
              )}
            </div>

            {/* Domaines */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Par domaine</h3>
              {analyse.domaines && analyse.domaines.length > 0 ? (
                <div className="space-y-3">
                  {analyse.domaines.map((domaine, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-green-600">
                      <span className="text-sm text-gray-700 font-medium">{domaine.nom}</span>
                      <span className="text-lg font-bold text-green-600">
                        {domaine.total_offres}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* Évolution */}
          {analyse.evolution && analyse.evolution.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Évolution par mois</h3>
              <div className="flex gap-2 overflow-x-auto">
                {analyse.evolution.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center p-3 bg-gray-50 rounded min-w-fit">
                    <span className="text-2xl font-bold text-indigo-600">{item.total}</span>
                    <span className="text-xs text-gray-600 mt-1">{item.mois}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DÉTAILS CANDIDATURE */}
      {showModal && selectedCandidature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Détails de la candidature</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Candidat Info */}
              <div className="flex items-center gap-4">
                {selectedCandidature.photo ? (
                  <img
                    src={`http://localhost:5000/${selectedCandidature.photo.startsWith('uploads/') ? '' : 'uploads/profiles/'}${selectedCandidature.photo}`}
                    alt={selectedCandidature.nom}
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                    {selectedCandidature.nom.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCandidature.nom}
                  </h3>
                  <p className="text-gray-600">{selectedCandidature.email}</p>
                  <p className="text-sm text-gray-500">{selectedCandidature.filiere} - {selectedCandidature.niveau}</p>
                </div>
              </div>

              {/* Offre Info */}
              <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
                <p className="text-sm text-gray-600">Poste candidaté</p>
                <p className="text-lg font-semibold text-indigo-900">{selectedCandidature.poste}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Matricule</p>
                  <p className="font-semibold text-gray-900">{selectedCandidature.matricule}</p>
                </div>
                <div>
                  <p className="text-gray-600">Téléphone</p>
                  <p className="font-semibold text-gray-900">{selectedCandidature.telephone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Commune</p>
                  <p className="font-semibold text-gray-900">{selectedCandidature.commune}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date candidature</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedCandidature.date_candidature).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {selectedCandidature.lettre_motivation && (
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Lettre de motivation</p>
                  {selectedCandidature.lettre_motivation.startsWith('/') ? (
                    <a
                      href={`http://localhost:5000${selectedCandidature.lettre_motivation}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-600 hover:bg-emerald-100 font-medium transition"
                    >
                      📄 Télécharger la lettre de motivation
                    </a>
                  ) : (
                    <p className="bg-gray-50 p-4 rounded text-gray-700 text-sm border border-gray-200 whitespace-pre-wrap">
                      {selectedCandidature.lettre_motivation}
                    </p>
                  )}
                </div>
              )}

              {selectedCandidature.cv_fichier && (
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Curriculum Vitae</p>
                  <a
                    href={`http://localhost:5000${selectedCandidature.cv_fichier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-100 font-medium transition"
                  >
                    📄 Télécharger le CV
                  </a>
                </div>
              )}

              {selectedCandidature.date_entretien && (
                <div className="p-4 bg-indigo-50 rounded border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Date d'entretien proposée</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedCandidature.date_entretien).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {selectedCandidature.description_mission && (
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Description de mission</p>
                  <p className="bg-gray-50 p-4 rounded text-gray-700 text-sm border border-gray-200">
                    {selectedCandidature.description_mission}
                  </p>
                </div>
              )}

              {/* Statut actuel */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Statut actuel</p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedCandidature.statut
                  )}`}
                >
                  {getStatusIcon(selectedCandidature.statut)}
                  {selectedCandidature.statut}
                </span>
              </div>

              {/* Actions */}
              {selectedCandidature.statut !== 'Acceptée' &&
                selectedCandidature.statut !== 'Refusée' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {selectedCandidature.statut === 'En attente' && (
                      <button
                        onClick={() =>
                          handleMarquerVue(selectedCandidature.id)
                        }
                        disabled={loadingAction}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                      >
                        {loadingAction ? '⏳ Mise à jour...' : '👁️ Marquer comme Vue'}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleUpdateStatut(selectedCandidature.id, 'Acceptée')
                      }
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                    >
                      {loadingAction ? '⏳ Mise à jour...' : '✅ Accepter'}
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatut(selectedCandidature.id, 'Refusée')
                      }
                      disabled={loadingAction}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
                    >
                      {loadingAction ? '⏳ Mise à jour...' : '❌ Refuser'}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidature;


