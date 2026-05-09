<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <select
      :value="modelValue"
      :disabled="field.readonly || disabled"
      @change="handleChange"
      class="form-select"
    >
      <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
      <option
        v-for="option in field.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SelectField as SelectFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: SelectFieldType
  modelValue?: string | number | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [value: string | number | null]
}>()

const hasError = ref(false)
const errorMessage = ref('')

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : 
    (isNaN(Number(target.value)) ? target.value : Number(target.value))
  emit('update:modelValue', value)
  emit('change', value)
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
.form-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-background-white);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23909399' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-md) center;
  padding-right: 36px;
}

.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.form-select:disabled {
  background-color: var(--color-background);
  cursor: not-allowed;
}
</style>
