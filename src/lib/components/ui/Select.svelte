<script lang="ts">
  export let value: string = '';
  export let id: string = '';
  export let name: string = '';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let multiple: boolean = false;
  export let size: number | undefined = undefined;

  let className: string = '';
  export { className as class };

  // Classes CSS de base
  const baseClasses = `
    block w-full rounded-md border-gray-300 dark:border-gray-600 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-100
    shadow-sm focus:border-blue-500 focus:ring-blue-500 
    disabled:bg-gray-50 dark:disabled:bg-gray-700 
    disabled:text-gray-500 dark:disabled:text-gray-400
    disabled:cursor-not-allowed
    sm:text-sm
  `;

  $: classes = `${baseClasses} ${className}`.trim();
</script>

/** * Composant Select réutilisable * Élément de sélection avec style cohérent */

<select
  {id}
  {name}
  bind:value
  {disabled}
  {required}
  {multiple}
  {size}
  class={classes}
  {...$$restProps}
  on:change
  on:blur
  on:focus
  on:input
>
  {#if placeholder && !multiple}
    <option value="" disabled selected={!value}>
      {placeholder}
    </option>
  {/if}

  <slot />
</select>

<style>
  select {
    transition:
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  select:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Style pour les options en mode sombre */
  :global(.dark) select option {
    background-color: #374151;
    color: #f9fafb;
  }
</style>
