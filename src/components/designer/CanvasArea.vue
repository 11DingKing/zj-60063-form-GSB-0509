<template>
  <div class="canvas-area">
    <div class="canvas-area__header">
      <h3 class="canvas-area__title">表单画布</h3>
    </div>

    <div
      class="canvas-area__content"
      :class="{ 'canvas-area__content--drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <template v-if="!fields || fields.length === 0">
        <div class="canvas-area__empty">
          <svg
            class="canvas-area__empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <p class="canvas-area__empty-text">从左侧组件库拖拽字段到此处</p>
        </div>
      </template>

      <template v-else>
        <div class="canvas-area__fields">
          <template v-for="(field, index) in fields" :key="field.id">
            <FieldWrapper
              :field="field"
              :index="index"
              :is-selected="selectedFieldId === field.id"
              @select="(id: string) => emit('select-field', id)"
              @drag-start="handleFieldDragStart(field, index)"
              @drag-over="handleFieldDragOver(index)"
              @drop="handleFieldDrop"
              @remove="(id: string) => emit('delete-field', id)"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field, FormConfig } from '@/types'
import FieldWrapper from './FieldWrapper.vue'

  interface Props {
    formConfig?: FormConfig | null
    selectedFieldId?: string | null
  }

const props = withDefaults(defineProps<Props>(), {
  formConfig: null,
  selectedFieldId: null,
})

const emit = defineEmits<{
    'add-field': [field: Field, targetIndex?: number, parentId?: string]
    'select-field': [fieldId: string]
    'delete-field': [fieldId: string]
    'move-field': [fieldId: string, targetIndex: number, parentId?: string]
  }>()

const fields = computed<Field[]>(() => {
  return props.formConfig?.fields || []
})

const isDragOver = ref(false)
const dragFieldIndex = ref<number | null>(null)
const dropFieldIndex = ref<number | null>(null)

function handleDragOver() {
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false

  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  try {
    const field = JSON.parse(data) as Field
    if (field.id && field.type) {
      emit('add-field', field)
    }
  } catch (e) {
    console.error('Failed to parse drag data:', e)
  }
}

function handleFieldDragStart(field: Field, index: number) {
  dragFieldIndex.value = index
}

function handleFieldDragOver(index: number) {
  dropFieldIndex.value = index
}

function handleFieldDrop() {
  if (
    dragFieldIndex.value !== null &&
      dropFieldIndex.value !== null &&
      dragFieldIndex.value !== dropFieldIndex.value
  ) {
    const fields = props.formConfig?.fields || []
    const fieldId = fields[dragFieldIndex.value]?.id
    if (fieldId) {
      emit('move-field', fieldId, dropFieldIndex.value)
    }
  }
  dragFieldIndex.value = null
  dropFieldIndex.value = null
}
</script>

<style scoped>
  .canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);
    overflow: hidden;
  }

  .canvas-area__header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border-light);
    background-color: var(--color-background-white);
    flex-shrink: 0;
  }

  .canvas-area__title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .canvas-area__content {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
    transition: background-color var(--transition-fast);
  }

  .canvas-area__content--drag-over {
    background-color: var(--color-primary-light);
    border: 2px dashed var(--color-primary);
    border-radius: var(--radius-md);
    margin: var(--spacing-lg);
  }

  .canvas-area__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: var(--color-text-secondary);
  }

  .canvas-area__empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .canvas-area__empty-text {
    font-size: var(--font-size-base);
    margin: 0;
  }

  .canvas-area__fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    max-width: 800px;
    margin: 0 auto;
  }
</style>
