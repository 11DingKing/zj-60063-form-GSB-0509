<template>
  <div class="property-panel">
    <div class="property-panel__header">
      <h3 class="property-panel__title">属性配置</h3>
    </div>

    <div class="property-panel__content" v-if="selectedField">
      <div class="property-section">
        <h4 class="property-section__title">基本属性</h4>

        <div class="property-item">
          <label class="property-item__label">字段标签</label>
          <input
            type="text"
            :value="selectedField.label"
            @input="updateField('label', $event)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="supportsPlaceholder">
          <label class="property-item__label">占位符</label>
          <input
            type="text"
            :value="selectedField.placeholder || ''"
            @input="updateField('placeholder', $event)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="supportsDefaultValue">
          <label class="property-item__label">默认值</label>
          <input
            type="text"
            :value="selectedField.defaultValue || ''"
            @input="updateField('defaultValue', $event)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'textarea'">
          <label class="property-item__label">行数</label>
          <input
            type="number"
            :value="(selectedField as any).rows || 4"
            @input="updateField('rows', $event, true)"
            class="property-item__input"
            min="1"
          />
        </div>

        <div
          class="property-item"
          v-if="selectedField.type === 'textarea' || selectedField.type === 'input'"
        >
          <label class="property-item__label">最大长度</label>
          <input
            type="number"
            :value="(selectedField as any).maxLength || ''"
            @input="updateField('maxLength', $event, true)"
            class="property-item__input"
            min="0"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'number'">
          <label class="property-item__label">最小值</label>
          <input
            type="number"
            :value="(selectedField as any).min ?? ''"
            @input="updateField('min', $event, true)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'number'">
          <label class="property-item__label">最大值</label>
          <input
            type="number"
            :value="(selectedField as any).max ?? ''"
            @input="updateField('max', $event, true)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'number'">
          <label class="property-item__label">步长</label>
          <input
            type="number"
            :value="(selectedField as any).step ?? 1"
            @input="updateField('step', $event, true)"
            class="property-item__input"
            step="0.01"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'rate'">
          <label class="property-item__label">最大分值</label>
          <input
            type="number"
            :value="(selectedField as any).max ?? 5"
            @input="updateField('max', $event, true)"
            class="property-item__input"
            min="1"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'file'">
          <label class="property-item__label">允许格式</label>
          <input
            type="text"
            :value="(selectedField as any).accept || ''"
            @input="updateField('accept', $event)"
            class="property-item__input"
            placeholder="如: image/*,.pdf"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'divider'">
          <label class="property-item__label">分割线文字</label>
          <input
            type="text"
            :value="(selectedField as any).text || ''"
            @input="updateField('text', $event)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'switch'">
          <label class="property-item__label">开启文字</label>
          <input
            type="text"
            :value="(selectedField as any).activeText || ''"
            @input="updateField('activeText', $event)"
            class="property-item__input"
          />
        </div>

        <div class="property-item" v-if="selectedField.type === 'switch'">
          <label class="property-item__label">关闭文字</label>
          <input
            type="text"
            :value="(selectedField as any).inactiveText || ''"
            @input="updateField('inactiveText', $event)"
            class="property-item__input"
          />
        </div>
      </div>

      <div class="property-section">
        <h4 class="property-section__title">状态设置</h4>

        <div class="property-item property-item--checkbox">
          <label class="property-item__checkbox-label">
            <input
              type="checkbox"
              :checked="selectedField.required"
              @change="toggleField('required')"
            />
            <span>必填字段</span>
          </label>
        </div>

        <div class="property-item property-item--checkbox">
          <label class="property-item__checkbox-label">
            <input
              type="checkbox"
              :checked="selectedField.readonly"
              @change="toggleField('readonly')"
            />
            <span>只读</span>
          </label>
        </div>

        <div class="property-item" v-if="currentForm && currentForm.steps.length > 1">
          <label class="property-item__label">所属步骤</label>
          <select
            :value="selectedField.step ?? 0"
            @change="updateStep($event)"
            class="property-item__select"
          >
            <option v-for="(step, index) in currentForm.steps" :key="step.id" :value="index">
              {{ step.title }}
            </option>
          </select>
        </div>
      </div>

      <div class="property-section" v-if="supportsOptions">
        <h4 class="property-section__title">选项设置</h4>

        <div class="property-options">
          <div v-for="(option, index) in fieldOptions" :key="index" class="property-option">
            <input
              type="text"
              :value="option.label"
              @input="updateOption(index, 'label', $event)"
              class="property-option__input"
              placeholder="显示文字"
            />
            <input
              type="text"
              :value="String(option.value)"
              @input="updateOption(index, 'value', $event)"
              class="property-option__input property-option__input--value"
              placeholder="值"
            />
            <button
              type="button"
              class="property-option__remove"
              @click="removeOption(index)"
              v-if="fieldOptions.length > 1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <button type="button" class="property-options__add" @click="addOption">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>添加选项</span>
        </button>
      </div>

      <div class="property-section">
        <h4 class="property-section__title">校验规则</h4>

        <div class="property-validation-rules">
          <div
            v-for="(rule, index) in validationRules"
            :key="index"
            class="property-validation-rule"
          >
            <select
              :value="rule.type"
              @change="updateRuleType(index, $event)"
              class="property-validation-rule__type"
            >
              <option value="maxLength">最大长度</option>
              <option value="minLength">最小长度</option>
              <option value="min">最小值</option>
              <option value="max">最大值</option>
              <option value="regex">正则表达式</option>
            </select>
            <input
              type="text"
              :value="String(rule.value ?? '')"
              @input="updateRuleValue(index, $event)"
              class="property-validation-rule__value"
              :placeholder="getRulePlaceholder(rule.type)"
            />
            <button
              type="button"
              class="property-validation-rule__remove"
              @click="removeRule(index)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <button type="button" class="property-validation-rules__add" @click="addRule">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>添加规则</span>
        </button>
      </div>

      <div class="property-section" v-if="allFields.length > 1">
        <h4 class="property-section__title">显示条件</h4>

        <div class="property-display-condition">
          <div class="property-item">
            <label class="property-item__label">触发字段</label>
            <select
              :value="selectedField.displayCondition?.triggerFieldId || ''"
              @change="updateDisplayCondition('triggerFieldId', $event)"
              class="property-item__select"
            >
              <option value="">无</option>
              <option v-for="field in otherFields" :key="field.id" :value="field.id">
                {{ field.label }}
              </option>
            </select>
          </div>

          <div class="property-item" v-if="selectedField.displayCondition?.triggerFieldId">
            <label class="property-item__label">条件</label>
            <select
              :value="selectedField.displayCondition?.operator || 'equals'"
              @change="updateDisplayCondition('operator', $event)"
              class="property-item__select"
            >
              <option value="equals">等于</option>
              <option value="notEquals">不等于</option>
              <option value="contains">包含</option>
              <option value="greaterThan">大于</option>
              <option value="lessThan">小于</option>
            </select>
          </div>

          <div class="property-item" v-if="selectedField.displayCondition?.triggerFieldId">
            <label class="property-item__label">条件值</label>
            <input
              type="text"
              :value="selectedField.displayCondition?.conditionValue ?? ''"
              @input="updateDisplayCondition('conditionValue', $event)"
              class="property-item__input"
              placeholder="输入条件值"
            />
          </div>

          <button
            type="button"
            class="property-display-condition__clear"
            v-if="selectedField.displayCondition?.triggerFieldId"
            @click="clearDisplayCondition"
          >
            清除条件
          </button>
        </div>
      </div>
    </div>

    <div class="property-panel__empty" v-else>
      <svg
        class="property-panel__empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <p class="property-panel__empty-text">请选择一个字段来配置属性</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormStore } from '@/store'
