<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { currentUser } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // Props
  export let initialTab: string = 'profile';

  // Types
  interface UserProfile {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
    password_changed_at?: string;
    preferences: {
      theme: string;
      language: string;
      timezone: string;
    };
    security: {
      password_age_days?: number;
      failed_login_attempts: number;
      is_account_locked: boolean;
      account_locked_until?: string;
    };
    permissions: string[];
    roles: Array<{ id: number; name: string; description: string }>;
    activity: {
      recent_activities: number;
      last_activity?: string;
      last_activity_action?: string;
      login_count_month: number;
    };
  }

  interface AvailablePreferences {
    themes: string[];
    languages: string[];
    timezones: string[];
  }

  // State
  let profile: UserProfile | null = null;
  let availablePrefs: AvailablePreferences | null = null;
  let loading = true;
  let saving = false;
  let activeTab = initialTab;

  // Form data
  let formData = {
    full_name: '',
    email: '',
    preferences: {
      theme: 'light',
      language: 'fr',
      timezone: 'UTC',
    },
  };

  // Options de préférences avec labels
  const themeLabels = {
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Automatique',
    'high-contrast': 'Contraste élevé',
  };

  const languageLabels = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano',
  };

  onMount(async () => {
    await loadProfile();
    await loadAvailablePreferences();
  });

  async function loadProfile() {
    try {
      loading = true;
      const response = await fetch('/api/v1/profile/me', {
        headers: {
          Authorization: `Bearer ${$currentUser?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil');
      }

      profile = await response.json();

      // Initialiser les données du formulaire
      if (profile) {
        formData = {
          full_name: profile.full_name || '',
          email: profile.email,
          preferences: { ...profile.preferences },
        };
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors du chargement du profil', 'error');
    } finally {
      loading = false;
    }
  }

  async function loadAvailablePreferences() {
    try {
      const response = await fetch('/api/v1/profile/preferences/available');

      if (response.ok) {
        availablePrefs = await response.json();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences disponibles:', error);
    }
  }

  async function saveProfile() {
    try {
      saving = true;

      const response = await fetch('/api/v1/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${$currentUser?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la sauvegarde');
      }

      showToast('Profil mis à jour avec succès', 'success');
      await loadProfile(); // Recharger les données
    } catch (error) {
      console.error('Erreur:', error);
      showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      saving = false;
    }
  }

  async function savePreferences() {
    try {
      saving = true;

      const response = await fetch('/api/v1/profile/me/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${$currentUser?.token}`,
        },
        body: JSON.stringify(formData.preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la sauvegarde des préférences');
      }

      showToast('Préférences mises à jour avec succès', 'success');
      await loadProfile();
    } catch (error) {
      console.error('Erreur:', error);
      showToast(error.message || 'Erreur lors de la sauvegarde des préférences', 'error');
    } finally {
      saving = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getRolesBadgeColor(roleName: string): string {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'developer':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

/** * Composant de gestion du profil utilisateur * Interface pour modifier les informations
personnelles et préférences */

<div class="max-w-4xl mx-auto p-6">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  {:else if profile}
    <!-- En-tête du profil -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profil utilisateur</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Gérez vos informations personnelles et préférences
      </p>
    </div>

    <!-- Navigation par onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'profile'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = 'profile')}
        >
          Informations personnelles
        </button>
        <button
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'preferences'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = 'preferences')}
        >
          Préférences
        </button>
        <button
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'security'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = 'security')}
        >
          Sécurité
        </button>
        <button
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'activity'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => (activeTab = 'activity')}
        >
          Activité
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    {#if activeTab === 'profile'}
      <Card>
        <div slot="header">
          <h2 class="text-xl font-semibold">Informations personnelles</h2>
        </div>

        <form on:submit|preventDefault={saveProfile} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <Input value={profile.username} disabled class="bg-gray-50 dark:bg-gray-800" />
              <p class="text-xs text-gray-500 mt-1">
                Le nom d'utilisateur ne peut pas être modifié
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <Input bind:value={formData.full_name} placeholder="Votre nom complet" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input type="email" bind:value={formData.email} required />
              {#if !profile.is_verified}
                <p class="text-xs text-amber-600 mt-1">⚠️ Email non vérifié</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut du compte
              </label>
              <div class="flex items-center space-x-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {profile.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'}"
                >
                  {profile.is_active ? 'Actif' : 'Inactif'}
                </span>
                {#if profile.is_superuser}
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    Administrateur
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Rôles -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôles
            </label>
            <div class="flex flex-wrap gap-2">
              {#each profile.roles as role}
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getRolesBadgeColor(
                    role.name
                  )}"
                >
                  {role.name}
                </span>
              {/each}
            </div>
          </div>

          <!-- Dates importantes -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compte créé le
              </label>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(profile.created_at)}
              </p>
            </div>

            {#if profile.last_login}
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dernière connexion
                </label>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(profile.last_login)}
                </p>
              </div>
            {/if}
          </div>

          <div class="flex justify-end">
            <Button type="submit" loading={saving} disabled={saving}>
              Sauvegarder les modifications
            </Button>
          </div>
        </form>
      </Card>
    {:else if activeTab === 'preferences'}
      <Card>
        <div slot="header">
          <h2 class="text-xl font-semibold">Préférences</h2>
        </div>

        <form on:submit|preventDefault={savePreferences} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thème
              </label>
              <Select bind:value={formData.preferences.theme}>
                {#if availablePrefs}
                  {#each availablePrefs.themes as theme}
                    <option value={theme}>
                      {themeLabels[theme] || theme}
                    </option>
                  {/each}
                {/if}
              </Select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue
              </label>
              <Select bind:value={formData.preferences.language}>
                {#if availablePrefs}
                  {#each availablePrefs.languages as lang}
                    <option value={lang}>
                      {languageLabels[lang] || lang}
                    </option>
                  {/each}
                {/if}
              </Select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuseau horaire
              </label>
              <Select bind:value={formData.preferences.timezone}>
                {#if availablePrefs}
                  {#each availablePrefs.timezones as tz}
                    <option value={tz}>{tz}</option>
                  {/each}
                {/if}
              </Select>
            </div>
          </div>

          <div class="flex justify-end">
            <Button type="submit" loading={saving} disabled={saving}>
              Sauvegarder les préférences
            </Button>
          </div>
        </form>
      </Card>
    {:else if activeTab === 'security'}
      <Card>
        <div slot="header">
          <h2 class="text-xl font-semibold">Informations de sécurité</h2>
        </div>

        <div class="space-y-6">
          <!-- Statut du mot de passe -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Âge du mot de passe
              </label>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {#if profile.security.password_age_days !== null}
                  {profile.security.password_age_days} jours
                  {#if profile.security.password_age_days > 90}
                    <span class="text-amber-600">⚠️ Mot de passe ancien</span>
                  {/if}
                {:else}
                  Non défini
                {/if}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tentatives de connexion échouées
              </label>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {profile.security.failed_login_attempts}
                {#if profile.security.failed_login_attempts > 0}
                  <span class="text-red-600">⚠️</span>
                {/if}
              </p>
            </div>
          </div>

          <!-- Statut du compte -->
          {#if profile.security.is_account_locked}
            <div
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                    Compte verrouillé
                  </h3>
                  <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                    {#if profile.security.account_locked_until}
                      <p>Jusqu'au {formatDate(profile.security.account_locked_until)}</p>
                    {:else}
                      <p>Contactez un administrateur pour déverrouiller votre compte</p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              on:click={() => (window.location.href = '/auth/change-password')}
            >
              Changer le mot de passe
            </Button>
          </div>
        </div>
      </Card>
    {:else if activeTab === 'activity'}
      <Card>
        <div slot="header">
          <h2 class="text-xl font-semibold">Activité récente</h2>
        </div>

        <div class="space-y-6">
          <!-- Statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.activity.recent_activities}
              </div>
              <div class="text-sm text-blue-800 dark:text-blue-300">Activités (30 jours)</div>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {profile.activity.login_count_month}
              </div>
              <div class="text-sm text-green-800 dark:text-green-300">Connexions (30 jours)</div>
            </div>

            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div class="text-sm font-medium text-purple-800 dark:text-purple-300">
                Dernière activité
              </div>
              <div class="text-xs text-purple-600 dark:text-purple-400">
                {#if profile.activity.last_activity}
                  {formatDate(profile.activity.last_activity)}
                  <br />
                  <span class="font-medium">{profile.activity.last_activity_action}</span>
                {:else}
                  Aucune activité récente
                {/if}
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" on:click={() => (window.location.href = '/profile/activity')}>
              Voir l'historique complet
            </Button>
          </div>
        </div>
      </Card>
    {/if}
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Erreur lors du chargement du profil</p>
      <Button variant="outline" on:click={loadProfile} class="mt-4">Réessayer</Button>
    </div>
  {/if}
</div>
