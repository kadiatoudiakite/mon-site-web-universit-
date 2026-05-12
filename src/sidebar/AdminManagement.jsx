import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle,
  X,
  Loader2,
  Key,
  MoreVertical,
  UserCheck,
  Clock
} from 'lucide-react';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', role: 'university_admin' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getToken = () => localStorage.getItem('token');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setShowSuccessModal(true);
        setForm({ nom: '', prenom: '', email: '', telephone: '', role: 'university_admin' });
        fetchAdmins();
        setTimeout(() => setShowSuccessModal(false), 4000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchAdmins();
        setMessage({ type: 'success', text: 'Administrateur supprimé avec succès' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            Gestion des Administrateurs
          </h1>
          <p className="text-gray-500 mt-1 ml-1">Gérez les accès et les rôles de la plateforme</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowModal(true);
            setMessage(null);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all"
        >
          <UserPlus className="h-5 w-5" />
          Nouvel Administrateur
        </motion.button>
      </motion.div>

      {/* Barre de recherche améliorée */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all shadow-sm"
        />
      </motion.div>

      {/* Message toast (pour suppression) */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des admins - design carte moderne */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
            <p className="mt-3 text-gray-500">Chargement des administrateurs...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-3 text-gray-500">Aucun administrateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAdmins.map((admin) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 hover:bg-gray-50/80 transition-colors group"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm">
                      {admin.nom[0]}{admin.prenom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-lg">{admin.nom} {admin.prenom}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin Université'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {admin.email}
                        </span>
                        {admin.telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {admin.telephone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5" /> Créé le {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Création - design amélioré */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-2xl font-bold">Nouvel administrateur</h3>
                  <p className="text-indigo-100 text-sm mt-1">Remplissez les informations du compte</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8">
                {message && message.type === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-700 border border-red-100">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Nom *</label>
                      <input
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition"
                        placeholder="Dupont"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Prénom *</label>
                      <input
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition"
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Email professionnel *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition"
                      placeholder="jean.dupont@universite.fr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Téléphone (optionnel)</label>
                    <input
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Rôle</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition cursor-pointer"
                    >
                      <option value="university_admin">Administrateur Université</option>
        
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                      Créer l'utilisateur
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de succès (remplace l'affichage du mot de passe) */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center"
            >
              <div className="p-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Compte créé !</h3>
                <p className="text-gray-600 mb-4">
                  L'administrateur a été ajouté avec succès.<br />
                  Un email contenant ses identifiants de connexion lui a été envoyé.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                  Parfait
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}