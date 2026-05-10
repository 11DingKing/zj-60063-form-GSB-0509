<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div
      class="switch-component"
      :class="{ 'switch-component--disabled': field.readonly || disabled }"
    >
      <button
        type="button"
        class="switch"
        :class="{ 'switch--active': modelValue }"
        :disabled="field.readonly || disabled"
        @click="toggle"
      >
        <span class="switch__slider"></span>
      </button>
      <span v-if="field.inactiveText && !modelValue" class="switch__text switch__text--inactive">
        {{ field.inactiveText }}
      </span>
      <span v-if="field.activeText && modelValue" class="switch__text switch__text--active">
        {{ field.activeText }}
      </span>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SwitchField as SwitchFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    field: SwitchFieldType
    modelValue?: boolean
    disabled?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    change: [value: boolean]
  }>()

const hasError = ref(false)
const errorMessage = ref('')

function toggle() {
  if (props.field.readonly || props.disabled) return

  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
  validate()
}

function validate() {
  const rules: any[] = []

  if (props.field.required) {
    rules.push({ type: 'required' })
  }

  if (props.field.validationRules) {
    rules.push(...props.field.validationRules)
  }

  const result = validateField(props.modelValue, rules)
  hasError.value = !result.valid
  errorMessage.value = result.message || ''
}
</script>

<style scoped>
  .switch-component {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .switch-component--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .switch {
    position: relative;
    width: 44px;
    height: 24px;
    padding: 0;
    background-color: var(--color-border);
    border-radius: var(--radius-full);
    transition: background-color var(--transition-fast);
  }

  .switch:hover:not(:disabled) {
    background-color: var(--color-text-placeholder);
  }

  .switch--active {
    background-color: var(--color-primary);
  }

  .switch--active:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  .switch__slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform var(--transition-fast);
    box-shadow: 0 1px 3px var(--color-shadow);
  }

  .switch--active .switch__slider {
    transform: translateX(20px);
  }

  .switch__text {
    font-size: var(--font-size-sm);
  }

  .switch__text--active {
    color: var(--color-primary);
  }

  .switch__text--inactive {
    color: var(--color-text-secondary);
  }
</style>
