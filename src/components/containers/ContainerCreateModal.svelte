<!--
  Modal de création/édition de container
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ContainerFormData } from '$lib/types/containers';
  import { containerActions, imageActions, images } from '$lib/stores/containers';
  import { onMount } from 'svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    created: void;
  }>();

  export let isOpen = true;
  export let editMode = false;
  export let initialData: ContainerFormData | null = null;

  // Données du formulaire
  let formData: ContainerFormData = {
    name: '',
    image: '',
    environment: [{ key: '', value: '' }],
    ports: [{ containerPort: '', hostPort: 8080 }],
    volumes: [{ hostPath: '', containerPath: '' }],
    command: '',
    workingDir: '',
    restartPolicy: 'no',
  };

  let isSubmitting = false;
  let errors: Record<string, string> = {};

  // Charger les données initiales si en mode édition
  $: if (initialData && editMode) {
    formData = { ...initialData };
  }

  onMount(() => {
    // Charger les images disponibles
    imageActions.loadImages();
  });

  function addEnvironmentVar() {
    formData.environment = [...formData.environment, { key: '', value: '' }];
  }

  function removeEnvironmentVar(index: number) {
    formData.environment = formData.environment.filter((_, i) => i !== index);
  }

  function addPort() {
    formData.ports = [...formData.ports, { containerPort: '', hostPort: 8080 }];
  }

  function removePort(index: number) {
    formData.ports = formData.ports.filter((_, i) => i !== index);
  }

  function addVolume() {
    formData.volumes = [...formData.volumes, { hostPath: '', containerPath: '' }];
  }

  function removeVolume(index: number) {
    formData.volumes = formData.volumes.filter((_, i) => i !== index);
  }

  function validateForm(): boolean {
    errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du container est requis';
    }

    if (!formData.image.trim()) {
      errors.image = "L'image Docker est requise";
    }

    // Valider les variables d'environnement
    formData.environment.forEach((env, index) => {
      if (env.key && !env.value) {
        errors[`env_${index}_value`] = 'La valeur est requise';
      }
      if (!env.key && env.value) {
        errors[`env_${index}_key`] = 'La clé est requise';
      }
    });

    // Valider les ports
    formData.ports.forEach((port, index) => {
      if (port.containerPort && !port.hostPort) {
        errors[`port_${index}_host`] = 'Le port hôte est requis';
      }
      if (!port.containerPort && port.hostPort) {
        errors[`port_${index}_container`] = 'Le port container est requis';
      }
    });

    // Valider les volumes
    formData.volumes.forEach((volume, index) => {
      if (volume.hostPath && !volume.containerPath) {
        errors[`volume_${index}_container`] = 'Le chemin container est requis';
      }
      if (!volume.hostPath && volume.containerPath) {
        errors[`volume_${index}_host`] = 'Le chemin hôte est requis';
      }
    });

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    isSubmitting = true;

    try {
      // Préparer les données pour l'API
      const containerData = {
        name: formData.name.trim(),
        image: formData.image.trim(),
        environment: formData.environment
          .filter((env) => env.key && env.value)
          .reduce((acc, env) => ({ ...acc, [env.key]: env.value }), {}),
        ports: formData.ports
          .filter((port) => port.containerPort && port.hostPort)
          .reduce((acc, port) => ({ ...acc, [port.containerPort]: port.hostPort }), {}),
        volumes: formData.volumes
          .filter((volume) => volume.hostPath && volume.containerPath)
          .reduce((acc, volume) => ({ ...acc, [volume.hostPath]: volume.containerPath }), {}),
        command: formData.command.trim() || undefined,
        working_dir: formData.workingDir.trim() || undefined,
        restart_policy: formData.restartPolicy,
      };

      if (editMode) {
        // TODO: Implémenter la mise à jour
        console.log('Update container:', containerData);
      } else {
        await containerActions.createContainer(containerData);
      }

      dispatch('created');
    } catch (error) {
      console.error('Erreur lors de la création/modification:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- En-tête -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {editMode ? 'Modifier le container' : 'Créer un nouveau container'}
          </h2>
          <button on:click={handleClose} class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenu du formulaire -->
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Informations de base -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nom du container *
            </label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              class:border-red-500={errors.name}
              placeholder="mon-container"
              required
            />
            {#if errors.name}
              <p class="mt-1 text-sm text-red-600">{errors.name}</p>
            {/if}
          </div>

          <div>
            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">
              Image Docker *
            </label>
            <div class="relative">
              <input
                type="text"
                id="image"
                bind:value={formData.image}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                class:border-red-500={errors.image}
                placeholder="nginx:latest"
                list="images-list"
                required
              />
              <datalist id="images-list">
                {#each $images as image}
                  {#each image.tags as tag}
                    <option value={tag}></option>
                  {/each}
                {/each}
              </datalist>
            </div>
            {#if errors.image}
              <p class="mt-1 text-sm text-red-600">{errors.image}</p>
            {/if}
          </div>
        </div>

        <!-- Variables d'environnement -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">
              Variables d'environnement
            </label>
            <button
              type="button"
              on:click={addEnvironmentVar}
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Ajouter
            </button>
          </div>
          <div class="space-y-2">
            {#each formData.environment as env, index}
              <div class="flex space-x-2">
                <input
                  type="text"
                  bind:value={env.key}
                  placeholder="VARIABLE_NAME"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`env_${index}_key`]}
                />
                <input
                  type="text"
                  bind:value={env.value}
                  placeholder="valeur"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`env_${index}_value`]}
                />
                <button
                  type="button"
                  on:click={() => removeEnvironmentVar(index)}
                  class="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>

        <!-- Ports -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700"> Mapping des ports </label>
            <button
              type="button"
              on:click={addPort}
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Ajouter
            </button>
          </div>
          <div class="space-y-2">
            {#each formData.ports as port, index}
              <div class="flex space-x-2 items-center">
                <input
                  type="number"
                  bind:value={port.hostPort}
                  placeholder="8080"
                  min="1"
                  max="65535"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`port_${index}_host`]}
                />
                <span class="text-gray-500">:</span>
                <input
                  type="text"
                  bind:value={port.containerPort}
                  placeholder="80/tcp"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`port_${index}_container`]}
                />
                <button
                  type="button"
                  on:click={() => removePort(index)}
                  class="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Format: port_hôte:port_container (ex: 8080:80/tcp)
          </p>
        </div>

        <!-- Volumes -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700"> Volumes </label>
            <button
              type="button"
              on:click={addVolume}
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Ajouter
            </button>
          </div>
          <div class="space-y-2">
            {#each formData.volumes as volume, index}
              <div class="flex space-x-2 items-center">
                <input
                  type="text"
                  bind:value={volume.hostPath}
                  placeholder="/chemin/hôte"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`volume_${index}_host`]}
                />
                <span class="text-gray-500">:</span>
                <input
                  type="text"
                  bind:value={volume.containerPath}
                  placeholder="/chemin/container"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  class:border-red-500={errors[`volume_${index}_container`]}
                />
                <button
                  type="button"
                  on:click={() => removeVolume(index)}
                  class="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>

        <!-- Options avancées -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="command" class="block text-sm font-medium text-gray-700 mb-1">
              Commande (optionnel)
            </label>
            <input
              type="text"
              id="command"
              bind:value={formData.command}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/bin/bash"
            />
          </div>

          <div>
            <label for="workingDir" class="block text-sm font-medium text-gray-700 mb-1">
              Répertoire de travail (optionnel)
            </label>
            <input
              type="text"
              id="workingDir"
              bind:value={formData.workingDir}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/app"
            />
          </div>
        </div>

        <div>
          <label for="restartPolicy" class="block text-sm font-medium text-gray-700 mb-1">
            Politique de redémarrage
          </label>
          <select
            id="restartPolicy"
            bind:value={formData.restartPolicy}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="no">Pas de redémarrage automatique</option>
            <option value="always">Toujours redémarrer</option>
            <option value="unless-stopped">Redémarrer sauf si arrêté manuellement</option>
            <option value="on-failure">Redémarrer en cas d'échec</option>
          </select>
        </div>
      </form>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          on:click={handleClose}
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          on:click={handleSubmit}
          class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          {/if}
          {editMode ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </div>
  </div>
{/if}
