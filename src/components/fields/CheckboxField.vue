<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div class="checkbox-group" :class="{ 'checkbox-group--disabled': field.readonly || disabled }">
      <label
        v-for="option in field.options"
        :key="option.value"
        class="checkbox-item"
        :class="{ 'checkbox-item--checked': isChecked(option.value) }"
      >
        <input
          type="checkbox"
          :value="option.value"
          :checked="isChecked(option.value)"
          :disabled="field.readonly || disabled"
          @change="handleChange(option.value)"
          class="checkbox-input"
        />
        <span class="checkbox-custom"></span>
        <span class="checkbox-label">{{ option.label }}</span>
      </label>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CheckboxField as CheckboxFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    field: CheckboxFieldType
    modelValue?: (string | number)[]
    disabled?: boolean
  }

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: (string | number)[]]
    change: [value: (string | number)[]]
  }>()

const hasError = ref(false)
const errorMessage = ref('')

function isChecked(value: string | number): boolean {
  return props.modelValue?.includes(value) || false
}

function handleChange(value: string | number) {
  const currentValue = [...(props.modelValue || [])]
  const index = currentValue.indexOf(value)

  if (index === -1) {
    currentValue.push(value)
  } else {
    currentValue.splice(index, 1)
  }

  emit('update:modelValue', currentValue)
  emit('change', currentValue)
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
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .checkbox-group--disabled {
    opacity: 0.6;
  }

  .checkbox-item {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-text-regular);
  }

  .checkbox-item:hover {
    color: var(--color-primary);
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox-custom {
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .checkbox-item:hover .checkbox-custom {
    border-color: var(--color-primary);
  }

  .checkbox-item--checked .checkbox-custom {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .checkbox-custom::after {
    content: '';
    width: 5px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) scale(0);
    transition: transform var(--transition-fast);
    margin-top: -2px;
  }

  .checkbox-item--checked .checkbox-custom::after {
    transform: rotate(45deg) scale(1);
  }

  .checkbox-label {
    user-select: none;
  }
</style>
