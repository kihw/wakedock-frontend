<!--
  Carte d'affichage pour un container
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Container } from '$lib/types/containers';
  import { containerActions } from '$lib/stores/containers';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
  import {
    Play,
    Square,
    RotateCcw,
    Trash2,
    MoreVertical,
    Terminal,
    Info,
    Settings,
  } from 'lucide-svelte';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu';

  export let container: Container;

  const dispatch = createEventDispatcher<{
    viewLogs: Container;
    viewDetails: Container;
    edit: Container;
  }>();

  $: statusColor = getStatusColor(container.status);
  $: isRunning = container.status === 'running';

  function getStatusColor(status: string): string {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'exited':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'created':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getPortsText(): string {
    if (!container.ports || Object.keys(container.ports).length === 0) {
      return 'Aucun port exposé';
    }

    const portMappings = Object.entries(container.ports)
      .map(([containerPort, hostPorts]) => {
        if (Array.isArray(hostPorts) && hostPorts.length > 0) {
          return `${hostPorts[0].HostPort}:${containerPort}`;
        }
        return containerPort;
      })
      .slice(0, 2); // Limiter à 2 ports pour l'affichage

    const remaining = Object.keys(container.ports).length - portMappings.length;
    return portMappings.join(', ') + (remaining > 0 ? ` +${remaining}` : '');
  }

  async function handleStart() {
    await containerActions.startContainer(container.id);
  }

  async function handleStop() {
    await containerActions.stopContainer(container.id);
  }

  async function handleRestart() {
    await containerActions.restartContainer(container.id);
  }

  async function handleDelete() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le container "${container.name}" ?`)) {
      const force = container.status === 'running';
      await containerActions.deleteContainer(container.id, force);
    }
  }

  function handleViewLogs() {
    dispatch('viewLogs', container);
  }

  function handleViewDetails() {
    dispatch('viewDetails', container);
  }

  function handleEdit() {
    dispatch('edit', container);
  }
</script>

<Card class="h-full hover:shadow-lg transition-shadow duration-200">
  <CardHeader class="pb-3">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold truncate" title={container.name}>
          {container.name}
        </h3>
        <p class="text-sm text-gray-500 truncate" title={container.image}>
          {container.image}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Badge class={statusColor}>
          {container.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild let:builder>
            <Button builders={[builder]} variant="ghost" size="sm" class="w-8 h-8 p-0">
              <MoreVertical class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem on:click={handleViewDetails}>
              <Info class="w-4 h-4 mr-2" />
              Détails
            </DropdownMenuItem>
            <DropdownMenuItem on:click={handleViewLogs}>
              <Terminal class="w-4 h-4 mr-2" />
              Logs
            </DropdownMenuItem>
            <DropdownMenuItem on:click={handleEdit}>
              <Settings class="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem on:click={handleDelete} class="text-red-600">
              <Trash2 class="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </CardHeader>

  <CardContent class="pt-0">
    <div class="space-y-3">
      <!-- Informations du container -->
      <div class="text-sm text-gray-600">
        <div class="flex justify-between items-center">
          <span>ID:</span>
          <code class="text-xs bg-gray-100 px-1 rounded">
            {container.id.substring(0, 12)}
          </code>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span>Créé:</span>
          <span>{formatDate(container.created)}</span>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span>Ports:</span>
          <span class="text-xs">{getPortsText()}</span>
        </div>
      </div>

      <!-- Variables d'environnement (aperçu) -->
      {#if container.environment && Object.keys(container.environment).length > 0}
        <div class="text-sm">
          <span class="text-gray-600">Environnement:</span>
          <div class="mt-1 text-xs">
            <Badge variant="outline" class="mr-1">
              {Object.keys(container.environment).length} variables
            </Badge>
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex space-x-2 pt-2">
        {#if isRunning}
          <Button variant="outline" size="sm" on:click={handleStop} class="flex-1">
            <Square class="w-4 h-4 mr-1" />
            Stop
          </Button>
          <Button variant="outline" size="sm" on:click={handleRestart} class="flex-1">
            <RotateCcw class="w-4 h-4 mr-1" />
            Restart
          </Button>
        {:else}
          <Button variant="default" size="sm" on:click={handleStart} class="flex-1">
            <Play class="w-4 h-4 mr-1" />
            Start
          </Button>
        {/if}

        <Button variant="outline" size="sm" on:click={handleViewLogs}>
          <Terminal class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
