<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div class="number-input-wrapper">
      <button
        type="button"
        class="number-input-btn"
        @click="decrease"
        :disabled="field.readonly || disabled"
      >
        -
      </button>
      <input
        type="number"
        :value="modelValue"
        :placeholder="field.placeholder"
        :disabled="field.readonly || disabled"
        :min="field.min"
        :max="field.max"
        :step="field.step || 1"
        @input="handleInput"
        @blur="validate"
        class="form-input number-input"
      />
      <button
        type="button"
        class="number-input-btn"
        @click="increase"
        :disabled="field.readonly || disabled"
      >
        +
      </button>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NumberField as NumberFieldType, ValidationRule } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: NumberFieldType
  modelValue?: number | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
}>()

const hasError = ref(false)
const errorMessage = ref('')

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const numValue = value === '' ? null : Number(value)
  emit('update:modelValue', numValue)
  emit('change', numValue)
}

function increase() {
  let newValue = (props.modelValue ?? 0) + (props.field.step ?? 1)
  if (props.field.max !== undefined && newValue > props.field.max) {
    newValue = props.field.max
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function decrease() {
  let newValue = (props.modelValue ?? 0) - (props.field.step ?? 1)
  if (props.field.min !== undefined && newValue < props.field.min) {
    newValue = props.field.min
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

function validate() {
  const rules: ValidationRule[] = []

  if (props.field.required) {
    rules.push({ type: 'required' })
  }

  if (props.field.min !== undefined) {
    rules.push({ type: 'min', value: props.field.min })
  }

  if (props.field.max !== undefined) {
    rules.push({ type: 'max', value: props.field.max })
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
.number-input-wrapper {
  display: flex;
  align-items: center;
}

.number-input-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-regular);
  font-size: var(--font-size-lg);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.number-input-btn:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  border-right: none;
}

.number-input-btn:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  border-left: none;
}

.number-input-btn:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.number-input-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-input {
  border-radius: 0;
  text-align: center;
  width: 100px;
  flex: 1;
}
</style>
