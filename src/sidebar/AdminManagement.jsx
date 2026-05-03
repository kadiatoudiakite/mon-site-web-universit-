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
  Key
} from 'lucide-react';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', role: 'university_admin' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
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
    setGeneratedPassword('');

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
        setMessage({ type: 'success', text: 'Administrateur créé avec succès' });
        setGeneratedPassword(data.data.mot_de_passe_temporaire);
        setForm({ nom: '', prenom: '', email: '', telephone: '', role: 'university_admin' });
        fetchAdmins();
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
        setMessage({ type: 'success', text: 'Administrateur supprimé' });
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
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-600" />
            Gestion des Administrateurs
          </h1>
          <p className="text-gray-500">Gérez les accès et les rôles de la plateforme</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setGeneratedPassword('');
            setMessage(null);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-200"
        >
          <UserPlus className="h-5 w-5" />
          Nouvel Administrateur
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un administrateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Liste des admins */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Administrateur</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Rôle</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Créé le</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-2 text-gray-500">Chargement des données...</p>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Aucun administrateur trouvé
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {admin.nom[0]}{admin.prenom[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{admin.nom} {admin.prenom}</p>
                          <p className="text-xs text-gray-500">ID: {admin.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-2 text-gray-600">
                          <Mail className="h-3.5 w-3.5" /> {admin.email}
                        </p>
                        {admin.telephone && (
                          <p className="text-sm flex items-center gap-2 text-gray-600">
                            <Phone className="h-3.5 w-3.5" /> {admin.telephone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin Université'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-bold">Nouvel Administrateur</h3>
                  <p className="text-indigo-100 text-sm">Remplissez les informations de connexion</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8">
                {message && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                {generatedPassword && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-amber-800 text-sm font-semibold flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4" /> Mot de passe temporaire généré
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-4 py-2 rounded-lg border border-amber-200 font-mono text-lg text-amber-700">
                        {generatedPassword}
                      </code>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 italic">
                      Note: Ce mot de passe ne sera plus affiché après la fermeture de cette fenêtre.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Nom</label>
                      <input name="nom" value={form.nom} onChange={handleChange} required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Prénom</label>
                      <input name="prenom" value={form.prenom} onChange={handleChange} required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email professionnel</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
                    <input name="telephone" value={form.telephone} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Rôle</label>
                    <select name="role" value={form.role} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition">
                      <option value="university_admin">Administrateur Université</option>
                      <option value="super_admin">Super Administrateur</option>
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
                      disabled={saving || (generatedPassword !== '')}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                      Créer l'accès
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
