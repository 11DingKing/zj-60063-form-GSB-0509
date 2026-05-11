<template>
  <div class="form-renderer">
    <div class="form-renderer__header" v-if="showHeader">
      <h2 class="form-renderer__title">{{ formConfig?.title }}</h2>
      <p v-if="formConfig?.description" class="form-renderer__description">
        {{ formConfig.description }}
      </p>
    </div>

    <div class="form-renderer__steps" v-if="showSteps && steps.length > 1">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="form-renderer__step"
        :class="{
          'form-renderer__step--active': index === currentStep,
          'form-renderer__step--completed': index < currentStep,
        }"
      >
        <div class="form-renderer__step-number">
          <span v-if="index >= currentStep">{{ index + 1 }}</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span class="form-renderer__step-label">{{ step.title }}</span>
      </div>
      <div
        v-for="(step, index) in steps.slice(0, -1)"
        :key="'line-' + step.id"
        class="form-renderer__step-line"
        :class="{ 'form-renderer__step-line--completed': index < currentStep }"
      ></div>
    </div>

    <div class="form-renderer__content">
      <div v-for="field in visibleFields" :key="field.id" class="form-renderer__field">
        <template v-if="field.type === 'group'">
          <fieldset class="form-renderer__group">
            <legend class="form-renderer__group-legend">
              <span>{{ field.label }}</span>
            </legend>
            <div class="form-renderer__group-content">
              <FieldRenderer
                v-for="childField in getVisibleGroupFields(field)"
                :key="childField.id"
                :field="childField"
                :model-value="formData[childField.id]"
                :disabled="disabled"
                @update:model-value="(value: any) => updateFieldValue(childField.id, value)"
                @change="(value: any) => emit('field-change', childField.id, value)"
              />
            </div>
          </fieldset>
        </template>
        <template v-else-if="field.type === 'divider'">
          <FieldRenderer :field="field" />
        </template>
        <template v-else>
          <FieldRenderer
            :field="field"
            :model-value="formData[field.id]"
            :disabled="disabled"
            @update:model-value="(value: any) => updateFieldValue(field.id, value)"
            @change="(value: any) => emit('field-change', field.id, value)"
          />
        </template>
      </div>
    </div>

    <div class="form-renderer__footer" v-if="showFooter">
      <div class="form-renderer__footer-actions">
        <button
          v-if="showSteps && currentStep > 0"
          type="button"
          class="form-renderer__btn form-renderer__btn--secondary"
          @click="goToPrevStep"
        >
          上一步
        </button>

        <button
          v-if="showSteps && currentStep < steps.length - 1"
          type="button"
          class="form-renderer__btn form-renderer__btn--primary"
          @click="goToNextStep"
        >
          下一步
        </button>

        <button
          v-if="!showSteps || currentStep === steps.length - 1"
          type="button"
          class="form-renderer__btn form-renderer__btn--primary"
          @click="handleSubmit"
        >
          {{ formConfig?.submitButtonText || '提交' }}
        </button>

        <button
          v-if="formConfig?.allowDraft"
          type="button"
          class="form-renderer__btn form-renderer__btn--secondary"
          @click="handleSaveDraft"
        >
          保存草稿
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { FormConfig, Field, StepConfig } from '@/types'
import { evaluateCondition, validateField } from '@/utils/helpers'
import FieldRenderer from './fields/FieldRenderer.vue'

interface Props {
  formConfig?: FormConfig | null
  initialData?: Record<string, any>
  disabled?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showSteps?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formConfig: null,
  initialData: () => ({}),
  disabled: false,
  showHeader: true,
  showFooter: true,
  showSteps: true,
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  'save-draft': [data: Record<string, any>]
  'field-change': [fieldId: string, value: any]
}>()

const formData = reactive<Record<string, any>>({})
const currentStep = ref(0)
const validationErrors = ref<Record<string, string>>({})

