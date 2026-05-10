<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <textarea
      :value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.readonly || disabled"
      :maxlength="field.maxLength"
      :rows="field.rows || 4"
      @input="handleInput"
      @blur="validate"
      class="form-textarea"
    ></textarea>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TextareaField as TextareaFieldType, ValidationRule } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: TextareaFieldType
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
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

function validate() {
  const rules: ValidationRule[] = []

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
.form-textarea {
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
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.form-textarea::placeholder {
  color: var(--color-text-placeholder);
}

.form-textarea:disabled {
  background-color: var(--color-background);
  cursor: not-allowed;
}
</style>
