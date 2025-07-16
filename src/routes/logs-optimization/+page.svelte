<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import LogsOptimizationDashboard from '$lib/components/logs/LogsOptimizationDashboard.svelte';
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Vérifier l'authentification
    if (!$authStore.isAuthenticated) {
      goto('/login');
      return;
    }
  });
</script>

<svelte:head>
  <title>Optimisation des Logs - WakeDock</title>
  <meta name="description" content="Tableau de bord d'optimisation et de performance des logs WakeDock" />
</svelte:head>

<div class="logs-optimization-page">
  <div class="page-header">
    <h1 class="page-title">
      <i class="lucide-zap"></i>
      Optimisation des Logs
    </h1>
    <p class="page-description">
      Optimisez les performances, gérez la compression et surveillez l'utilisation du stockage de vos logs.
    </p>
  </div>

  <!-- Dashboard principal d'optimisation -->
  <LogsOptimizationDashboard />
</div>

<style>
  .logs-optimization-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, #e2e8f0);
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
    margin: 0 0 0.5rem 0;
  }

  .page-title i {
    width: 2rem;
    height: 2rem;
    color: var(--primary-color, #3b82f6);
  }

  .page-description {
    font-size: 1.1rem;
    color: var(--text-secondary, #64748b);
    margin: 0;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .logs-optimization-page {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .page-title i {
      width: 1.5rem;
      height: 1.5rem;
    }

    .page-description {
      font-size: 1rem;
    }
  }
</style>
