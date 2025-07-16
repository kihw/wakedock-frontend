<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { currentUser } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import UserProfile from '$lib/components/profile/UserProfile.svelte';

  let initialTab = 'profile';

  // Vérifier l'authentification et récupérer l'onglet depuis l'URL
  onMount(() => {
    if (!$currentUser) {
      goto('/auth/login');
      return;
    }

    // Récupérer l'onglet depuis les paramètres d'URL
    const tab = $page.url.searchParams.get('tab');
    if (tab && ['profile', 'preferences', 'security', 'activity'].includes(tab)) {
      initialTab = tab;
    }
  });
</script>

/** * Page principale du profil utilisateur * Point d'entrée pour la gestion du profil */

<svelte:head>
  <title>Mon Profil - WakeDock</title>
  <meta name="description" content="Gérez votre profil utilisateur et vos préférences" />
</svelte:head>

{#if $currentUser}
  <UserProfile {initialTab} />
{:else}
  <div class="flex justify-center items-center h-64">
    <p class="text-gray-500">Redirection vers la connexion...</p>
  </div>
{/if}
