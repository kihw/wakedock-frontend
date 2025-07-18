// Minimal dashboard layout for v0.6.4
'use client';

import React from 'react';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {title && (
                    <div className="px-4 py-6 sm:px-0">
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    </div>
                )}
                <div className="px-4 py-6 sm:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