import type { Field, ValidationRule, DisplayCondition } from '@/types'
import { storeToRefs } from 'pinia'

const formStore = useFormStore()
const { selectedFieldId, currentForm, currentFormFields, selectedField } = storeToRefs(formStore)

function getAllFields(fields: Field[]): Field[] {
  let result: Field[] = []
  for (const field of fields) {
    result.push(field)
    if (field.type === 'group') {
      result = result.concat(getAllFields((field as any).children || []))
    }
  }
  return result
}

const allFields = computed(() => {
  return getAllFields(currentFormFields.value)
})

const otherFields = computed(() => {
  return allFields.value.filter((f) => f.id !== selectedFieldId.value)
})

const supportsPlaceholder = computed(() => {
  return ['input', 'textarea', 'number', 'select', 'cascader'].includes(
    selectedField.value?.type || ''
  )
})

const supportsDefaultValue = computed(() => {
  return ['input', 'textarea', 'number', 'rate', 'switch'].includes(selectedField.value?.type || '')
})

const supportsOptions = computed(() => {
  return ['radio', 'checkbox', 'select'].includes(selectedField.value?.type || '')
})

const fieldOptions = computed({
  get() {
    const field = selectedField.value
    if (!field) return []
    if (field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') {
      return (field as any).options || []
    }
    return []
  },
  set(value) {
    const field = selectedField.value
    if (!field) return
    if (field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') {
      formStore.updateField(field.id, { options: value } as Partial<Field>)
    }
  },
})

const validationRules = computed({
  get() {
    return selectedField.value?.validationRules || []
  },
  set(value) {
    const field = selectedField.value
    if (!field) return
    formStore.updateField(field.id, { validationRules: value })
  },
})

function updateField(key: string, event: Event, isNumber: boolean = false) {
  const field = selectedField.value
  if (!field) return

  const target = event.target as HTMLInputElement
  let value: any = target.value

  if (isNumber) {
    value = value === '' ? undefined : Number(value)
  }

  formStore.updateField(field.id, { [key]: value } as Partial<Field>)
}

