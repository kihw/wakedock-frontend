import React from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useServiceController } from '@/hooks/api/useServiceController'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Head from 'next/head'

export default function HomePage() {
    const router = useRouter()
    const { services } = useServiceController()

    const runningServices = services?.filter(s => s.status === 'running').length || 0
    const stoppedServices = services?.filter(s => s.status === 'stopped').length || 0
    const totalServices = services?.length || 0

    return (
        <>
            <Head>
                <title>Dashboard - WakeDock</title>
                <meta name="description" content="WakeDock Docker management dashboard" />
            </Head>
            
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Vue d'ensemble de vos services et métriques
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Services Status */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Status des Services
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Services actifs</span>
                            <Badge variant="success" className="font-semibold">{runningServices}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Services arrêtés</span>
                            <Badge variant="error" className="font-semibold">{stoppedServices}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                            <Badge variant="secondary" className="font-semibold">{totalServices}</Badge>
                        </div>
                    </div>
                </Card>

                {/* System Resources */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Ressources Système
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                            <Badge variant="secondary" className="font-semibold">45%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                            <Badge variant="warning" className="font-semibold">72%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Disk</span>
                            <Badge variant="success" className="font-semibold">23%</Badge>
                        </div>
                    </div>
                </Card>

                {/* Recent Activities */}
                <Card className="p-6">
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
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                        onClick={() => router.push('/services')}
                        variant="primary"
                        className="w-full"
                    >
                        Gérer les Services
                    </Button>
                    <Button
                        onClick={() => router.push('/realtime-monitoring')}
                        variant="success"
                        className="w-full"
                    >
                        Monitoring Temps Réel
                    </Button>
                    <Button
                        onClick={() => router.push('/analytics')}
                        variant="secondary"
                        className="w-full"
                    >
                        Analytics
                    </Button>
                    <Button
                        onClick={() => router.push('/settings')}
                        variant="outline"
                        className="w-full"
                    >
                        Paramètres
                    </Button>
                </div>
            </div>
                </div>
            </DashboardLayout>
        </>
    )
}
