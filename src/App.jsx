import { useState, useEffect } from 'react';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';

function App() {
  const [connecte, setConnecte] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      // Vérifier si le token est valide et récupérer le profil le plus récent
      fetch('http://localhost:5000/api/universites/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        if (!response.ok) {
          // Session invalide, expirée ou utilisateur inexistant (401/404)
          console.warn('⚠️ [APP] Session invalide ou expirée, déconnexion...');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setConnecte(false);
        } else {
          return response.json();
        }
      }).then(data => {
        if (data && data.success) {
          const freshUser = {
            id: data.data.id,
            nom: data.data.nom,
            prenom: data.data.prenom,
            email: data.data.email,
            role: data.data.role,
            connecte: true
          };
          console.log('💾 [APP] Session vérifiée avec succès. Rôle:', freshUser.role);
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUserEmail(freshUser.email);
          setUserId(freshUser.id);
          setUserData(freshUser);
          setConnecte(true);
        }
      }).catch(() => {
        // Erreur réseau, garder temporairement les données locales pour éviter les blocages hors ligne
        try {
          const userData = JSON.parse(user);
          setUserEmail(userData.email);
          setUserId(userData.id);
          setUserData(userData);
          setConnecte(true);
        } catch (e) {
          setConnecte(false);
        }
      });
    }
  }, []);

  const handleConnected = (user) => {
    console.log('🎯 [APP] handleConnected appelé avec:', user);
    setUserEmail(user.email);
    setUserId(user.id);
    setUserData(user);
    setConnecte(true);
  };

  const handleLogout = () => {
    console.log('🚪 [APP] Déconnexion en cours...');
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setConnecte(false);
    setUserEmail('');
    setUserId(null);
    setUserData(null);
  };

  return (
    <div className="min-h-screen">
      {connecte ? (
        <Dashboard userEmail={userEmail} userId={userId} userData={userData} onLogout={handleLogout} />
      ) : (
        <Connexion onConnected={handleConnected} />
      )}
    </div>
  );
}

export default App;