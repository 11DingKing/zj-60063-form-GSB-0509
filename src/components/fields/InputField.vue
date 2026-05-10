<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <input
      type="text"
      :value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.readonly || disabled"
      :maxlength="field.maxLength"
      @input="handleInput"
      @blur="validate"
      class="form-input"
    />
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InputField as InputFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    field: InputFieldType
    modelValue?: string
    disabled?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
  }>()

const hasError = ref(false)
const errorMessage = ref('')

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

function validate() {
  const rules: any[] = []

  if (props.field.required) {
    rules.push({ type: 'required' })
  }

  if (props.field.maxLength) {
    rules.push({ type: 'maxLength', value: props.field.maxLength })
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
  .form-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    background-color: var(--color-background-white);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    outline: none;
  }

  .form-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  .form-input::placeholder {
    color: var(--color-text-placeholder);
  }

  .form-input:disabled {
    background-color: var(--color-background);
    cursor: not-allowed;
  }
</style>
