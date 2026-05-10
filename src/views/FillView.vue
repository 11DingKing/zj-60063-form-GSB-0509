<template>
  <div class="fill-view">
    <div v-if="loading" class="fill-view__loading">
      <div class="fill-view__spinner"></div>
      <p>加载表单中...</p>
    </div>

    <div v-else-if="!formConfig" class="fill-view__error">
      <div class="fill-view__error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="fill-view__error-title">表单不存在</h2>
      <p class="fill-view__error-message">您访问的表单不存在或已被删除</p>
    </div>

    <div v-else-if="showSuccess" class="fill-view__success">
      <div class="fill-view__success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 class="fill-view__success-title">提交成功</h2>
      <p class="fill-view__success-message">{{ formConfig.submitMessage || '感谢您的填写！' }}</p>
      <button class="fill-view__success-btn" @click="resetForm">继续填写</button>
    </div>

    <template v-else>
      <div class="fill-view__header">
        <h1 class="fill-view__title">{{ formConfig.title || '未命名表单' }}</h1>
        <p v-if="formConfig.description" class="fill-view__description">
          {{ formConfig.description }}
        </p>
      </div>

      <div class="fill-view__steps" v-if="steps.length > 1">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="fill-view__step"
          :class="{
            'fill-view__step--active': index === currentStep,
            'fill-view__step--completed': index < currentStep,
          }"
        >
          <div class="fill-view__step-number">
            <span v-if="index >= currentStep">{{ index + 1 }}</span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span class="fill-view__step-label">{{ step.title }}</span>
        </div>
        <div
          v-for="(step, index) in steps.slice(0, -1)"
          :key="'line-' + step.id"
          class="fill-view__step-line"
          :class="{ 'fill-view__step-line--completed': index < currentStep }"
        ></div>
      </div>

      <div class="fill-view__form">
        <div v-for="field in visibleFields" :key="field.id" class="fill-view__field">
          <template v-if="field.type === 'group'">
            <fieldset class="fill-view__group">
              <legend class="fill-view__group-legend">
                <span>{{ field.label }}</span>
              </legend>
              <div class="fill-view__group-content">
                <FieldRenderer
                  v-for="childField in getVisibleGroupFields(field)"
                  :key="childField.id"
                  :field="childField"
                  :model-value="formData[childField.id]"
                  :disabled="submitting"
                  @update:model-value="(value: any) => updateFieldValue(childField.id, value)"
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
              :disabled="submitting"
              :error="errors[field.id]"
              @update:model-value="(value: any) => updateFieldValue(field.id, value)"
            />
          </template>
        </div>
      </div>

      <div class="fill-view__footer">
        <div class="fill-view__actions">
          <button
            v-if="steps.length > 1 && currentStep > 0"
            type="button"
            class="fill-view__btn fill-view__btn--secondary"
            :disabled="submitting"
            @click="goToPrevStep"
          >
            上一步
          </button>

          <button
            v-if="steps.length > 1 && currentStep < steps.length - 1"
            type="button"
            class="fill-view__btn fill-view__btn--primary"
            :disabled="submitting"
            @click="goToNextStep"
          >
            下一步
          </button>

          <button
            v-if="steps.length === 1 || currentStep === steps.length - 1"
            type="button"
            class="fill-view__btn fill-view__btn--primary"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting">提交中...</span>
            <span v-else>{{ formConfig.submitButtonText || '提交' }}</span>
          </button>

          <button
            v-if="formConfig.allowDraft"
            type="button"
            class="fill-view__btn fill-view__btn--secondary"
            :disabled="submitting"
            @click="handleSaveDraft"
          >
            保存草稿
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFormStore } from '@/store'
import type { FormConfig, Field, StepConfig } from '@/types'
import { evaluateCondition, validateField } from '@/utils/helpers'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'

const route = useRoute()
const formStore = useFormStore()

const loading = ref(true)
const submitting = ref(false)
const showSuccess = ref(false)
const currentStep = ref(0)

const formConfig = ref<FormConfig | null>(null)
const formData = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})

const steps = computed<StepConfig[]>(() => {
  return formConfig.value?.steps || []
})

