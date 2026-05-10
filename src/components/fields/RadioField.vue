<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div class="radio-group" :class="{ 'radio-group--disabled': field.readonly || disabled }">
      <label
        v-for="option in field.options"
        :key="option.value"
        class="radio-item"
        :class="{ 'radio-item--checked': modelValue === option.value }"
      >
        <input
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="field.readonly || disabled"
          @change="handleChange(option.value)"
          class="radio-input"
        />
        <span class="radio-custom"></span>
        <span class="radio-label">{{ option.label }}</span>
      </label>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RadioField as RadioFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    field: RadioFieldType
    modelValue?: string | number | null
    disabled?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string | number | null]
    change: [value: string | number | null]
  }>()

const hasError = ref(false)
const errorMessage = ref('')

function handleChange(value: string | number) {
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
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .radio-group--disabled {
    opacity: 0.6;
  }

  .radio-item {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-text-regular);
  }

  .radio-item:hover {
    color: var(--color-primary);
  }

  .radio-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-custom {
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .radio-item:hover .radio-custom {
    border-color: var(--color-primary);
  }

  .radio-item--checked .radio-custom {
    border-color: var(--color-primary);
  }

  .radio-custom::after {
    content: '';
    width: 8px;
    height: 8px;
    background-color: var(--color-primary);
    border-radius: 50%;
    transform: scale(0);
    transition: transform var(--transition-fast);
  }

  .radio-item--checked .radio-custom::after {
    transform: scale(1);
  }

  .radio-label {
    user-select: none;
  }
</style>
