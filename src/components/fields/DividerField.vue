<template>
  <div class="divider-field">
    <div class="divider-field__line"></div>
    <span v-if="field.text" class="divider-field__text">{{ field.text }}</span>
    <div class="divider-field__line"></div>
  </div>
</template>

<script setup lang="ts">
import type { DividerField as DividerFieldType } from '@/types'

defineProps<{
    field: DividerFieldType
  }>()
</script>

<style scoped>
  .divider-field {
    display: flex;
    align-items: center;
    margin: var(--spacing-lg) 0;
  }

  .divider-field__line {
    flex: 1;
    height: 1px;
    background-color: var(--color-border);
  }

  .divider-field__text {
    padding: 0 var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }
</style>
