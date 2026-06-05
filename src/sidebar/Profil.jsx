// src/sidebar/Profil.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  KeyRound,
  Smartphone,
  AtSign,
  Briefcase
} from 'lucide-react';
import AdminManagement from './AdminManagement';

export default function ProfilUniversite({ onLogout }) {
  const [profil, setProfil] = useState({
    nom: '', prenom: '', email: '', telephone: '', role: ''
  });
  const [modeEdition, setModeEdition] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/universites/profile', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setProfil(data.data);
        setFormData(data.data);
      } else if (
        [401, 403, 404].includes(response.status) ||
        data.message?.includes('Token') ||
        data.message?.includes('Profil non trouvé')
      ) {
        onLogout();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur de chargement' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch('http://localhost:5000/api/universites/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setProfil(formData);
        setModeEdition(false);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...storedUser,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else if (
        [401, 403, 404].includes(response.status) ||
        data.message?.includes('Token') ||
        data.message?.includes('Profil non trouvé')
      ) {
        onLogout();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur mise à jour' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('http://localhost:5000/api/universites/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else if (
        [401, 403, 404].includes(response.status) ||
        data.message?.includes('Token') ||
        data.message?.includes('Profil non trouvé')
      ) {
        onLogout();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur changement mot de passe' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Bouton Retour */}
  

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl mb-5 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Mon Profil</h1>
          <p className="text-gray-500 mt-2 text-lg">Gérez vos informations personnelles et la sécurité de votre compte</p>
        </motion.div>

        {/* Message de notification */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm backdrop-blur-sm ${
                message.type === 'success'
                  ? 'bg-green-50/90 border border-green-200 text-green-800'
                  : 'bg-red-50/90 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="flex-1">{message.text}</p>
              <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carte Profil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 px-8 py-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Informations générales</h2>
              <p className="text-indigo-100 mt-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {profil.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur'}
              </p>
            </div>
            {!modeEdition ? (
              <button
                onClick={() => setModeEdition(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95 backdrop-blur-sm"
              >
                <Edit2 className="h-4 w-4" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModeEdition(false);
                    setFormData(profil);
                  }}
                  className="px-5 py-2.5 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 rounded-2xl font-semibold hover:bg-indigo-50 transition disabled:opacity-70 shadow-sm"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Champ Nom université */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Nom de l'université
                </label>
                {modeEdition ? (
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Nom de l'université"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-100">
                    {profil.nom || '—'}
                  </div>
                )}
              </div>

              {/* Champ Nom responsable */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Nom du responsable
                </label>
                {modeEdition ? (
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Prénom et nom"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-100">
                    {profil.prenom || '—'}
                  </div>
                )}
              </div>

              {/* Champ Email */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-indigo-500" />
                  Adresse email
                </label>
                {modeEdition ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="exemple@universite.com"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-100">
                    {profil.email || '—'}
                  </div>
                )}
              </div>

              {/* Champ Téléphone */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-500" />
                  Numéro de téléphone
                </label>
                {modeEdition ? (
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="+33 6 12 34 56 78"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-100">
                    {profil.telephone || '—'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sécurité du compte</h3>
          </div>
          <div className="p-8">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-semibold transition-all active:scale-95 shadow-sm"
            >
              <KeyRound className="h-5 w-5" />
              Changer mon mot de passe
            </button>
          </div>
        </motion.div>

        {/* Section Gestion des Admins (super_admin uniquement) */}
        {profil.role === 'super_admin' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <Shield className="h-5 w-5 text-violet-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des administrateurs</h2>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Haut de page
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50">
              <AdminManagement />
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL CHANGER MOT DE PASSE - design amélioré */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white">Modifier le mot de passe</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="•••••••• (min. 6 caractères)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-70 transition font-semibold shadow-sm"
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Modifier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}