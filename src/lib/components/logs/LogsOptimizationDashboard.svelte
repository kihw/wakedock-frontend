<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import Icon from '$lib/components/Icon.svelte';

  // Types pour TypeScript
  interface OptimizationStats {
    storage_stats: {
      total_size: number;
      compressed_size: number;
      uncompressed_size: number;
      compression_ratio: number;
    };
    compression_stats: {
      active_operations: number;
      total_compressed: number;
      storage_saved: number;
    };
    indexing_stats: {
      index_size: number;
      indexed_logs: number;
      last_update: string;
    };
    cache_stats: {
      hit_rate: number;
      entries_count: number;
      memory_usage: number;
    };
    performance_metrics: {
      avg_search_time: number;
      throughput: number;
      cpu_usage: number;
      memory_usage: number;
    };
  }

  interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    potential_savings: number;
    action: string;
  }

  // Stores réactifs
  const stats = writable<OptimizationStats | null>(null);
  const recommendations = writable<Recommendation[]>([]);
  const loading = writable(true);
  const error = writable<string | null>(null);

  let refreshInterval: number;

  // Fonctions utilitaires
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatPercentage(value: number): string {
    return (value * 100).toFixed(1) + '%';
  }

  // API calls
  async function fetchOptimizationStats() {
    try {
      const response = await fetch('/api/v1/logs-optimization/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      stats.set(data);
      error.set(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des stats:', err);
      error.set('Impossible de charger les statistiques d\'optimisation');
    }
  }

  async function fetchRecommendations() {
    try {
      const response = await fetch('/api/v1/logs-optimization/recommendations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      recommendations.set(data.recommendations || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des recommandations:', err);
    }
  }

  async function compressLogs() {
    try {
      const response = await fetch('/api/v1/logs-optimization/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compression_type: 'lz4',
          min_age_hours: 24
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Actualiser les stats après compression
      await fetchOptimizationStats();
    } catch (err) {
      console.error('Erreur lors de la compression:', err);
    }
  }

  async function rebuildIndex() {
    try {
      const response = await fetch('/api/v1/logs-optimization/index/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_rebuild: false,
          preserve_cache: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchOptimizationStats();
    } catch (err) {
      console.error('Erreur lors de la reconstruction d\'index:', err);
    }
  }

  async function clearCache() {
    try {
      const response = await fetch('/api/v1/logs-optimization/cache/clear', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchOptimizationStats();
    } catch (err) {
      console.error('Erreur lors du vidage du cache:', err);
    }
  }

  // Lifecycle
  onMount(async () => {
    loading.set(true);
    await Promise.all([
      fetchOptimizationStats(),
      fetchRecommendations()
    ]);
    loading.set(false);

    // Actualisation automatique toutes les 30 secondes
    refreshInterval = setInterval(fetchOptimizationStats, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="logs-optimization-dashboard">
  {#if $loading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement des données d'optimisation...</p>
    </div>
  {:else if $error}
    <div class="error-container">
      <Icon name="alert-circle" size="24" />
      <p>{$error}</p>
      <button class="retry-btn" on:click={() => {
        loading.set(true);
        fetchOptimizationStats().finally(() => loading.set(false));
      }}>
        Réessayer
      </button>
    </div>
  {:else if $stats}
    <!-- En-tête avec actions rapides -->
    <div class="actions-header">
      <h2>Tableau de bord d'optimisation</h2>
      <div class="quick-actions">
        <button class="action-btn compress" on:click={compressLogs}>
          <Icon name="archive" size="16" />
          Compresser les logs
        </button>
        <button class="action-btn index" on:click={rebuildIndex}>
          <Icon name="database" size="16" />
          Reconstruire l'index
        </button>
        <button class="action-btn cache" on:click={clearCache}>
          <Icon name="trash-2" size="16" />
          Vider le cache
        </button>
      </div>
    </div>

    <!-- Métriques de performance principales -->
    <div class="metrics-grid">
      <div class="metric-card storage">
        <div class="metric-header">
          <Icon name="hard-drive" size="20" />
          <span>Stockage</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            {formatBytes($stats.storage_stats.total_size)}
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>Compressé:</span>
              <span>{formatBytes($stats.storage_stats.compressed_size)}</span>
            </div>
            <div class="detail-item">
              <span>Ratio:</span>
              <span>{formatPercentage($stats.storage_stats.compression_ratio)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="metric-card performance">
        <div class="metric-header">
          <Icon name="zap" size="20" />
          <span>Performance</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            {$stats.performance_metrics.avg_search_time.toFixed(2)}ms
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>Débit:</span>
              <span>{$stats.performance_metrics.throughput.toFixed(0)} req/s</span>
            </div>
            <div class="detail-item">
              <span>CPU:</span>
              <span>{formatPercentage($stats.performance_metrics.cpu_usage)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="metric-card cache">
        <div class="metric-header">
          <Icon name="layers" size="20" />
          <span>Cache</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            {formatPercentage($stats.cache_stats.hit_rate)}
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>Entrées:</span>
              <span>{$stats.cache_stats.entries_count.toLocaleString()}</span>
            </div>
            <div class="detail-item">
              <span>Mémoire:</span>
              <span>{formatBytes($stats.cache_stats.memory_usage)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="metric-card index">
        <div class="metric-header">
          <Icon name="search" size="20" />
          <span>Index</span>
        </div>
        <div class="metric-content">
          <div class="metric-value">
            {$stats.indexing_stats.indexed_logs.toLocaleString()}
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>Taille:</span>
              <span>{formatBytes($stats.indexing_stats.index_size)}</span>
            </div>
            <div class="detail-item">
              <span>Mis à jour:</span>
              <span>{new Date($stats.indexing_stats.last_update).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommandations -->
    {#if $recommendations.length > 0}
      <div class="recommendations-section">
        <h3>
          <Icon name="lightbulb" size="20" />
          Recommandations d'optimisation
        </h3>
        <div class="recommendations-grid">
          {#each $recommendations as recommendation}
            <div class="recommendation-card priority-{recommendation.priority}">
              <div class="recommendation-header">
                <span class="recommendation-title">{recommendation.title}</span>
                <span class="priority-badge">{recommendation.priority}</span>
              </div>
              <p class="recommendation-description">{recommendation.description}</p>
              <div class="recommendation-footer">
                <span class="potential-savings">
                  Économie potentielle: {formatBytes(recommendation.potential_savings)}
                </span>
                <button class="action-link">{recommendation.action}</button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Graphiques et analyses détaillées -->
    <div class="detailed-analysis">
      <div class="analysis-card">
        <h4>
          <Icon name="pie-chart" size="18" />
          Répartition du stockage
        </h4>
        <div class="storage-breakdown">
          <div class="storage-item">
            <div class="storage-bar">
              <div 
                class="storage-fill compressed" 
                style="width: {($stats.storage_stats.compressed_size / $stats.storage_stats.total_size) * 100}%"
              ></div>
              <div 
                class="storage-fill uncompressed" 
                style="width: {($stats.storage_stats.uncompressed_size / $stats.storage_stats.total_size) * 100}%"
              ></div>
            </div>
            <div class="storage-legend">
              <div class="legend-item">
                <span class="legend-color compressed"></span>
                <span>Compressé ({formatBytes($stats.storage_stats.compressed_size)})</span>
              </div>
              <div class="legend-item">
                <span class="legend-color uncompressed"></span>
                <span>Non compressé ({formatBytes($stats.storage_stats.uncompressed_size)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analysis-card">
        <h4>
          <Icon name="activity" size="18" />
          Activité de compression
        </h4>
        <div class="compression-stats">
          <div class="stat-item">
            <span class="stat-label">Opérations actives:</span>
            <span class="stat-value">{$stats.compression_stats.active_operations}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total compressé:</span>
            <span class="stat-value">{$stats.compression_stats.total_compressed.toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Espace économisé:</span>
            <span class="stat-value">{formatBytes($stats.compression_stats.storage_saved)}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .logs-optimization-dashboard {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .quick-actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.75rem;
  }

  .metric-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .recommendations-section {
    margin-bottom: 2rem;
  }

  .recommendations-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .recommendation-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    border-left-width: 4px;
  }

  .recommendation-card.priority-high {
    border-left-color: #ef4444;
  }

  .recommendation-card.priority-medium {
    border-left-color: #f59e0b;
  }

  .recommendation-card.priority-low {
    border-left-color: #10b981;
  }

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.5rem;
  }

  .recommendation-title {
    font-weight: 600;
    color: #111827;
  }

  .priority-badge {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: #f3f4f6;
    color: #6b7280;
    text-transform: uppercase;
  }

  .recommendation-description {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .recommendation-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .potential-savings {
    color: #059669;
    font-weight: 500;
  }

  .action-link {
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }

  .detailed-analysis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .analysis-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .analysis-card h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .storage-breakdown {
    margin-top: 1rem;
  }

  .storage-bar {
    height: 1rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .storage-fill {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .storage-fill.compressed {
    background: #10b981;
  }

  .storage-fill.uncompressed {
    background: #f59e0b;
    left: auto;
    right: 0;
  }

  .storage-legend {
    display: flex;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
  }

  .legend-color {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .legend-color.compressed {
    background: #10b981;
  }

  .legend-color.uncompressed {
    background: #f59e0b;
  }

  .compression-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }

  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .stat-value {
    font-weight: 600;
    color: #111827;
  }

  @media (max-width: 768px) {
    .logs-optimization-dashboard {
      padding: 1rem;
    }

    .actions-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .quick-actions {
      justify-content: center;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .recommendations-grid {
      grid-template-columns: 1fr;
    }

    .detailed-analysis {
      grid-template-columns: 1fr;
    }
  }
</style>
