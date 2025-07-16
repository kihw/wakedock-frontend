<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  export let currentPage: number = 1;
  export let totalPages: number = 1;
  export let showFirstLast: boolean = true;
  export let showPrevNext: boolean = true;
  export let maxVisiblePages: number = 5;

  const dispatch = createEventDispatcher();

  // Calculer les pages visibles
  $: visiblePages = calculateVisiblePages(currentPage, totalPages, maxVisiblePages);

  function calculateVisiblePages(current: number, total: number, max: number): number[] {
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const halfMax = Math.floor(max / 2);
    let start = Math.max(1, current - halfMax);
    let end = Math.min(total, start + max - 1);

    // Ajuster le début si on est près de la fin
    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch('pageChange', page);
    }
  }

  function goToPrevious() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  function goToNext() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function goToFirst() {
    goToPage(1);
  }

  function goToLast() {
    goToPage(totalPages);
  }

  // Classes CSS pour les boutons
  const baseButtonClass = 'px-3 py-2 text-sm font-medium border rounded-md transition-colors';
  const activeButtonClass = 'bg-blue-500 text-white border-blue-500';
  const inactiveButtonClass =
    'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700';
  const disabledButtonClass =
    'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600';
</script>

/** * Composant de pagination réutilisable * Interface pour naviguer entre les pages de résultats */

{#if totalPages > 1}
  <nav class="flex items-center justify-center space-x-1" aria-label="Pagination">
    <!-- Première page -->
    {#if showFirstLast && currentPage > 1}
      <button
        on:click={goToFirst}
        class="{baseButtonClass} {inactiveButtonClass}"
        aria-label="Première page"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>
    {/if}

    <!-- Page précédente -->
    {#if showPrevNext}
      <button
        on:click={goToPrevious}
        disabled={currentPage <= 1}
        class="{baseButtonClass} {currentPage <= 1 ? disabledButtonClass : inactiveButtonClass}"
        aria-label="Page précédente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    {/if}

    <!-- Ellipsis au début -->
    {#if visiblePages[0] > 1}
      <span class="px-2 py-2 text-sm text-gray-500">...</span>
    {/if}

    <!-- Pages numérotées -->
    {#each visiblePages as page}
      <button
        on:click={() => goToPage(page)}
        class="{baseButtonClass} {page === currentPage ? activeButtonClass : inactiveButtonClass}"
        aria-label="Page {page}"
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </button>
    {/each}

    <!-- Ellipsis à la fin -->
    {#if visiblePages[visiblePages.length - 1] < totalPages}
      <span class="px-2 py-2 text-sm text-gray-500">...</span>
    {/if}

    <!-- Page suivante -->
    {#if showPrevNext}
      <button
        on:click={goToNext}
        disabled={currentPage >= totalPages}
        class="{baseButtonClass} {currentPage >= totalPages
          ? disabledButtonClass
          : inactiveButtonClass}"
        aria-label="Page suivante"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}

    <!-- Dernière page -->
    {#if showFirstLast && currentPage < totalPages}
      <button
        on:click={goToLast}
        class="{baseButtonClass} {inactiveButtonClass}"
        aria-label="Dernière page"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </button>
    {/if}
  </nav>

  <!-- Informations de pagination -->
  <div class="flex items-center justify-center mt-4">
    <p class="text-sm text-gray-700 dark:text-gray-300">
      Page <span class="font-medium">{currentPage}</span> sur
      <span class="font-medium">{totalPages}</span>
    </p>
  </div>
{/if}
