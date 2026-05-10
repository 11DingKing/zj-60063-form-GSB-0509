<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div
      class="cascader-component"
      :class="{ 'cascader-component--disabled': field.readonly || disabled }"
    >
      <div
        class="cascader-trigger"
        :class="{ 'cascader-trigger--open': isOpen }"
        @click="toggleDropdown"
      >
        <span
          class="cascader-trigger__text"
          :class="{ 'cascader-trigger__text--placeholder': !displayText }"
        >
          {{ displayText || field.placeholder || '请选择' }}
        </span>
        <svg class="cascader-trigger__arrow" viewBox="0 0 24 24">
          <polyline
            points="6 9 12 15 18 9"
            :style="{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }"
          />
        </svg>
      </div>

      <div v-if="isOpen" class="cascader-dropdown" ref="dropdownRef">
        <div class="cascader-panels">
          <div v-for="(panel, panelIndex) in panels" :key="panelIndex" class="cascader-panel">
            <div
              v-for="option in panel"
              :key="option.value"
              class="cascader-option"
              :class="{
                'cascader-option--selected': isSelected(option, panelIndex),
                'cascader-option--expanded': isExpanded(option, panelIndex),
              }"
              @click="selectOption(option, panelIndex)"
            >
              <span>{{ option.label }}</span>
              <svg
                v-if="option.children && option.children.length > 0"
                class="cascader-option__arrow"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { CascaderField as CascaderFieldType, CascaderOption, ValidationRule } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: CascaderFieldType
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

const isOpen = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const selectedPath = ref<(string | number)[]>([...props.modelValue])
const dropdownRef = ref<HTMLElement | null>(null)

const panels = computed<CascaderOption[][]>(() => {
  const result: CascaderOption[][] = []
  let currentOptions: CascaderOption[] = props.field.options

  result.push(currentOptions)

  for (const value of selectedPath.value) {
    const option = currentOptions.find((o) => o.value === value)
    if (option && option.children && option.children.length > 0) {
      currentOptions = option.children
      result.push(currentOptions)
    } else {
      break
    }
  }

  return result
})

const displayText = computed(() => {
  if (selectedPath.value.length === 0) return ''

  const labels: string[] = []
  let options: CascaderOption[] = props.field.options

  for (const value of selectedPath.value) {
    const option = options.find((o) => o.value === value)
    if (option) {
      labels.push(option.label)
      if (option.children && option.children.length > 0) {
        options = option.children
      }
    }
  }

  return labels.join(' / ')
})

function toggleDropdown() {
  if (props.field.readonly || props.disabled) return
  isOpen.value = !isOpen.value
}

function isSelected(option: CascaderOption, panelIndex: number): boolean {
  return selectedPath.value[panelIndex] === option.value
}

function isExpanded(option: CascaderOption, panelIndex: number): boolean {
  return (
    selectedPath.value[panelIndex] === option.value && option.children && option.children.length > 0
  )
}

function selectOption(option: CascaderOption, panelIndex: number) {
  const newPath = [...selectedPath.value.slice(0, panelIndex), option.value]
  selectedPath.value = newPath

  if (!option.children || option.children.length === 0) {
    emit('update:modelValue', newPath)
    emit('change', newPath)
    isOpen.value = false
    validate()
  }
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

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPath.value = [...(newValue || [])]
  }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.cascader-component {
  position: relative;
}

.cascader-component--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.cascader-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background-white);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.cascader-trigger:hover {
  border-color: var(--color-primary);
}

.cascader-trigger--open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.cascader-trigger__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.cascader-trigger__text--placeholder {
  color: var(--color-text-placeholder);
}

.cascader-trigger__arrow {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.cascader-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  z-index: 1000;
  background-color: var(--color-background-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.cascader-panels {
  display: flex;
}

.cascader-panel {
  min-width: 150px;
  max-height: 200px;
  overflow-y: auto;
  border-right: 1px solid var(--color-border-light);
}

.cascader-panel:last-child {
  border-right: none;
}

.cascader-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.cascader-option:hover {
  background-color: var(--color-primary-light);
}

.cascader-option--selected,
.cascader-option--expanded {
  color: var(--color-primary);
  font-weight: 500;
}

.cascader-option__arrow {
  width: 16px;
  height: 16px;
  color: var(--color-text-placeholder);
}
</style>
