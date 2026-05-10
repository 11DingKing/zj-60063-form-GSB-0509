<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div class="rate-component" :class="{ 'rate-component--disabled': field.readonly || disabled }">
      <div class="rate-stars">
        <span
          v-for="i in maxStars"
          :key="i"
          class="rate-star"
          :class="{
            'rate-star--active': i <= currentValue,
            'rate-star--half': field.allowHalf && i - 0.5 === currentValue,
          }"
          @click="handleClick(i)"
          @mousemove="handleMouseMove($event, i)"
          @mouseleave="handleMouseLeave"
        >
          <svg class="rate-star__icon" viewBox="0 0 24 24">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="i <= currentValue ? currentColor : 'transparent'"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </span>
      </div>
      <span v-if="showValue && currentValue > 0" class="rate-value">{{ currentValue }}</span>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RateField as RateFieldType, ValidationRule } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: RateFieldType
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
const hoverValue = ref<number | null>(null)
const showValue = ref(true)

const maxStars = computed(() => props.field.max || 5)

const currentValue = computed(() => {
  if (hoverValue.value !== null) {
    return hoverValue.value
  }
  return props.modelValue ?? 0
})

function handleClick(index: number) {
  if (props.field.readonly || props.disabled) return

  const value = index
  emit('update:modelValue', value)
  emit('change', value)
  validate()
}

function handleMouseMove(event: MouseEvent, index: number) {
  if (props.field.readonly || props.disabled) return

  if (props.field.allowHalf) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const isHalf = event.clientX - rect.left < rect.width / 2
    hoverValue.value = isHalf ? index - 0.5 : index
  } else {
    hoverValue.value = index
  }
}

function handleMouseLeave() {
  hoverValue.value = null
}

function validate() {
  const rules: ValidationRule[] = []

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
.rate-component {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
}

.rate-component--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.rate-stars {
  display: flex;
  gap: var(--spacing-xs);
}

.rate-star {
  cursor: pointer;
  font-size: 24px;
  color: var(--color-border);
  transition:
    transform var(--transition-fast),
    color var(--transition-fast);
}

.rate-star:hover {
  transform: scale(1.1);
}

.rate-star--active {
  color: #f5a623;
}

.rate-star__icon {
  width: 28px;
  height: 28px;
}

.rate-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  font-weight: 500;
}
</style>