const steps = computed<StepConfig[]>(() => {
  return props.formConfig?.steps || []
})

const allFields = computed<Field[]>(() => {
  return props.formConfig?.fields || []
})

const currentStepFields = computed<Field[]>(() => {
  return allFields.value.filter((f) => (f.step || 0) === currentStep.value)
})

function isFieldVisible(field: Field, data: Record<string, any>): boolean {
  if (!field.displayCondition) return true

  const { triggerFieldId, operator, conditionValue } = field.displayCondition
  const triggerValue = data[triggerFieldId]

  return evaluateCondition(operator, triggerValue, conditionValue)
}

const visibleFields = computed<Field[]>(() => {
  return currentStepFields.value.filter((field) => isFieldVisible(field, formData))
})

function getVisibleGroupFields(groupField: Field & { children: Field[] }): Field[] {
  if (!groupField.children) return []
  return groupField.children.filter((field) => isFieldVisible(field, formData))
}

function updateFieldValue(fieldId: string, value: any) {
  formData[fieldId] = value
}

function validateCurrentStep(): boolean {
  const fieldsToValidate = visibleFields.value.filter(
    (f) => f.type !== 'divider' && f.type !== 'group'
  )

  let isValid = true
  validationErrors.value = {}

  for (const field of fieldsToValidate) {
    const value = formData[field.id]
    const rules: any[] = []

    if (field.required) {
      rules.push({ type: 'required' })
    }

    if (field.validationRules) {
      rules.push(...field.validationRules)
    }

    const result = validateField(value, rules)
    if (!result.valid) {
      isValid = false
      validationErrors.value[field.id] = result.message || '字段校验失败'
    }
  }

  return isValid
}

function goToPrevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function goToNextStep() {
  if (validateCurrentStep() && currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

function handleSubmit() {
  if (validateCurrentStep()) {
    emit('submit', { ...formData })
  }
}

function handleSaveDraft() {
  emit('save-draft', { ...formData })
}

watch(
  () => props.initialData,
  (newData) => {
    Object.assign(formData, newData)
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.form-renderer {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--color-background-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px var(--color-shadow);
  overflow: hidden;
}

.form-renderer__header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.form-renderer__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.form-renderer__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.form-renderer__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background-color: var(--color-background);
  position: relative;
}

.form-renderer__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  z-index: 1;
}

.form-renderer__step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-background-white);
  border: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.form-renderer__step-number svg {
  width: 16px;
  height: 16px;
}

.form-renderer__step--active .form-renderer__step-number {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.form-renderer__step--completed .form-renderer__step-number {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.form-renderer__step-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.form-renderer__step--active .form-renderer__step-label {
  color: var(--color-primary);
}

.form-renderer__step--completed .form-renderer__step-label {
  color: var(--color-success);
}

.form-renderer__step-line {
  flex: 1;
  height: 2px;
  margin: 0 var(--spacing-md);
  margin-top: -20px;
  background-color: var(--color-border);
  transition: background-color var(--transition-fast);
}

.form-renderer__step-line--completed {
  background-color: var(--color-success);
}

.form-renderer__content {
  padding: var(--spacing-xl);
}

.form-renderer__field {
  margin-bottom: var(--spacing-lg);
}

.form-renderer__field:last-child {
  margin-bottom: 0;
}

.form-renderer__group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.form-renderer__group-legend {
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-regular);
}

.form-renderer__group-content {
  padding-top: var(--spacing-sm);
}

.form-renderer__footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  background-color: var(--color-background);
}

.form-renderer__footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.form-renderer__btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.form-renderer__btn--primary {
  background-color: var(--color-primary);
  color: white;
}

.form-renderer__btn--primary:hover {
  background-color: var(--color-primary-dark);
}

.form-renderer__btn--secondary {
  background-color: var(--color-background-white);
  color: var(--color-text-regular);
  border: 1px solid var(--color-border);
}

.form-renderer__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