function toggleField(key: string) {
  const field = selectedField.value
  if (!field) return

  const currentValue = (field as any)[key] || false
  formStore.updateField(field.id, { [key]: !currentValue } as Partial<Field>)
}

function updateStep(event: Event) {
  const field = selectedField.value
  if (!field) return

  const target = event.target as HTMLSelectElement
  const step = Number(target.value)
  formStore.updateField(field.id, { step })
}

function addOption() {
  const options = [...fieldOptions.value]
  const newIndex = options.length + 1
  options.push({ label: `选项${newIndex}`, value: `option${newIndex}` })
  fieldOptions.value = options
}

function removeOption(index: number) {
  const options = [...fieldOptions.value]
  options.splice(index, 1)
  fieldOptions.value = options
}

function updateOption(index: number, key: 'label' | 'value', event: Event) {
  const target = event.target as HTMLInputElement
  const options = [...fieldOptions.value]
  options[index] = { ...options[index], [key]: target.value }
  fieldOptions.value = options
}

function getRulePlaceholder(type: string): string {
  switch (type) {
    case 'maxLength':
    case 'minLength':
      return '输入数字'
    case 'min':
    case 'max':
      return '输入数值'
    case 'regex':
      return '输入正则表达式'
    default:
      return '输入值'
  }
}

function addRule() {
  const rules = [...validationRules.value]
  rules.push({ type: 'maxLength', value: '', message: '' })
  validationRules.value = rules
}

function removeRule(index: number) {
  const rules = [...validationRules.value]
  rules.splice(index, 1)
  validationRules.value = rules
}

function updateRuleType(index: number, event: Event) {
  const target = event.target as HTMLSelectElement
  const rules = [...validationRules.value]
  rules[index] = { ...rules[index], type: target.value as ValidationRule['type'] }
  validationRules.value = rules
}

function updateRuleValue(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const rules = [...validationRules.value]
  let value: string | number = target.value
  const type = rules[index].type
  if (['maxLength', 'minLength', 'min', 'max'].includes(type)) {
    value = value === '' ? 0 : Number(value)
  }
  rules[index] = { ...rules[index], value }
  validationRules.value = rules
}

function updateDisplayCondition(key: keyof DisplayCondition, event: Event) {
  const field = selectedField.value
  if (!field) return

  const target = event.target as HTMLInputElement | HTMLSelectElement
  let value: any = target.value

  if (
    key === 'conditionValue' &&
    ['greaterThan', 'lessThan'].includes(field.displayCondition?.operator || 'equals')
  ) {
    value = Number(value)
  }

  const currentCondition = field.displayCondition || {}
  const newCondition: DisplayCondition = {
    ...currentCondition,
    [key]: value,
  }

  formStore.updateField(field.id, { displayCondition: newCondition })
}

function clearDisplayCondition() {
  const field = selectedField.value
  if (!field) return
  formStore.updateField(field.id, { displayCondition: undefined })
}
</script>

<style scoped>
.property-panel {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  height: 100%;
  background-color: var(--color-background-white);
  border-left: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.property-panel__header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.property-panel__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.property-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  box-sizing: border-box;
}

.property-section {
  margin-bottom: var(--spacing-xl);
}

.property-section:last-child {
  margin-bottom: 0;
}

.property-section__title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 var(--spacing-md) 0;
}

.property-item {
  margin-bottom: var(--spacing-md);
}

.property-item:last-child {
  margin-bottom: 0;
}

.property-item__label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  margin-bottom: var(--spacing-xs);
}

.property-item__input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.property-item__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.property-item__select {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-background-white);
  cursor: pointer;
  box-sizing: border-box;
}

.property-item__select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.property-item--checkbox {
  display: flex;
  align-items: center;
}

.property-item__checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  cursor: pointer;
}

.property-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.property-option {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.property-option__input {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  box-sizing: border-box;
}

.property-option__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.property-option__input--value {
  flex: 0 0 60px;
  min-width: 60px;
}

.property-option__remove {
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

.property-option__remove:hover {
  color: var(--color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.property-option__remove svg {
  width: 14px;
  height: 14px;
}

.property-options__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.property-options__add:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.property-options__add svg {
  width: 14px;
  height: 14px;
}

.property-validation-rules {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.property-validation-rule {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.property-validation-rule__type {
  flex: 0 0 80px;
  min-width: 80px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  background-color: var(--color-background-white);
  box-sizing: border-box;
}

.property-validation-rule__value {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  box-sizing: border-box;
}

.property-validation-rule__remove {
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
}

.property-validation-rule__remove:hover {
  color: var(--color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.property-validation-rule__remove svg {
  width: 14px;
  height: 14px;
}

.property-validation-rules__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.property-validation-rules__add:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.property-validation-rules__add svg {
  width: 14px;
  height: 14px;
}

.property-display-condition__clear {
  display: block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background-white);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.property-display-condition__clear:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.property-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  padding: var(--spacing-xl);
  text-align: center;
}

.property-panel__empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.property-panel__empty-text {
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
