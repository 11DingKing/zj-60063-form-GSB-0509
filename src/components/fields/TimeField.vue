<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <input
      type="time"
      :value="modelValue"
      :disabled="field.readonly || disabled"
      @input="handleInput"
      @blur="validate"
      class="form-input time-input"
    />
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TimeField as TimeFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    field: TimeFieldType
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

  if (props.field.validationRules) {
    rules.push(...props.field.validationRules)
  }

  const result = validateField(props.modelValue, rules)
  hasError.value = !result.valid
  errorMessage.value = result.message || ''
}
</script>

<style scoped>
  .time-input {
    width: 100%;
  }
</style>
