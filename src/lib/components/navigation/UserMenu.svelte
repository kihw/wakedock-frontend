<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { currentUser, logout } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { clickOutside } from '$lib/actions/clickOutside';

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let userProfile = null;

  // Charger les informations basiques du profil
  onMount(async () => {
    if ($currentUser) {
      try {
        const response = await fetch('/api/v1/profile/me', {
          headers: {
            Authorization: `Bearer ${$currentUser.token}`,
          },
        });

        if (response.ok) {
          userProfile = await response.json();
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    }
  });

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    goto('/auth/login');
  }

  function navigateTo(path) {
    closeMenu();
    goto(path);
  }

  // Raccourci pour le nom d'affichage
  $: displayName = userProfile?.full_name || $currentUser?.username || 'Utilisateur';
  $: initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
</script>

/** * Menu déroulant du profil utilisateur * Affiché dans la barre de navigation pour accès rapide
*/

{#if $currentUser}
  <div class="relative" use:clickOutside on:click_outside={closeMenu}>
    <!-- Bouton d'avatar -->
    <button
      on:click={toggleMenu}
      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <!-- Avatar -->
      <div
        class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
      >
        {initials}
      </div>

      <!-- Nom et indicateur -->
      <div class="hidden md:flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {displayName}
        </span>
        <svg
          class="w-4 h-4 text-gray-400 transform transition-transform {isOpen ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>

    <!-- Menu déroulant -->
    {#if isOpen}
      <div
        class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <!-- En-tête du profil -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium"
            >
              {initials}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {$currentUser.username}
              </p>
              {#if userProfile}
                <div class="flex items-center space-x-1 mt-1">
                  {#if userProfile.is_verified}
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                    >
                      ✓ Vérifié
                    </span>
                  {/if}
                  {#if userProfile.is_superuser}
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800"
                    >
                      Admin
                    </span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Menu items -->
        <div class="py-2">
          <!-- Profil -->
          <button
            on:click={() => navigateTo('/profile')}
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Mon profil
          </button>

          <!-- Préférences -->
          <button
            on:click={() => navigateTo('/profile?tab=preferences')}
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Préférences
          </button>

          <!-- Sécurité -->
          <button
            on:click={() => navigateTo('/profile?tab=security')}
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Sécurité
          </button>

          <!-- Historique d'activité -->
          <button
            on:click={() => navigateTo('/profile/activity')}
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Historique d'activité
          </button>

          <!-- Changer mot de passe -->
          <button
            on:click={() => navigateTo('/auth/change-password')}
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Changer le mot de passe
          </button>

          <!-- Séparateur -->
          <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          <!-- Statistiques rapides -->
          {#if userProfile?.activity}
            <div class="px-4 py-2">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Activité récente</p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="font-medium text-blue-600 dark:text-blue-400">
                    {userProfile.activity.recent_activities}
                  </div>
                  <div class="text-blue-800 dark:text-blue-300">Actions</div>
                </div>
                <div class="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="font-medium text-green-600 dark:text-green-400">
                    {userProfile.activity.login_count_month}
                  </div>
                  <div class="text-green-800 dark:text-green-300">Connexions</div>
                </div>
              </div>
            </div>

            <!-- Séparateur -->
            <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
          {/if}

          <!-- Déconnexion -->
          <button
            on:click={handleLogout}
            class="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}
