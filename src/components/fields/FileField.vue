<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div class="file-upload" :class="{ 'file-upload--disabled': field.readonly || disabled }">
      <div v-if="!files.length" class="file-upload__placeholder" @click="triggerFileInput">
        <svg
          class="file-upload__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span class="file-upload__text">{{ field.placeholder || '点击上传文件' }}</span>
        <span class="file-upload__hint">支持 {{ field.accept || '所有格式' }}</span>
      </div>

      <div v-else class="file-upload__list">
        <div v-for="(file, index) in files" :key="index" class="file-upload__item">
          <div class="file-upload__item-info">
            <svg
              class="file-upload__item-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div class="file-upload__item-details">
              <span class="file-upload__item-name">{{ file.name }}</span>
              <span class="file-upload__item-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
          <button
            v-if="!field.readonly && !disabled"
            type="button"
            class="file-upload__item-remove"
            @click="removeFile(index)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <button
          v-if="field.multiple"
          type="button"
          class="file-upload__add-more"
          @click="triggerFileInput"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>继续添加</span>
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        :accept="field.accept"
        :multiple="field.multiple"
        :disabled="field.readonly || disabled"
        @change="handleFileChange"
        class="file-upload__input"
      />
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileField as FileFieldType, ValidationRule } from '@/types'
import { validateField, fileToBase64 } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface FileData {
  name: string
  size: number
  type: string
  base64: string
}

interface Props {
  field: FileFieldType
  modelValue?: FileData | FileData[] | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: FileData | FileData[] | null]
  change: [value: FileData | FileData[] | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const hasError = ref(false)
const errorMessage = ref('')

const files = computed<FileData[]>(() => {
  if (!props.modelValue) return []
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  return [props.modelValue]
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selectedFiles = input.files

  if (!selectedFiles || selectedFiles.length === 0) return

  const newFiles: FileData[] = []

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i]
    try {
      const base64 = await fileToBase64(file)
      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        base64,
      })
    } catch (e) {
      console.error('File upload error:', e)
    }
  }

  let resultValue: FileData | FileData[] | null

  if (props.field.multiple) {
    resultValue = [...files.value, ...newFiles]
  } else {
    resultValue = newFiles[0] || null
  }

  emit('update:modelValue', resultValue)
  emit('change', resultValue)
  validate()

  input.value = ''
}

function removeFile(index: number) {
  if (props.field.multiple) {
    const newFiles = [...files.value]
    newFiles.splice(index, 1)
    const resultValue = newFiles.length > 0 ? newFiles : null
    emit('update:modelValue', resultValue)
    emit('change', resultValue)
  } else {
    emit('update:modelValue', null)
    emit('change', null)
  }
  validate()
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
.file-upload {
  position: relative;
}

.file-upload--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.file-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-upload__placeholder:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.file-upload__icon {
  width: 40px;
  height: 40px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.file-upload__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  margin-bottom: var(--spacing-xs);
}

.file-upload__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.file-upload__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.file-upload__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background-white);
}

.file-upload__item-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.file-upload__item-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.file-upload__item-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-upload__item-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload__item-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.file-upload__item-remove {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: transparent;
  border-radius: var(--radius-sm);
  padding: 0;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.file-upload__item-remove:hover {
  color: var(--color-danger);
  background-color: var(--color-background);
}

.file-upload__item-remove svg {
  width: 16px;
  height: 16px;
}

.file-upload__add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-upload__add-more:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.file-upload__add-more svg {
  width: 16px;
  height: 16px;
}

.file-upload__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
