/**
 * ThemeSettings - Interface complète de personnalisation du thème
 */
import React, { useState } from 'react';
import {
    Palette,
    Settings,
    Download,
    Upload,
    RotateCcw,
    Eye,
    EyeOff,
    Zap,
    ZapOff
} from 'lucide-react';
import { useThemeStore, type ThemePreferences } from '../stores/theme';
import ThemeToggle from './ThemeToggle';

interface ThemeSettingsProps {
    className?: string;
    onClose?: () => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
    className = '',
    onClose
}) => {
    const {
        preferences,
        activeTheme,
        setCustomColors,
        resetCustomColors,
        setAnimations,
        setTransitions,
        exportPreferences,
        importPreferences
    } = useThemeStore();

    const [importData, setImportData] = useState('');
    const [showImport, setShowImport] = useState(false);

    // Couleurs personnalisables
    const colorFields = [
        { key: 'primary' as const, label: 'Couleur primaire', description: 'Couleur principale de l\'interface' },
        { key: 'secondary' as const, label: 'Couleur secondaire', description: 'Couleur secondaire et accents' },
        { key: 'accent' as const, label: 'Couleur d\'accent', description: 'Couleur pour les éléments mis en valeur' },
        { key: 'background' as const, label: 'Arrière-plan', description: 'Couleur de fond principale' },
        { key: 'surface' as const, label: 'Surface', description: 'Couleur des cartes et panneaux' },
        { key: 'text' as const, label: 'Texte', description: 'Couleur du texte principal' }
    ];

    const handleColorChange = (key: keyof ThemePreferences['customColors'], value: string) => {
        setCustomColors({ [key]: value });
    };

    const handleExport = () => {
        const data = exportPreferences();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wakedock-theme-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        if (importPreferences(importData)) {
            setImportData('');
            setShowImport(false);
            // Optionnel: afficher une notification de succès
        } else {
            // Optionnel: afficher une erreur
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (importPreferences(content)) {
                    // Optionnel: afficher une notification de succès
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className={`bg-surface border border-border rounded-lg shadow-lg ${className}`}>
            {/* En-tête */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-text">Personnalisation du thème</h3>
                            <p className="text-sm text-text-muted">
                                Configurez l'apparence selon vos préférences
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
                            aria-label="Fermer"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Sélecteur de thème */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-text flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Mode de thème
                    </h4>
                    <ThemeToggle variant="switch" showLabel size="md" />
                    <p className="text-sm text-text-muted">
                        Thème actuel: <span className="font-medium">{activeTheme}</span>
                    </p>
                </div>

                {/* Couleurs personnalisées */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-text flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Couleurs personnalisées
                        </h4>
                        <button
                            onClick={resetCustomColors}
                            className="text-sm text-text-muted hover:text-text flex items-center gap-1 hover:bg-surface-light px-2 py-1 rounded transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Réinitialiser
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colorFields.map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                                <label className="block text-sm font-medium text-text">
                                    {label}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={preferences.customColors?.[key] || ''}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="w-12 h-10 rounded border border-border cursor-pointer"
                                        title={`Choisir ${label.toLowerCase()}`}
                                    />
                                    <input
                                        type="text"
                                        value={preferences.customColors?.[key] || ''}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <p className="text-xs text-text-muted">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Options d'animation */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-text">Options visuelles</h4>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {preferences.animations ? (
                                    <Zap className="w-4 h-4 text-primary" />
                                ) : (
                                    <ZapOff className="w-4 h-4 text-text-muted" />
                                )}
                                <div>
                                    <span className="text-sm font-medium text-text">Animations</span>
                                    <p className="text-xs text-text-muted">Active les animations d'interface</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.animations}
                                onChange={(e) => setAnimations(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {preferences.transitions ? (
                                    <Eye className="w-4 h-4 text-primary" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-text-muted" />
                                )}
                                <div>
                                    <span className="text-sm font-medium text-text">Transitions</span>
                                    <p className="text-xs text-text-muted">Active les transitions fluides</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.transitions}
                                onChange={(e) => setTransitions(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                            />
                        </label>
                    </div>
                </div>

                {/* Import/Export */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-text">Sauvegarde et partage</h4>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                        </button>

                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Importer
                        </button>

                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                            id="theme-file-import"
                        />
                        <label
                            htmlFor="theme-file-import"
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            Fichier
                        </label>
                    </div>

                    {/* Interface d'import par texte */}
                    {showImport && (
                        <div className="space-y-3 p-4 border border-border rounded-lg bg-background-light">
                            <label className="block text-sm font-medium text-text">
                                Importer depuis JSON
                            </label>
                            <textarea
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                                placeholder="Collez ici votre configuration JSON..."
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleImport}
                                    disabled={!importData.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Importer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowImport(false);
                                        setImportData('');
                                    }}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-surface-light transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Aperçu */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-text">Aperçu</h4>
                    <div className="p-4 border border-border rounded-lg bg-background-light">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded"></div>
                                <span className="text-sm text-text">Couleur primaire</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-secondary rounded"></div>
                                <span className="text-sm text-text">Couleur secondaire</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-accent rounded"></div>
                                <span className="text-sm text-text">Couleur d'accent</span>
                            </div>
                            <div className="p-3 bg-surface border border-border rounded text-text">
                                <p className="text-sm">Exemple de carte avec le thème {activeTheme}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
