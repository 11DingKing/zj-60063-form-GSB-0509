<template>
  <div
    class="designer-field-wrapper"
    :class="{
      'designer-field-wrapper--selected': isSelected,
      'designer-field-wrapper--drag-over': isDragOver
    }"
    :draggable="field.type !== 'divider'"
    @dragstart="handleDragStart"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click.stop="selectField"
  >
    <div v-if="field.type !== 'divider' && field.type !== 'group'" class="designer-field-wrapper__header">
      <div class="designer-field-wrapper__drag-handle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="6" r="1"/>
          <circle cx="15" cy="6" r="1"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="9" cy="18" r="1"/>
          <circle cx="15" cy="18" r="1"/>
        </svg>
      </div>
      <span class="designer-field-wrapper__type">{{ getFieldTypeName(field.type) }}</span>
      <div class="designer-field-wrapper__actions">
        <button
          type="button"
          class="designer-field-wrapper__btn"
          @click.stop="removeField"
          title="删除字段"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="designer-field-wrapper__content">
      <FieldRenderer :field="field" :model-value="getDefaultValue(field)" :disabled="false" />
    </div>
    
    <div class="designer-field-wrapper__drop-indicator" v-if="isDragOver && isAbove"></div>
    <div class="designer-field-wrapper__drop-indicator designer-field-wrapper__drop-indicator--below" v-if="isDragOver && !isAbove"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types'
import FieldRenderer from '../fields/FieldRenderer.vue'

interface Props {
  field: Field
  index: number
  isSelected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'select': [fieldId: string]
  'remove': [fieldId: string]
  'drag-start': [field: Field, index: number]
  'drag-over': [index: number]
  'drop': []
}>()

const isDragOver = ref(false)
const isAbove = ref(false)

const fieldTypeNames: Record<string, string> = {
  input: '单行文本',
  textarea: '多行文本',
  number: '数字输入',
  radio: '单选框组',
  checkbox: '多选框组',
  select: '下拉选择',
  date: '日期选择',
  time: '时间选择',
  file: '文件上传',
  rate: '评分',
  switch: '开关',
  cascader: '级联选择',
  signature: '签名板',
  divider: '分割线',
  group: '分组容器'
}

function getFieldTypeName(type: string): string {
  return fieldTypeNames[type] || type
}

function getDefaultValue(field: Field): any {
  if (field.defaultValue !== undefined && field.defaultValue !== null) {
    return field.defaultValue
  }
  
  switch (field.type) {
    case 'checkbox':
      return []
    case 'switch':
      return false
    case 'rate':
      return 0
    case 'cascader':
      return []
    default:
      return ''
  }
}

function selectField() {
  emit('select', props.field.id)
}

function removeField() {
  emit('remove', props.field.id)
}

function handleDragStart(event: DragEvent) {
  event.stopPropagation()
  emit('drag-start', props.field, props.index)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const midY = rect.top + rect.height / 2
  isAbove.value = event.clientY < midY
  
  isDragOver.value = true
  emit('drag-over', props.index)
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  emit('drop')
}
</script>

<style scoped>
.designer-field-wrapper {
  position: relative;
  background-color: var(--color-background-white);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.designer-field-wrapper:hover {
  border-color: var(--color-border);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.designer-field-wrapper--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.designer-field-wrapper--drag-over {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.designer-field-wrapper__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px dashed var(--color-border-light);
}

.designer-field-wrapper__drag-handle {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  cursor: grab;
}

.designer-field-wrapper__drag-handle:active {
  cursor: grabbing;
}

.designer-field-wrapper__type {
  flex: 1;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.designer-field-wrapper__actions {
  display: flex;
  gap: var(--spacing-xs);
}

.designer-field-wrapper__btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.designer-field-wrapper__btn:hover {
  color: var(--color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.designer-field-wrapper__btn svg {
  width: 14px;
  height: 14px;
}

.designer-field-wrapper__content {
  min-height: 20px;
}

.designer-field-wrapper__content :deep(.field-wrapper) {
  margin-bottom: 0;
}

.designer-field-wrapper__drop-indicator {
  position: absolute;
  left: -2px;
  right: -2px;
  top: -4px;
  height: 4px;
  background-color: var(--color-primary);
  border-radius: 2px;
}

.designer-field-wrapper__drop-indicator--below {
  top: auto;
  bottom: -4px;
}
</style>
