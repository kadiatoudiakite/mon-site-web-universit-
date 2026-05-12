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
      // Vérifier si le token est valide
      fetch('http://localhost:5000/api/universites', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        if (response.status === 401) {
          // Token invalide, nettoyer
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setConnecte(false);
        } else {
          const userData = JSON.parse(user);
          console.log('💾 [APP] Utilisateur trouvé dans localStorage:', userData.nom, userData.prenom);
          setUserEmail(userData.email);
          setUserId(userData.id);
          setUserData(userData);
          setConnecte(true);
        }
      }).catch(() => {
        // Erreur réseau, garder comme connecté pour éviter déconnexion accidentelle
        const userData = JSON.parse(user);
        setUserEmail(userData.email);
        setUserId(userData.id);
        setUserData(userData);
        setConnecte(true);
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