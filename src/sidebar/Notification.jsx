import { motion } from 'framer-motion';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Notification() {
  const notifications = [
    {
      id: 1,
      titre: 'Nouvelle candidature',
      description: 'Jean Dupont a candidaté pour le stage chez TechCorp',
      type: 'candidature',
      heure: 'Il y a 2 heures',
      lu: false,
      avatar: '📩'
    },
    {
      id: 2,
      titre: 'Stage complété',
      description: 'Marie Martin a terminé son stage chez FinanceHub avec succès',
      type: 'succes',
      heure: 'Il y a 5 heures',
      lu: true,
      avatar: '✅'
    },
    {
      id: 3,
      titre: 'Rappel de suivi',
      description: 'Suivi à effectuer pour Pierre Durand (TechCorp)',
      type: 'rappel',
      heure: 'Hier',
      lu: true,
      avatar: '⏰'
    },
    {
      id: 4,
      titre: 'Nouvelle offre',
      description: 'GreenEnergy a publié une nouvelle offre de stage',
      type: 'offre',
      heure: 'Hier',
      lu: false,
      avatar: '💼'
    },
    {
      id: 5,
      titre: 'Documentation manquante',
      description: 'Paul Martin doit soumettre ses documents avant le 15 mars',
      type: 'alerte',
      heure: 'Il y a 3 jours',
      lu: true,
      avatar: '📄'
    }
  ];

  const getColorClass = (type) => {
    const colors = {
      candidature: 'bg-blue-50 border-blue-200',
      succes: 'bg-green-50 border-green-200',
      rappel: 'bg-yellow-50 border-yellow-200',
      offre: 'bg-purple-50 border-purple-200',
      alerte: 'bg-red-50 border-red-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getIconColor = (type) => {
    const colors = {
      candidature: 'text-blue-600',
      succes: 'text-green-600',
      rappel: 'text-yellow-600',
      offre: 'text-purple-600',
      alerte: 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600 mb-8">Alertes et mises à jour importantes</p>
      </motion.div>

      {/* Notification Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6"
      >
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
          Marquer tout comme lu
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
          Filtrer
        </button>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl border-2 p-4 transition-colors ${getColorClass(notif.type)} ${
              !notif.lu ? 'border-opacity-50' : 'border-opacity-30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${!notif.lu ? 'opacity-100' : 'opacity-70'}`}>
                  {notif.avatar}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-gray-900 ${!notif.lu ? 'text-base' : 'text-sm'}`}>
                    {notif.titre}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{notif.heure}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!notif.lu && (
                  <div className="h-3 w-3 bg-indigo-600 rounded-full mt-2"></div>
                )}
                <button className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
