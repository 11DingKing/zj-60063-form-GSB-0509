<template>
  <div class="designer-view">
    <div class="designer-view__header">
      <div class="designer-view__header-left">
        <button class="designer-view__btn designer-view__btn--ghost" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div class="designer-view__title-group">
          <input
            v-model="formTitle"
            type="text"
            class="designer-view__title-input"
            placeholder="未命名表单"
            @blur="updateFormConfig"
          />
        </div>
      </div>

      <div class="designer-view__header-right">
        <button
          class="designer-view__btn designer-view__btn--secondary"
          @click="showTemplateModal = true"
        >
          加载模板
        </button>
        <button
          class="designer-view__btn designer-view__btn--secondary"
          @click="showConfigModal = true"
        >
          表单配置
        </button>
        <button
          class="designer-view__btn designer-view__btn--secondary"
          @click="showPreview = true"
        >
          预览
        </button>
        <button class="designer-view__btn designer-view__btn--primary" @click="saveForm">
          保存
        </button>
        <button class="designer-view__btn designer-view__btn--primary" @click="publishForm">
          发布
        </button>
      </div>
    </div>

    <div class="designer-view__body">
      <div class="designer-view__panel designer-view__panel--left">
        <ComponentPanel />
      </div>

      <div class="designer-view__canvas">
        <CanvasArea
          :form-config="formStore.currentForm"
          :selected-field-id="formStore.selectedFieldId"
          @add-field="handleAddField"
          @select-field="formStore.selectField"
          @move-field="handleMoveField"
          @delete-field="formStore.deleteField"
        />
      </div>

      <div class="designer-view__panel designer-view__panel--right">
        <PropertyPanel
          :form-config="formStore.currentForm"
          :selected-field="selectedField"
          @update-field="handleUpdateField"
          @update-form-config="handleUpdateFormConfig"
        />
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showPreview"
        class="designer-view__modal-overlay"
        @click.self="showPreview = false"
      >
        <div class="designer-view__modal designer-view__modal--preview">
          <div class="designer-view__modal-header">
            <h3 class="designer-view__modal-title">预览表单</h3>
            <button class="designer-view__modal-close" @click="showPreview = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="designer-view__modal-body">
            <FormRenderer :form-config="formStore.currentForm" @submit="handlePreviewSubmit" />
          </div>
        </div>
      </div>

      <div
        v-if="showConfigModal"
        class="designer-view__modal-overlay"
        @click.self="showConfigModal = false"
      >
        <div class="designer-view__modal designer-view__modal--config">
          <div class="designer-view__modal-header">
            <h3 class="designer-view__modal-title">表单配置</h3>
            <button class="designer-view__modal-close" @click="showConfigModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="designer-view__modal-body">
            <div class="form-config-group">
              <label class="form-config-label">表单标题</label>
              <input
                v-model="localConfig.title"
                type="text"
                class="form-config-input"
                placeholder="请输入表单标题"
              />
            </div>

            <div class="form-config-group">
              <label class="form-config-label">表单描述</label>
              <textarea
                v-model="localConfig.description"
                class="form-config-textarea"
                placeholder="请输入表单描述"
                rows="3"
              ></textarea>
            </div>

            <div class="form-config-group">
              <label class="form-config-label">提交按钮文字</label>
              <input
                v-model="localConfig.submitButtonText"
                type="text"
                class="form-config-input"
                placeholder="提交"
              />
            </div>

            <div class="form-config-group">
              <label class="form-config-label">提交后提示语</label>
              <textarea
                v-model="localConfig.submitMessage"
                class="form-config-textarea"
                placeholder="提交成功！感谢您的填写。"
                rows="2"
              ></textarea>
            </div>

            <div class="form-config-group">
              <label class="form-config-checkbox">
                <input v-model="localConfig.allowDraft" type="checkbox" />
                <span>允许暂存草稿</span>
              </label>
            </div>

            <div class="form-config-divider"></div>

            <div class="form-config-group">
              <label class="form-config-label">
                步骤配置
                <span class="form-config-hint">（多个步骤将实现分步表单）</span>
              </label>
              <div class="form-config-steps">
                <div
                  v-for="(step, index) in localConfig.steps"
                  :key="step.id"
                  class="form-config-step-item"
                >
                  <span class="form-config-step-number">{{ index + 1 }}</span>
                  <input
                    v-model="step.title"
                    type="text"
                    class="form-config-input form-config-input--step"
                    :placeholder="'步骤 ' + (index + 1)"
                  />
                  <button
                    v-if="localConfig.steps.length > 1"
                    type="button"
                    class="form-config-step-remove"
                    @click="removeStep(index)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button type="button" class="form-config-step-add" @click="addStep">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  添加步骤
                </button>
              </div>
            </div>
          </div>
          <div class="designer-view__modal-footer">
            <button
              class="designer-view__btn designer-view__btn--secondary"
              @click="showConfigModal = false"
            >
              取消
            </button>
            <button class="designer-view__btn designer-view__btn--primary" @click="saveFormConfig">
              保存配置
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showTemplateModal"
        class="designer-view__modal-overlay"
        @click.self="showTemplateModal = false"
      >
        <div class="designer-view__modal designer-view__modal--template">
          <div class="designer-view__modal-header">
            <h3 class="designer-view__modal-title">选择模板</h3>
            <button class="designer-view__modal-close" @click="showTemplateModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="designer-view__modal-body">
            <div class="template-list">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="loadTemplate(template)"
              >
                <div class="template-item__preview">
                  <span>{{ template.name.charAt(0) }}</span>
                </div>
                <div class="template-item__info">
                  <h4 class="template-item__name">{{ template.name }}</h4>
                  <p class="template-item__description">{{ template.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showPublishSuccess"
        class="designer-view__modal-overlay"
        @click.self="showPublishSuccess = false"
      >
        <div class="designer-view__modal designer-view__modal--publish">
          <div class="designer-view__modal-body">
            <div class="publish-success">
              <div class="publish-success__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 class="publish-success__title">发布成功！</h3>
              <p class="publish-success__description">复制以下链接分享给他人填写</p>
              <div class="publish-success__link">
                <input
                  ref="publishLinkInput"
                  readonly
                  :value="publishLink"
                  class="publish-success__input"
                />
                <button class="publish-success__copy" @click="copyPublishLink">复制</button>
              </div>
              <div class="publish-success__actions">
                <button
                  class="designer-view__btn designer-view__btn--primary"
                  @click="showPublishSuccess = false"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormStore } from '@/store'
import { storeToRefs } from 'pinia'
import type { FormConfig, StepConfig, FormTemplate, Field } from '@/types'
import { templates } from '@/utils/templates'
import { generateId } from '@/utils/helpers'
import ComponentPanel from '@/components/designer/ComponentPanel.vue'
import CanvasArea from '@/components/designer/CanvasArea.vue'
import PropertyPanel from '@/components/designer/PropertyPanel.vue'
import FormRenderer from '@/components/FormRenderer.vue'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()
const publishLinkInput = ref<HTMLInputElement | null>(null)

const { currentForm, selectedField } = storeToRefs(formStore)

const formTitle = computed({
  get: () => currentForm.value?.title || '',
  set: (value) => {
    if (currentForm.value) {
      currentForm.value.title = value
    }
  },
})

const showPreview = ref(false)
const showConfigModal = ref(false)
const showTemplateModal = ref(false)
const showPublishSuccess = ref(false)
const publishLink = ref('')

const localConfig = reactive<Partial<FormConfig>>({
  title: '',
  description: '',
  submitButtonText: '提交',
  submitMessage: '提交成功！感谢您的填写。',
  allowDraft: false,
  steps: [{ id: generateId(), title: '步骤 1' }],
})

watch(
  () => currentForm.value,
  (form) => {
    if (form) {
      localConfig.title = form.title
      localConfig.description = form.description
      localConfig.submitButtonText = form.submitButtonText
      localConfig.submitMessage = form.submitMessage
      localConfig.allowDraft = form.allowDraft
      localConfig.steps = JSON.parse(
        JSON.stringify(form.steps || [{ id: generateId(), title: '步骤 1' }])
      )
    }
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  const formId = route.params.id as string
  if (formId) {
    const form = formStore.loadForm(formId)
    if (!form) {
      router.push('/')
    }
  } else {
    if (!formStore.currentFormId) {
      formStore.createNewForm()
    }
  }
})

function goBack() {
  router.push('/')
}

function handleAddField(field: Field, targetIndex?: number, parentId?: string) {
  formStore.addField(field, targetIndex, parentId)
}

function handleUpdateField(fieldId: string, updates: Partial<Field>) {
  formStore.updateField(fieldId, updates)
}

function handleMoveField(fieldId: string, targetIndex: number, parentId?: string) {
  formStore.moveField(fieldId, targetIndex, parentId)
}

function handleUpdateFormConfig(updates: Partial<FormConfig>) {
  formStore.updateForm(updates)
}

function updateFormConfig() {
  if (currentForm.value) {
    formStore.updateForm({ title: currentForm.value.title })
  }
}

function saveForm() {
  formStore.saveForm()
}

function publishForm() {
  if (currentForm.value) {
    formStore.publishForm()
    publishLink.value = `${window.location.origin}/fill/${currentForm.value.id}`
    showPublishSuccess.value = true
  }
}

function saveFormConfig() {
  formStore.updateForm({
    title: localConfig.title,
    description: localConfig.description,
    submitButtonText: localConfig.submitButtonText,
    submitMessage: localConfig.submitMessage,
    allowDraft: localConfig.allowDraft,
    steps: JSON.parse(JSON.stringify(localConfig.steps)),
  })
  showConfigModal.value = false
}

function addStep() {
  const newStep: StepConfig = {
    id: generateId(),
    title: `步骤 ${localConfig.steps.length + 1}`,
  }
  localConfig.steps.push(newStep)
}

function removeStep(index: number) {
  if (localConfig.steps.length > 1) {
    localConfig.steps.splice(index, 1)
  }
}

function loadTemplate(template: FormTemplate) {
  formStore.loadTemplate(template.id)
  showTemplateModal.value = false
}

function handlePreviewSubmit() {
  alert('表单提交成功！（预览模式）')
}

function copyPublishLink() {
  if (publishLinkInput.value) {
    publishLinkInput.value.select()
    document.execCommand('copy')
    alert('链接已复制到剪贴板！')
  }
}
</script>

<style scoped>
.designer-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

.designer-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-background-white);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: 0 1px 4px var(--color-shadow);
}

