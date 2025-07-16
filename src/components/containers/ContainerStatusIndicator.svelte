<!--
  Indicateur de statut pour containers
-->
<script lang="ts">
  import type { ContainerStatus } from '$lib/types/containers';

  export let status: ContainerStatus;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showText = true;
  export let animated = true;

  $: statusConfig = getStatusConfig(status);
  $: sizeClasses = getSizeClasses(size);

  interface StatusConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    text: string;
    icon: string;
    pulse: boolean;
  }

  function getStatusConfig(status: ContainerStatus): StatusConfig {
    switch (status) {
      case 'running':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'En cours',
          icon: '●',
          pulse: true,
        };
      case 'stopped':
      case 'exited':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Arrêté',
          icon: '■',
          pulse: false,
        };
      case 'paused':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          text: 'En pause',
          icon: '⏸',
          pulse: false,
        };
      case 'created':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Créé',
          icon: '○',
          pulse: false,
        };
      case 'restarting':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          text: 'Redémarrage',
          icon: '↻',
          pulse: true,
        };
      case 'dead':
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: 'Mort',
          icon: '✕',
          pulse: false,
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: 'Inconnu',
          icon: '?',
          pulse: false,
        };
    }
  }

  function getSizeClasses(size: 'sm' | 'md' | 'lg'): Record<string, string> {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'text-xs',
          text: 'text-xs',
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'text-base',
          text: 'text-base',
        };
      default: // md
        return {
          container: 'px-3 py-1 text-sm',
          icon: 'text-sm',
          text: 'text-sm',
        };
    }
  }
</script>

<div
  class="inline-flex items-center rounded-full border {statusConfig.bgColor} {statusConfig.borderColor} {statusConfig.color} {sizeClasses.container}"
  class:animate-pulse={animated && statusConfig.pulse}
>
  <span class="mr-1 {sizeClasses.icon}" class:animate-pulse={animated && statusConfig.pulse}>
    {statusConfig.icon}
  </span>
  {#if showText}
    <span class={sizeClasses.text}>
      {statusConfig.text}
    </span>
  {/if}
</div>

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
