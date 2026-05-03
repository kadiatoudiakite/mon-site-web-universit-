import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

export default function Connexion({ onConnected }) {
  const [formulaire, setFormulaire] = useState({
    email: '',
    motDePasse: ''
  });

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
    if (erreur) setErreur('');
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const response = await fetch('http://localhost:5000/api/universites/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaire),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email ou mot de passe incorrect');
      }

      const userData = {
        id: data.user.id,
        nom: data.user.nom,
        prenom: data.user.prenom,
        email: data.user.email,
        connecte: true
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      onConnected(userData);

    } catch (error) {
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black px-6 py-12 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#4f46e510_0%,transparent_50%)]" />
      
      <div className="w-full max-w-lg relative">
        {/* Carte principale */}
        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/60 p-10">
          
          {/* En-tête */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/30">
              <AcademicCapIcon className="w-11 h-11 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Bienvenue
            </h1>
            <p className="text-gray-400 mt-2 text-center">
              Connectez-vous à votre espace universitaire
            </p>
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {erreur}
            </div>
          )}

          <form onSubmit={gererSoumission} className="space-y-7">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email institutionnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formulaire.email}
                  onChange={gererChangement}
                  className="w-full px-5 py-4 bg-gray-950/70 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                  placeholder="prenom.nom@univ-conakry.edu.gn"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={afficherMotDePasse ? 'text' : 'password'}
                  name="motDePasse"
                  value={formulaire.motDePasse}
                  onChange={gererChangement}
                  className="w-full px-5 py-4 bg-gray-950/70 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300 pr-14"
                  placeholder="••••••••••••"
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {afficherMotDePasse ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Lien mot de passe oublié */}
            <div className="flex justify-end">
              <span className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors font-medium">
                Mot de passe oublié ?
              </span>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:via-violet-500 hover:to-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-indigo-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              {chargement ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Université de Conakry • Plateforme de gestion académique
            </p>
          </div>
        </div>

        {/* Effet de brillance subtile en bas */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent blur-xl" />
      </div>
    </div>
  );
}