.designer-view__header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.designer-view__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.designer-view__btn svg {
  width: 16px;
  height: 16px;
}

.designer-view__btn--primary {
  background-color: var(--color-primary);
  color: white;
}

.designer-view__btn--primary:hover {
  background-color: var(--color-primary-dark);
}

.designer-view__btn--secondary {
  background-color: var(--color-background-white);
  color: var(--color-text-regular);
  border: 1px solid var(--color-border);
}

.designer-view__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.designer-view__btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
}

.designer-view__btn--ghost:hover {
  background-color: var(--color-background);
  color: var(--color-primary);
}

.designer-view__title-input {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  transition: border-color var(--transition-fast);
  outline: none;
  min-width: 200px;
}

.designer-view__title-input:hover,
.designer-view__title-input:focus {
  border-color: var(--color-border);
}

.designer-view__title-input::placeholder {
  color: var(--color-text-secondary);
}

.designer-view__header-right {
  display: flex;
  gap: var(--spacing-sm);
}

.designer-view__body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.designer-view__panel {
  width: 280px;
  background-color: var(--color-background-white);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.designer-view__panel--right {
  border-right: none;
  border-left: 1px solid var(--color-border-light);
}

.designer-view__canvas {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-xl);
}

.designer-view__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-xl);
}

