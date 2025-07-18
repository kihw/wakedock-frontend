/**
 * Application principale Next.js avec intégration SPA complète
 * Intègre tous les composants SPA pour un comportement fluide
 */

import React from 'react'
import type { AppProps } from 'next/app'
import { SPAApp } from '@/views/components/SPAApp'
import '../app/globals.css'
import '@/styles/spa.css'

// Configuration des métadonnées par défaut
const defaultMetadata = {
    title: 'WakeDock - Gestionnaire de Services',
    description: 'Plateforme de gestion et monitoring de services en temps réel',
    keywords: 'docker, services, monitoring, dashboard, wakedo'
}

function MyApp({ Component, pageProps, router }: AppProps) {
    return (
        <SPAApp Component={Component} pageProps={pageProps} router={router} />
    )
}

export default MyApp
