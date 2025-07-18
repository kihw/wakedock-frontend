/**
 * Application principale Next.js avec intégration complète
 * Intègre tous les composants pour un comportement fluide
 */

import React from 'react'
import type { AppProps } from 'next/app'
import { App } from '@/views/components/App'
import '../styles/globals.css'
import '@/styles/spa.css'

// Configuration des métadonnées par défaut
const defaultMetadata = {
    title: 'WakeDock - Gestionnaire de Services',
    description: 'Plateforme de gestion et monitoring de services en temps réel',
    keywords: 'docker, services, monitoring, dashboard, wakedock'
}

function MyApp({ Component, pageProps, router }: AppProps) {
    return (
        <App Component={Component} pageProps={pageProps} router={router} />
    )
}

export default MyApp