.designer-view__modal {
  background-color: var(--color-background-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px var(--color-shadow);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalIn var(--transition-fast);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.designer-view__modal--preview {
  width: 100%;
  max-width: 900px;
}

.designer-view__modal--config {
  width: 100%;
  max-width: 500px;
}

.designer-view__modal--template {
  width: 100%;
  max-width: 600px;
}

.designer-view__modal--publish {
  width: 100%;
  max-width: 450px;
}

.designer-view__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.designer-view__modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.designer-view__modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.designer-view__modal-close svg {
  width: 20px;
  height: 20px;
}

.designer-view__modal-close:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.designer-view__modal-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-xl);
}

.designer-view__modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.form-config-group {
  margin-bottom: var(--spacing-lg);
}

.form-config-group:last-child {
  margin-bottom: 0;
}

.form-config-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-regular);
  margin-bottom: var(--spacing-sm);
}

.form-config-hint {
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.form-config-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-config-input:focus {
  border-color: var(--color-primary);
}

.form-config-input::placeholder {
  color: var(--color-text-placeholder);
}

.form-config-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
  resize: vertical;
  font-family: inherit;
}

.form-config-textarea:focus {
  border-color: var(--color-primary);
}

.form-config-textarea::placeholder {
  color: var(--color-text-placeholder);
}

.form-config-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.form-config-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.form-config-checkbox span {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
}

.form-config-divider {
  height: 1px;
  background-color: var(--color-border-light);
  margin: var(--spacing-lg) 0;
}

.form-config-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-config-step-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.form-config-step-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.form-config-input--step {
  flex: 1;
}

.form-config-step-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.form-config-step-remove svg {
  width: 16px;
  height: 16px;
}

.form-config-step-remove:hover {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.form-config-step-add {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.form-config-step-add svg {
  width: 16px;
  height: 16px;
}

.form-config-step-add:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.template-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.template-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.template-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.template-item__preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.template-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.template-item__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.template-item__description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
}

.publish-success {
  text-align: center;
}

.publish-success__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-success-light);
  color: var(--color-success);
  border-radius: 50%;
  margin: 0 auto var(--spacing-lg);
}

.publish-success__icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 3;
}

.publish-success__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.publish-success__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
}

.publish-success__link {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.publish-success__input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-background);
}

.publish-success__copy {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.publish-success__copy:hover {
  background-color: var(--color-primary-dark);
}

.publish-success__actions {
  display: flex;
  justify-content: center;
}
</style>
