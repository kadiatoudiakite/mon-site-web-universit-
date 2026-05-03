import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function FormulaireEntreprise({ isOpen, onClose, onSubmit }) {
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    domaine_id: ''
  });
  const [domaines, setDomaines] = useState([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const chargerDomaines = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/entreprises/domaines/all');
        const data = await response.json();
        if (response.ok && data.success) {
          setDomaines(data.data);
        }
      } catch (err) {
        console.error('Erreur chargement domaines:', err);
      }
    };
    if (isOpen) chargerDomaines();
  }, [isOpen]);

  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormulaire({ ...formulaire, [name]: value });
    setErreur('');
  };

  const gererSoumission = async (e) => {
    e.preventDefault();

    if (!formulaire.nom.trim()) {
      setErreur('Le nom de l’entreprise est requis');
      return;
    }
    if (!formulaire.email.trim()) {
      setErreur('L’email est requis');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.email)) {
      setErreur('Veuillez entrer un email valide');
      return;
    }
    if (!formulaire.domaine_id) {
      setErreur('Le domaine d’activité est requis');
      return;
    }

    try {
      await onSubmit({
        nom: formulaire.nom,
        email: formulaire.email,
        domaine_id: formulaire.domaine_id
      });
      setFormulaire({ nom: '', email: '', domaine_id: '' });
      onClose();
    } catch (error) {
      setErreur(error.message || 'Une erreur est survenue lors de la création');
    }
  };

  const gererAnnulation = () => {
    setFormulaire({ nom: '', email: '', domaine_id: '' });
    setErreur('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* En-tête avec icône et titre */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Nouvelle entreprise</h2>
                </div>
                <button
                  onClick={gererAnnulation}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-12">
                Remplissez les informations ci-dessous
              </p>
            </div>

            {/* Corps du formulaire */}
            <div className="px-6 py-5">
              {erreur && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 rounded-md"
                >
                  <p className="text-red-700 text-sm font-medium">{erreur}</p>
                </motion.div>
              )}

              <form onSubmit={gererSoumission} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nom de l’entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formulaire.nom}
                    onChange={gererChangement}
                    placeholder="Exemple : TechCorp"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formulaire.email}
                    onChange={gererChangement}
                    placeholder="contact@entreprise.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Domaine d’activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="domaine_id"
                    value={formulaire.domaine_id}
                    onChange={gererChangement}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Sélectionner un domaine --</option>
                    {domaines.map((domaine) => (
                      <option key={domaine.id} value={domaine.id}>
                        {domaine.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={gererAnnulation}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all"
                  >
                    Créer l’entreprise
                  </button>
                </div>
              </form>

              <p className="text-xs text-gray-400 text-center mt-6 pt-2 border-t border-gray-100">
                Les identifiants de connexion seront envoyés par email
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}