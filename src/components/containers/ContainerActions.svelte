<!--
  Boutons d'actions pour containers
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Container } from '$lib/types/containers';
  import { containerActions } from '$lib/stores/containers';

  export let container: Container;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'buttons' | 'dropdown' = 'buttons';

  const dispatch = createEventDispatcher<{
    actionStarted: { action: string; container: Container };
    actionCompleted: { action: string; container: Container; success: boolean };
  }>();

  $: isRunning = container.status === 'running';
  $: canStart = !isRunning && container.status !== 'restarting';
  $: canStop = isRunning;
  $: canRestart = isRunning;

  let isLoading = false;
  let currentAction = '';

  async function handleAction(action: string, handler: () => Promise<boolean>) {
    if (isLoading) return;

    isLoading = true;
    currentAction = action;
    
    dispatch('actionStarted', { action, container });

    try {
      const success = await handler();
      dispatch('actionCompleted', { action, container, success });
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      dispatch('actionCompleted', { action, container, success: false });
    } finally {
      isLoading = false;
      currentAction = '';
    }
  }

  async function handleStart() {
    return handleAction('start', () => containerActions.startContainer(container.id));
  }

  async function handleStop() {
    return handleAction('stop', () => containerActions.stopContainer(container.id));
  }

  async function handleRestart() {
    return handleAction('restart', () => containerActions.restartContainer(container.id));
  }

  async function handleDelete() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le container "${container.name}" ?`)) {
      return;
    }
    
    const force = container.status === 'running';
    return handleAction('delete', () => containerActions.deleteContainer(container.id, force));
  }

  function getButtonClasses(variant: 'primary' | 'secondary' | 'danger' = 'secondary'): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  }
</script>

{#if variant === 'buttons'}
  <div class="flex space-x-1">
    {#if canStart}
      <button
        on:click={handleStart}
        disabled={isLoading}
        class={getButtonClasses('primary')}
        title="Démarrer le container"
      >
        {#if isLoading && currentAction === 'start'}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        {/if}
        {#if size !== 'sm'}Start{/if}
      </button>
    {/if}

    {#if canStop}
      <button
        on:click={handleStop}
        disabled={isLoading}
        class={getButtonClasses('secondary')}
        title="Arrêter le container"
      >
        {#if isLoading && currentAction === 'stop'}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
          </svg>
        {/if}
        {#if size !== 'sm'}Stop{/if}
      </button>
    {/if}

    {#if canRestart}
      <button
        on:click={handleRestart}
        disabled={isLoading}
        class={getButtonClasses('secondary')}
        title="Redémarrer le container"
      >
        {#if isLoading && currentAction === 'restart'}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        {/if}
        {#if size !== 'sm'}Restart{/if}
      </button>
    {/if}

    <button
      on:click={handleDelete}
      disabled={isLoading}
      class={getButtonClasses('danger')}
      title="Supprimer le container"
    >
      {#if isLoading && currentAction === 'delete'}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      {/if}
      {#if size !== 'sm'}Delete{/if}
    </button>
  </div>
{:else}
  <!-- Dropdown variant -->
  <div class="relative inline-block text-left">
    <button
      class={getButtonClasses('secondary')}
      id="container-actions-menu"
      aria-expanded="true"
      aria-haspopup="true"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
      </svg>
    </button>
    
    <!-- Dropdown menu (implement with actual dropdown logic) -->
    <!-- This would need a proper dropdown implementation -->
  </div>
{/if}
