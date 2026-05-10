<template>
  <fieldset class="group-field" :class="{ 'group-field--collapsed': collapsed }">
    <legend class="group-field__legend" @click="toggleCollapse">
      <span class="group-field__title">{{ field.label }}</span>
      <svg
        class="group-field__toggle"
        viewBox="0 0 24 24"
        :style="{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)' }"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </legend>

    <div class="group-field__content">
      <slot></slot>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GroupField as GroupFieldType } from '@/types'

  interface Props {
    field: GroupFieldType
    modelValue?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

const collapsed = ref(props.field.collapsed || props.modelValue)

function toggleCollapse() {
  collapsed.value = !collapsed.value
  emit('update:modelValue', collapsed.value)
}

watch(
  () => props.field.collapsed,
  (newValue) => {
    collapsed.value = newValue ?? false
  }
)

watch(
  () => props.modelValue,
  (newValue) => {
    collapsed.value = newValue
  }
)
</script>

<style scoped>
  .group-field {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .group-field--collapsed {
    padding-bottom: 0;
  }

  .group-field__legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-regular);
    cursor: pointer;
    user-select: none;
  }

  .group-field__title {
    flex: 1;
  }

  .group-field__toggle {
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
    transition: transform var(--transition-fast);
  }

  .group-field__content {
    padding-top: var(--spacing-sm);
  }

  .group-field--collapsed .group-field__content {
    display: none;
  }
</style>
