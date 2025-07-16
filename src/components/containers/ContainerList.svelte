<!--
  Composant liste des containers
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    containers,
    filteredContainers,
    containerFilter,
    searchQuery,
    isLoadingContainers,
    containerError,
    containerActions,
  } from '$lib/stores/containers';
  import ContainerCard from './ContainerCard.svelte';
  import ContainerCreateModal from './ContainerCreateModal.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '$lib/components/ui/select';
  import { AlertCircle, Plus, RefreshCw } from 'lucide-svelte';

  let showCreateModal = false;

  onMount(() => {
    containerActions.loadContainers();
  });

  function handleRefresh() {
    containerActions.loadContainers();
  }

  function handleCreateContainer() {
    showCreateModal = true;
  }

  function handleFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    containerFilter.set(target.value);
  }

  function handleSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery.set(target.value);
  }
</script>

<div class="container mx-auto p-6">
  <!-- En-tête -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Containers Docker</h1>
    <div class="flex space-x-2">
      <Button variant="outline" on:click={handleRefresh} disabled={$isLoadingContainers}>
        <RefreshCw class="w-4 h-4 mr-2" class:animate-spin={$isLoadingContainers} />
        Actualiser
      </Button>
      <Button on:click={handleCreateContainer}>
        <Plus class="w-4 h-4 mr-2" />
        Nouveau Container
      </Button>
    </div>
  </div>

  <!-- Filtres et recherche -->
  <div class="flex space-x-4 mb-6">
    <div class="flex-1">
      <Input
        type="text"
        placeholder="Rechercher par nom, image ou ID..."
        value={$searchQuery}
        on:input={handleSearchChange}
        class="max-w-md"
      />
    </div>
    <div>
      <Select value={$containerFilter} onValueChange={(value) => containerFilter.set(value)}>
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les containers</SelectItem>
          <SelectItem value="running">En cours d'exécution</SelectItem>
          <SelectItem value="stopped">Arrêtés</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  <!-- Messages d'erreur -->
  {#if $containerError}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
        <span class="text-red-700">{$containerError}</span>
        <Button
          variant="ghost"
          size="sm"
          class="ml-auto text-red-600"
          on:click={containerActions.clearError}
        >
          Fermer
        </Button>
      </div>
    </div>
  {/if}

  <!-- Contenu principal -->
  {#if $isLoadingContainers}
    <div class="flex justify-center items-center py-12">
      <LoadingSpinner />
      <span class="ml-2 text-gray-600">Chargement des containers...</span>
    </div>
  {:else if $filteredContainers.length === 0}
    <div class="text-center py-12">
      <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
        <!-- Icône de container vide -->
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 3v18h20V3H2zm18 16H4V5h16v14z" />
          <path d="M6 7h12v2H6zm0 4h12v2H6zm0 4h8v2H6z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {$searchQuery || $containerFilter !== 'all' ? 'Aucun container trouvé' : 'Aucun container'}
      </h3>
      <p class="text-gray-500 mb-4">
        {$searchQuery || $containerFilter !== 'all'
          ? 'Essayez de modifier vos critères de recherche.'
          : 'Commencez par créer votre premier container Docker.'}
      </p>
      {#if !$searchQuery && $containerFilter === 'all'}
        <Button on:click={handleCreateContainer}>
          <Plus class="w-4 h-4 mr-2" />
          Créer un container
        </Button>
      {/if}
    </div>
  {:else}
    <!-- Grille des containers -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each $filteredContainers as container (container.id)}
        <ContainerCard {container} />
      {/each}
    </div>

    <!-- Statistiques -->
    <div class="mt-8 flex justify-center">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex space-x-6 text-sm text-gray-600">
          <span>Total: <strong>{$containers.length}</strong></span>
          <span
            >En cours: <strong>{$containers.filter((c) => c.status === 'running').length}</strong
            ></span
          >
          <span
            >Arrêtés: <strong>{$containers.filter((c) => c.status !== 'running').length}</strong
            ></span
          >
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Modal de création -->
{#if showCreateModal}
  <ContainerCreateModal
    on:close={() => (showCreateModal = false)}
    on:created={() => {
      showCreateModal = false;
      containerActions.loadContainers();
    }}
  />
{/if}
