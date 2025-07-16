<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { currentUser } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // State
  let loading = false;
  let showCurrentPassword = false;
  let showNewPassword = false;
  let showConfirmPassword = false;

  // Form data
  let formData = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  // Validation
  let errors = {
    current_password: '',
    new_password: '',
    confirm_password: '',
    general: '',
  };

  let passwordStrength = {
    score: 0,
    feedback: [],
    isValid: false,
  };

  // Règles de mot de passe
  const passwordRules = [
    { id: 'length', text: 'Au moins 8 caractères', regex: /.{8,}/ },
    { id: 'lowercase', text: 'Au moins une minuscule', regex: /[a-z]/ },
    { id: 'uppercase', text: 'Au moins une majuscule', regex: /[A-Z]/ },
    { id: 'number', text: 'Au moins un chiffre', regex: /\d/ },
    { id: 'special', text: 'Au moins un caractère spécial', regex: /[!@#$%^&*(),.?":{}|<>]/ },
  ];

  $: {
    // Validation en temps réel du nouveau mot de passe
    if (formData.new_password) {
      validatePassword();
    }

    // Validation de la confirmation
    if (formData.confirm_password) {
      validateConfirmPassword();
    }
  }

  function validatePassword() {
    errors.new_password = '';
    passwordStrength.feedback = [];
    passwordStrength.score = 0;

    if (!formData.new_password) {
      passwordStrength.isValid = false;
      return;
    }

    // Vérifier chaque règle
    const passedRules = passwordRules.filter((rule) => rule.regex.test(formData.new_password));

    passwordStrength.score = passedRules.length;
    passwordStrength.isValid = passedRules.length === passwordRules.length;

    // Générer les commentaires
    const failedRules = passwordRules.filter((rule) => !rule.regex.test(formData.new_password));

    if (failedRules.length > 0) {
      passwordStrength.feedback = failedRules.map((rule) => rule.text);
    }

    // Vérifications supplémentaires
    if (formData.new_password === formData.current_password) {
      errors.new_password = "Le nouveau mot de passe doit être différent de l'ancien";
      passwordStrength.isValid = false;
    }

    // Vérifier les patterns courants faibles
    const commonPatterns = [/^123456/, /^password/i, /^admin/i, /^qwerty/i, /^azerty/i];

    if (commonPatterns.some((pattern) => pattern.test(formData.new_password))) {
      errors.new_password = 'Ce mot de passe est trop prévisible';
      passwordStrength.isValid = false;
    }
  }

  function validateConfirmPassword() {
    errors.confirm_password = '';

    if (formData.confirm_password && formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
  }

  function getPasswordStrengthColor(): string {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  }

  function getPasswordStrengthLabel(): string {
    if (passwordStrength.score <= 2) return 'Faible';
    if (passwordStrength.score <= 3) return 'Moyen';
    if (passwordStrength.score <= 4) return 'Bon';
    return 'Excellent';
  }

  async function handleSubmit() {
    // Reset errors
    errors = {
      current_password: '',
      new_password: '',
      confirm_password: '',
      general: '',
    };

    // Validation
    if (!formData.current_password) {
      errors.current_password = 'Le mot de passe actuel est requis';
      return;
    }

    if (!formData.new_password) {
      errors.new_password = 'Le nouveau mot de passe est requis';
      return;
    }

    if (!passwordStrength.isValid) {
      errors.new_password = 'Le mot de passe ne respecte pas les critères de sécurité';
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Les mots de passe ne correspondent pas';
      return;
    }

    try {
      loading = true;

      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${$currentUser?.token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors du changement de mot de passe');
      }

      showToast('Mot de passe modifié avec succès', 'success');

      // Rediriger vers le profil après un court délai
      setTimeout(() => {
        goto('/profile');
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);

      if (error.message.includes('incorrect')) {
        errors.current_password = 'Mot de passe actuel incorrect';
      } else {
        errors.general = error.message || 'Erreur lors du changement de mot de passe';
      }
    } finally {
      loading = false;
    }
  }

  function clearForm() {
    formData = {
      current_password: '',
      new_password: '',
      confirm_password: '',
    };

    errors = {
      current_password: '',
      new_password: '',
      confirm_password: '',
      general: '',
    };
  }
</script>

/** * Page de changement de mot de passe * Interface sécurisée pour modifier le mot de passe
utilisateur */

<svelte:head>
  <title>Changer le mot de passe - WakeDock</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6">
  <!-- En-tête -->
  <div class="mb-8">
    <div class="flex items-center space-x-4 mb-4">
      <button on:click={() => window.history.back()} class="text-gray-600 hover:text-gray-800">
        ← Retour
      </button>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Changer le mot de passe</h1>
    </div>
    <p class="text-gray-600 dark:text-gray-400">
      Assurez-vous de choisir un mot de passe sécurisé pour protéger votre compte
    </p>
  </div>

  <!-- Message d'erreur général -->
  {#if errors.general}
    <div
      class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-200">
            {errors.general}
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Formulaire -->
  <Card>
    <div slot="header">
      <h2 class="text-xl font-semibold flex items-center">🔐 Modification du mot de passe</h2>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <!-- Mot de passe actuel -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe actuel *
        </label>
        <div class="relative">
          <Input
            type={showCurrentPassword ? 'text' : 'password'}
            bind:value={formData.current_password}
            placeholder="Votre mot de passe actuel"
            class={errors.current_password ? 'border-red-300' : ''}
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            on:click={() => (showCurrentPassword = !showCurrentPassword)}
          >
            {#if showCurrentPassword}
              👁️
            {:else}
              🙈
            {/if}
          </button>
        </div>
        {#if errors.current_password}
          <p class="text-sm text-red-600 mt-1">{errors.current_password}</p>
        {/if}
      </div>

      <!-- Nouveau mot de passe -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nouveau mot de passe *
        </label>
        <div class="relative">
          <Input
            type={showNewPassword ? 'text' : 'password'}
            bind:value={formData.new_password}
            placeholder="Votre nouveau mot de passe"
            class={errors.new_password ? 'border-red-300' : ''}
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            on:click={() => (showNewPassword = !showNewPassword)}
          >
            {#if showNewPassword}
              👁️
            {:else}
              🙈
            {/if}
          </button>
        </div>

        <!-- Indicateur de force du mot de passe -->
        {#if formData.new_password}
          <div class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                Force du mot de passe
              </span>
              <span class="text-xs text-gray-600 dark:text-gray-400">
                {getPasswordStrengthLabel()}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300 {getPasswordStrengthColor()}"
                style="width: {(passwordStrength.score / passwordRules.length) * 100}%"
              ></div>
            </div>
          </div>
        {/if}

        {#if errors.new_password}
          <p class="text-sm text-red-600 mt-1">{errors.new_password}</p>
        {/if}
      </div>

      <!-- Confirmation du mot de passe -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirmer le nouveau mot de passe *
        </label>
        <div class="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            bind:value={formData.confirm_password}
            placeholder="Confirmez votre nouveau mot de passe"
            class={errors.confirm_password ? 'border-red-300' : ''}
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            on:click={() => (showConfirmPassword = !showConfirmPassword)}
          >
            {#if showConfirmPassword}
              👁️
            {:else}
              🙈
            {/if}
          </button>
        </div>
        {#if errors.confirm_password}
          <p class="text-sm text-red-600 mt-1">{errors.confirm_password}</p>
        {/if}
      </div>

      <!-- Règles de mot de passe -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Critères de sécurité du mot de passe :
        </h3>
        <ul class="space-y-1">
          {#each passwordRules as rule}
            <li class="flex items-center text-sm">
              <span class="mr-2">
                {#if formData.new_password && rule.regex.test(formData.new_password)}
                  ✅
                {:else}
                  ❌
                {/if}
              </span>
              <span class="text-blue-700 dark:text-blue-300">
                {rule.text}
              </span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Actions -->
      <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" on:click={clearForm} disabled={loading}>
          Effacer
        </Button>

        <div class="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            on:click={() => goto('/profile')}
            disabled={loading}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            {loading}
            disabled={loading ||
              !passwordStrength.isValid ||
              formData.new_password !== formData.confirm_password}
          >
            Changer le mot de passe
          </Button>
        </div>
      </div>
    </form>
  </Card>

  <!-- Conseils de sécurité -->
  <Card class="mt-6">
    <div slot="header">
      <h3 class="text-lg font-medium flex items-center">🛡️ Conseils de sécurité</h3>
    </div>

    <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-start">
        <span class="mr-2">💡</span>
        <span
          >Utilisez un gestionnaire de mots de passe pour générer et stocker des mots de passe
          sécurisés</span
        >
      </div>

      <div class="flex items-start">
        <span class="mr-2">🔄</span>
        <span>Changez votre mot de passe régulièrement, au moins tous les 90 jours</span>
      </div>

      <div class="flex items-start">
        <span class="mr-2">🚫</span>
        <span>N'utilisez jamais le même mot de passe sur plusieurs services</span>
      </div>

      <div class="flex items-start">
        <span class="mr-2">📧</span>
        <span>Ne partagez jamais votre mot de passe par email ou message</span>
      </div>
    </div>
  </Card>
</div>
