<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { currentUser } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';

  // Types
  interface ActivityEntry {
    id: number;
    action: string;
    description: string;
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    success: boolean;
    metadata?: Record<string, any>;
  }

  interface ActivityResponse {
    activities: ActivityEntry[];
    total: number;
    page: number;
    pages: number;
    per_page: number;
  }

  // State
  let activities: ActivityEntry[] = [];
  let totalPages = 0;
  let currentPage = 1;
  let totalActivities = 0;
  let loading = true;
  let perPage = 20;

  // Filtres
  let filters = {
    action: '',
    start_date: '',
    end_date: '',
    success: 'all',
  };

  const actionTypes = [
    { value: '', label: 'Toutes les actions' },
    { value: 'login', label: 'Connexion' },
    { value: 'logout', label: 'Déconnexion' },
    { value: 'profile_update', label: 'Modification profil' },
    { value: 'password_change', label: 'Changement mot de passe' },
    { value: 'preferences_update', label: 'Modification préférences' },
    { value: 'api_request', label: 'Requête API' },
    { value: 'data_export', label: 'Export de données' },
    { value: 'security_event', label: 'Événement sécurité' },
  ];

  const successOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'true', label: 'Succès uniquement' },
    { value: 'false', label: 'Échecs uniquement' },
  ];

  onMount(async () => {
    // Récupérer les paramètres d'URL
    const urlParams = new URLSearchParams($page.url.search);
    currentPage = parseInt(urlParams.get('page') || '1');

    await loadActivities();
  });

  async function loadActivities() {
    try {
      loading = true;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });

      // Ajouter les filtres s'ils sont définis
      if (filters.action) params.append('action', filters.action);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.success !== 'all') params.append('success', filters.success);

      const response = await fetch(`/api/v1/profile/me/activity?${params}`, {
        headers: {
          Authorization: `Bearer ${$currentUser?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data: ActivityResponse = await response.json();
      activities = data.activities;
      totalPages = data.pages;
      totalActivities = data.total;
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors du chargement de l'historique", 'error');
    } finally {
      loading = false;
    }
  }

  async function applyFilters() {
    currentPage = 1;
    await loadActivities();
  }

  async function clearFilters() {
    filters = {
      action: '',
      start_date: '',
      end_date: '',
      success: 'all',
    };
    currentPage = 1;
    await loadActivities();
  }

  async function onPageChange(page: number) {
    currentPage = page;
    await loadActivities();

    // Mettre à jour l'URL
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function getActionIcon(action: string): string {
    switch (action) {
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'profile_update':
        return '👤';
      case 'password_change':
        return '🔑';
      case 'preferences_update':
        return '⚙️';
      case 'api_request':
        return '🔌';
      case 'data_export':
        return '📤';
      case 'security_event':
        return '🛡️';
      default:
        return '📋';
    }
  }

  function getActionLabel(action: string): string {
    const type = actionTypes.find((t) => t.value === action);
    return type?.label || action;
  }

  function getStatusBadge(success: boolean): { class: string; text: string } {
    return success
      ? { class: 'bg-green-100 text-green-800', text: 'Succès' }
      : { class: 'bg-red-100 text-red-800', text: 'Échec' };
  }

  function truncateText(text: string, maxLength: number = 50): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Formatage des métadonnées pour affichage
  function formatMetadata(metadata: Record<string, any>): string {
    if (!metadata || Object.keys(metadata).length === 0) return '';

    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
</script>

/** * Page d'historique d'activité détaillé * Affiche l'historique complet des actions utilisateur
*/

<svelte:head>
  <title>Historique d'activité - WakeDock</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
  <!-- En-tête -->
  <div class="mb-8">
    <div class="flex items-center space-x-4 mb-4">
      <button on:click={() => window.history.back()} class="text-gray-600 hover:text-gray-800">
        ← Retour
      </button>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Historique d'activité</h1>
    </div>
    <p class="text-gray-600 dark:text-gray-400">
      Consultez l'historique complet de vos actions sur la plateforme
    </p>
  </div>

  <!-- Filtres -->
  <Card class="mb-6">
    <div slot="header">
      <h2 class="text-lg font-semibold">Filtres</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type d'action
        </label>
        <Select bind:value={filters.action}>
          {#each actionTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </Select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date de début
        </label>
        <Input type="date" bind:value={filters.start_date} />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date de fin
        </label>
        <Input type="date" bind:value={filters.end_date} />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Statut
        </label>
        <Select bind:value={filters.success}>
          {#each successOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </Select>
      </div>
    </div>

    <div class="flex space-x-4">
      <Button on:click={applyFilters}>Appliquer les filtres</Button>
      <Button variant="outline" on:click={clearFilters}>Effacer les filtres</Button>
    </div>
  </Card>

  <!-- Résultats -->
  <Card>
    <div slot="header" class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">
        Activités ({totalActivities} au total)
      </h2>
      <div class="text-sm text-gray-500">
        Page {currentPage} sur {totalPages}
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    {:else if activities.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Aucune activité trouvée pour les critères sélectionnés
        </p>
        <Button variant="outline" on:click={clearFilters}>Effacer les filtres</Button>
      </div>
    {:else}
      <!-- Liste des activités -->
      <div class="space-y-4">
        {#each activities as activity}
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3 flex-1">
                <div class="text-2xl">
                  {getActionIcon(activity.action)}
                </div>

                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      {getActionLabel(activity.action)}
                    </h3>

                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(
                        activity.success
                      ).class}"
                    >
                      {getStatusBadge(activity.success).text}
                    </span>
                  </div>

                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.description}
                  </p>

                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>📅 {formatDate(activity.timestamp)}</span>

                    {#if activity.ip_address}
                      <span>🌐 {activity.ip_address}</span>
                    {/if}

                    {#if activity.session_id}
                      <span>🔖 Session: {activity.session_id.substring(0, 8)}...</span>
                    {/if}
                  </div>

                  {#if activity.metadata && Object.keys(activity.metadata).length > 0}
                    <details class="mt-2">
                      <summary class="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                        Détails techniques
                      </summary>
                      <div class="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <pre class="whitespace-pre-wrap">{JSON.stringify(
                            activity.metadata,
                            null,
                            2
                          )}</pre>
                      </div>
                    </details>
                  {/if}

                  {#if activity.user_agent}
                    <div class="mt-1 text-xs text-gray-400">
                      🖥️ {truncateText(activity.user_agent, 80)}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <Pagination {currentPage} {totalPages} on:pageChange={(e) => onPageChange(e.detail)} />
        </div>
      {/if}
    {/if}
  </Card>
</div>
