import React from 'react'
import { useRouter } from 'next/router'

const Dashboard = () => {
    const router = useRouter()

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Vue d'ensemble de vos services et métriques
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Services Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Status des Services
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Services actifs</span>
                            <span className="text-green-600 font-semibold">5</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Services arrêtés</span>
                            <span className="text-red-600 font-semibold">2</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                            <span className="text-blue-600 font-semibold">7</span>
                        </div>
                    </div>
                </div>

                {/* System Resources */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Ressources Système
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                            <span className="text-blue-600 font-semibold">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                            <span className="text-yellow-600 font-semibold">72%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Disk</span>
                            <span className="text-green-600 font-semibold">23%</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Activités Récentes
                    </h2>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Service 'web-app' redémarré
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Backup terminé avec succès
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Nouvelle version déployée
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => router.push('/services')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Gérer les Services
                    </button>
                    <button
                        onClick={() => router.push('/realtime-monitoring')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Monitoring Temps Réel
                    </button>
                    <button
                        onClick={() => router.push('/analytics')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => router.push('/settings')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Paramètres
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
