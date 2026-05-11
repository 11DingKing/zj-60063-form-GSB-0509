<template>
  <FieldWrapper
    :label="field.label"
    :required="field.required"
    :hasError="hasError"
    :errorMessage="errorMessage"
  >
    <div
      class="signature-component"
      :class="{ 'signature-component--disabled': field.readonly || disabled }"
    >
      <div class="signature-canvas-wrapper">
        <canvas
          ref="canvasRef"
          :width="canvasWidth"
          :height="canvasHeight"
          class="signature-canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="stopDrawing"
        ></canvas>

        <div v-if="!modelValue && field.placeholder" class="signature-placeholder">
          {{ field.placeholder }}
        </div>
      </div>

      <div class="signature-actions">
        <button
          v-if="!field.readonly && !disabled"
          type="button"
          class="signature-btn"
          @click="clearCanvas"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
          清除
        </button>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { SignatureField as SignatureFieldType } from '@/types'
import { validateField } from '@/utils/helpers'
import FieldWrapper from './FieldWrapper.vue'

interface Props {
  field: SignatureFieldType
  modelValue?: string | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasError = ref(false)
const errorMessage = ref('')
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)

const canvasWidth = computed(() => props.field.width || 400)
const canvasHeight = computed(() => props.field.height || 150)

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvasContext.value = ctx

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (props.modelValue) {
    loadSignature(props.modelValue)
  }
}

function loadSignature(dataUrl: string) {
  const canvas = canvasRef.value
  const ctx = canvasContext.value
  if (!canvas || !ctx) return

  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvasWidth.value, canvasHeight.value)
  }
  img.src = dataUrl
}

function getPosition(event: MouseEvent | Touch) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvasWidth.value / rect.width
  const scaleY = canvasHeight.value / rect.height

  let clientX: number, clientY: number

  if ('touches' in event) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else {
    clientX = event.clientX
    clientY = event.clientY
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function startDrawing(event: MouseEvent) {
  if (props.field.readonly || props.disabled) return

  const pos = getPosition(event)
  isDrawing.value = true
  lastX.value = pos.x
  lastY.value = pos.y

  const ctx = canvasContext.value
  if (!ctx) return

  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function draw(event: MouseEvent) {
  if (!isDrawing.value || props.field.readonly || props.disabled) return

  const pos = getPosition(event)
  const ctx = canvasContext.value
  if (!ctx) return

  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()

  lastX.value = pos.x
  lastY.value = pos.y
}

function stopDrawing() {
  if (!isDrawing.value) return

  isDrawing.value = false
  saveSignature()
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault()
  const touch = event.touches[0]
  const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent
  startDrawing(mouseEvent)
}

function handleTouchMove(event: TouchEvent) {
  event.preventDefault()
  const touch = event.touches[0]
  const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent
  draw(mouseEvent)
}

function saveSignature() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dataUrl = canvas.toDataURL('image/png')
  emit('update:modelValue', dataUrl)
  emit('change', dataUrl)
  validate()
}

function clearCanvas() {
  const canvas = canvasRef.value
  const ctx = canvasContext.value
  if (!canvas || !ctx) return

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  emit('update:modelValue', null)
  emit('change', null)
  validate()
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

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadSignature(newValue)
    } else {
      clearCanvas()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
</script>

<style scoped>
.signature-component {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.signature-component--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.signature-canvas-wrapper {
  position: relative;
  display: inline-block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: white;
  cursor: crosshair;
  touch-action: none;
}

.signature-canvas {
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
}

.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  pointer-events: none;
  white-space: nowrap;
}

.signature-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.signature-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background-white);
  color: var(--color-text-regular);
  font-size: var(--font-size-xs);
  transition: all var(--transition-fast);
}

.signature-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.signature-btn svg {
  width: 14px;
  height: 14px;
}
</style>
