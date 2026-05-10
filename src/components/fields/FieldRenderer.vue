<template>
  <component
    :is="fieldComponent"
    :field="field"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="handleUpdate"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Field } from '@/types'

const InputField = defineAsyncComponent(() => import('./InputField.vue'))
const TextareaField = defineAsyncComponent(() => import('./TextareaField.vue'))
const NumberField = defineAsyncComponent(() => import('./NumberField.vue'))
const RadioField = defineAsyncComponent(() => import('./RadioField.vue'))
const CheckboxField = defineAsyncComponent(() => import('./CheckboxField.vue'))
const SelectField = defineAsyncComponent(() => import('./SelectField.vue'))
const DateField = defineAsyncComponent(() => import('./DateField.vue'))
const TimeField = defineAsyncComponent(() => import('./TimeField.vue'))
const FileField = defineAsyncComponent(() => import('./FileField.vue'))
const RateField = defineAsyncComponent(() => import('./RateField.vue'))
const SwitchField = defineAsyncComponent(() => import('./SwitchField.vue'))
const CascaderField = defineAsyncComponent(() => import('./CascaderField.vue'))
const SignatureField = defineAsyncComponent(() => import('./SignatureField.vue'))
const DividerField = defineAsyncComponent(() => import('./DividerField.vue'))
const GroupField = defineAsyncComponent(() => import('./GroupField.vue'))

interface Props {
  field: Field
  modelValue?: unknown
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [value: unknown]
}>()

const fieldComponent = computed(() => {
  switch (props.field.type) {
    case 'input':
      return InputField
    case 'textarea':
      return TextareaField
    case 'number':
      return NumberField
    case 'radio':
      return RadioField
    case 'checkbox':
      return CheckboxField
    case 'select':
      return SelectField
    case 'date':
      return DateField
    case 'time':
      return TimeField
    case 'file':
      return FileField
    case 'rate':
      return RateField
    case 'switch':
      return SwitchField
    case 'cascader':
      return CascaderField
    case 'signature':
      return SignatureField
    case 'divider':
      return DividerField
    case 'group':
      return GroupField
    default:
      return InputField
  }
})

function handleUpdate(value: unknown) {
  emit('update:modelValue', value)
}

function handleChange(value: unknown) {
  emit('change', value)
}
</script>
