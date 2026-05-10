<template>
  <div class="field-wrapper" :class="{ 'field-wrapper--error': hasError }">
    <div class="field-wrapper__label">
      <span>{{ label }}</span>
      <span v-if="required" class="field-wrapper__required">*</span>
    </div>
    <div class="field-wrapper__content">
      <slot></slot>
    </div>
    <div v-if="errorMessage" class="field-wrapper__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string
    required?: boolean
    hasError?: boolean
    errorMessage?: string
  }>()
</script>

<style scoped>
  .field-wrapper {
    margin-bottom: var(--spacing-lg);
  }

  .field-wrapper__label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-regular);
    font-weight: 500;
  }

  .field-wrapper__required {
    color: var(--color-danger);
    margin-left: var(--spacing-xs);
  }

  .field-wrapper__content {
    position: relative;
  }

  .field-wrapper__error {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-danger);
  }

  .field-wrapper--error input,
  .field-wrapper--error textarea,
  .field-wrapper--error select {
    border-color: var(--color-danger) !important;
  }
</style>