const allFields = computed<Field[]>(() => {
  return formConfig.value?.fields || []
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
  if (errors[fieldId]) {
    delete errors[fieldId]
  }
}

function validateCurrentStep(): boolean {
  const fieldsToValidate = visibleFields.value.filter(
    (f) => f.type !== 'divider' && f.type !== 'group'
  )

  let isValid = true
  Object.keys(errors).forEach((key) => delete errors[key])

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
      errors[field.id] = result.message || '字段校验失败'
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

async function handleSubmit() {
  if (!validateCurrentStep() || !formConfig.value) return

  submitting.value = true

  try {
    formStore.addSubmission(formConfig.value.id, { ...formData })
    showSuccess.value = true
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

function handleSaveDraft() {
  localStorage.setItem(`form_draft_${formConfig.value?.id}`, JSON.stringify(formData))
  alert('草稿已保存')
}

function loadDraft() {
  const draft = localStorage.getItem(`form_draft_${formConfig.value?.id}`)
  if (draft) {
    try {
      const parsed = JSON.parse(draft)
      Object.assign(formData, parsed)
    } catch (e) {
      console.error('加载草稿失败:', e)
    }
  }
}

function resetForm() {
  Object.keys(formData).forEach((key) => delete formData[key])
  Object.keys(errors).forEach((key) => delete errors[key])
  currentStep.value = 0
  showSuccess.value = false
}

onMounted(() => {
  const formId = route.params.formId as string
  if (formId) {
    const form = formStore.forms.find((f) => f.id === formId)
    if (form) {
      formConfig.value = JSON.parse(JSON.stringify(form))
      loadDraft()
    }
  }
  loading.value = false
})
</script>

<style scoped>
  .fill-view {
    min-height: 100vh;
    background-color: var(--color-background);
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .fill-view__loading,
  .fill-view__error,
  .fill-view__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }

  .fill-view__spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-lg);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .fill-view__error-icon,
  .fill-view__success-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-bottom: var(--spacing-lg);
  }

  .fill-view__error-icon {
    background-color: var(--color-danger-light);
    color: var(--color-danger);
  }

  .fill-view__success-icon {
    background-color: var(--color-success-light);
    color: var(--color-success);
  }

  .fill-view__error-icon svg,
  .fill-view__success-icon svg {
    width: 40px;
    height: 40px;
    stroke-width: 2;
  }

  .fill-view__error-title,
  .fill-view__success-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .fill-view__error-message,
  .fill-view__success-message {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-lg) 0;
  }

  .fill-view__success-btn {
    padding: var(--spacing-sm) var(--spacing-xl);
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .fill-view__success-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .fill-view__header {
    max-width: 640px;
    margin: 0 auto var(--spacing-xl);
    text-align: center;
  }

  .fill-view__title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .fill-view__description {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .fill-view__steps {
    max-width: 640px;
    margin: 0 auto var(--spacing-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background-white);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    position: relative;
  }

  .fill-view__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    z-index: 1;
  }

  .fill-view__step-number {
    width: 36px;
    height: 36px;
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

  .fill-view__step-number svg {
    width: 18px;
    height: 18px;
  }

  .fill-view__step--active .fill-view__step-number {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .fill-view__step--completed .fill-view__step-number {
    background-color: var(--color-success);
    border-color: var(--color-success);
    color: white;
  }

  .fill-view__step-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .fill-view__step--active .fill-view__step-label {
    color: var(--color-primary);
  }

  .fill-view__step--completed .fill-view__step-label {
    color: var(--color-success);
  }

  .fill-view__step-line {
    flex: 1;
    height: 2px;
    margin: 0 var(--spacing-md);
    margin-top: -20px;
    background-color: var(--color-border);
    transition: background-color var(--transition-fast);
  }

  .fill-view__step-line--completed {
    background-color: var(--color-success);
  }

  .fill-view__form {
    max-width: 640px;
    margin: 0 auto var(--spacing-xl);
    background-color: var(--color-background-white);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 12px var(--color-shadow);
    padding: var(--spacing-xl);
  }

  .fill-view__field {
    margin-bottom: var(--spacing-lg);
  }

  .fill-view__field:last-child {
    margin-bottom: 0;
  }

  .fill-view__group {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .fill-view__group-legend {
    padding: 0 var(--spacing-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-regular);
  }

  .fill-view__group-content {
    padding-top: var(--spacing-sm);
  }

  .fill-view__footer {
    max-width: 640px;
    margin: 0 auto;
  }

  .fill-view__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
  }

  .fill-view__btn {
    padding: var(--spacing-sm) var(--spacing-xl);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .fill-view__btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .fill-view__btn--primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
  }

  .fill-view__btn--primary:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  .fill-view__btn--secondary {
    background-color: var(--color-background-white);
    color: var(--color-text-regular);
    border: 1px solid var(--color-border);
  }

  .fill-view__btn--secondary:hover:not(:disabled) {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
</style>
