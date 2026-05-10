<template>
  <div class="component-panel">
    <div class="component-panel__header">
      <h3 class="component-panel__title">组件库</h3>
    </div>

    <div class="component-panel__sections">
      <div class="component-panel__section">
        <h4 class="component-panel__section-title">基础字段</h4>
        <div class="component-panel__items">
          <div
            v-for="component in basicComponents"
            :key="component.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
          >
            <div class="component-item__icon">
              <component :is="component.icon" />
            </div>
            <span class="component-item__label">{{ component.label }}</span>
          </div>
        </div>
      </div>

      <div class="component-panel__section">
        <h4 class="component-panel__section-title">高级字段</h4>
        <div class="component-panel__items">
          <div
            v-for="component in advancedComponents"
            :key="component.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
          >
            <div class="component-item__icon">
              <component :is="component.icon" />
            </div>
            <span class="component-item__label">{{ component.label }}</span>
          </div>
        </div>
      </div>

      <div class="component-panel__section">
        <h4 class="component-panel__section-title">布局组件</h4>
        <div class="component-panel__items">
          <div
            v-for="component in layoutComponents"
            :key="component.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
          >
            <div class="component-item__icon">
              <component :is="component.icon" />
            </div>
            <span class="component-item__label">{{ component.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { FieldType } from '@/types'
import { generateId } from '@/utils/helpers'

  interface ComponentConfig {
    type: FieldType
    label: string
    icon: any
    defaultConfig: Partial<any>
  }

const InputIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '5', width: '18', height: '14', rx: '2', ry: '2' }),
    h('line', { x1: '7', y1: '12', x2: '17', y2: '12' }),
  ])

const TextareaIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('line', { x1: '7', y1: '7', x2: '17', y2: '7' }),
    h('line', { x1: '7', y1: '11', x2: '17', y2: '11' }),
    h('line', { x1: '7', y1: '15', x2: '13', y2: '15' }),
  ])

const NumberIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('text', { x: '12', y: '17', 'text-anchor': 'middle', 'font-size': '10' }, '123'),
  ])

const RadioIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('circle', { cx: '12', cy: '12', r: '3', fill: 'currentColor' }),
  ])

const CheckboxIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('polyline', { points: '9 12 11 14 15 10' }),
  ])

const SelectIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '5', width: '18', height: '14', rx: '2', ry: '2' }),
    h('polyline', { points: '8 10 12 14 16 10' }),
  ])

const DateIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
  ])

const TimeIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('polyline', { points: '12 6 12 12 16 14' }),
  ])

const FileIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
    h('polyline', { points: '10 9 9 9 8 9' }),
  ])

const RateIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('polygon', {
      points:
          '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      fill: 'currentColor',
    }),
  ])

const SwitchIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', {
      x: '1',
      y: '5',
      width: '22',
      height: '14',
      rx: '7',
      ry: '7',
      fill: 'var(--color-primary)',
    }),
    h('circle', { cx: '17', cy: '12', r: '5', fill: 'white' }),
  ])

const CascaderIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M3 3h7v7H3V3z' }),
    h('path', { d: 'M14 3h7v7h-7V3z' }),
    h('path', { d: 'M14 14h7v7h-7v-7z' }),
    h('path', { d: 'M3 14h7v7H3v-7z' }),
    h('line', { x1: '10', y1: '6.5', x2: '14', y2: '6.5' }),
    h('line', { x1: '6.5', y1: '10', x2: '6.5', y2: '14' }),
  ])

const SignatureIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' }),
    h('line', { x1: '15', y1: '5', x2: '19', y2: '9' }),
  ])

const DividerIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
    h('circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }),
  ])

const GroupIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('line', { x1: '3', y1: '9', x2: '21', y2: '9' }),
    h('line', { x1: '9', y1: '21', x2: '9', y2: '9' }),
  ])

const basicComponents: ComponentConfig[] = [
  {
    type: 'input',
    label: '单行文本',
    icon: InputIcon,
    defaultConfig: { label: '单行文本', placeholder: '请输入内容' },
  },
  {
    type: 'textarea',
    label: '多行文本',
    icon: TextareaIcon,
    defaultConfig: { label: '多行文本', placeholder: '请输入内容', rows: 4 },
  },
  {
    type: 'number',
    label: '数字输入',
    icon: NumberIcon,
    defaultConfig: { label: '数字输入', placeholder: '请输入数字' },
  },
  {
    type: 'radio',
    label: '单选框组',
    icon: RadioIcon,
    defaultConfig: {
      label: '单选框组',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
  },
  {
    type: 'checkbox',
    label: '多选框组',
    icon: CheckboxIcon,
    defaultConfig: {
      label: '多选框组',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
  },
  {
    type: 'select',
    label: '下拉选择',
    icon: SelectIcon,
    defaultConfig: {
      label: '下拉选择',
      placeholder: '请选择',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
  },
]

const advancedComponents: ComponentConfig[] = [
  {
    type: 'date',
    label: '日期选择',
    icon: DateIcon,
    defaultConfig: { label: '日期选择' },
  },
  {
    type: 'time',
    label: '时间选择',
    icon: TimeIcon,
    defaultConfig: { label: '时间选择' },
  },
  {
    type: 'file',
    label: '文件上传',
    icon: FileIcon,
    defaultConfig: { label: '文件上传', placeholder: '点击上传文件' },
  },
  {
    type: 'rate',
    label: '评分',
    icon: RateIcon,
    defaultConfig: { label: '评分', max: 5 },
  },
  {
    type: 'switch',
    label: '开关',
    icon: SwitchIcon,
    defaultConfig: { label: '开关' },
  },
  {
    type: 'cascader',
    label: '级联选择',
    icon: CascaderIcon,
    defaultConfig: {
      label: '级联选择',
      placeholder: '请选择',
      options: [
        {
          label: '选项1',
          value: 'option1',
          children: [
            { label: '子选项1-1', value: 'option1-1' },
            { label: '子选项1-2', value: 'option1-2' },
          ],
        },
        {
          label: '选项2',
          value: 'option2',
          children: [
            { label: '子选项2-1', value: 'option2-1' },
            { label: '子选项2-2', value: 'option2-2' },
          ],
        },
      ],
    },
  },
  {
    type: 'signature',
    label: '签名板',
    icon: SignatureIcon,
    defaultConfig: { label: '签名板', placeholder: '请在此签名', width: 400, height: 150 },
  },
]

const layoutComponents: ComponentConfig[] = [
  {
    type: 'divider',
    label: '分割线',
    icon: DividerIcon,
    defaultConfig: { label: '分割线', text: '' },
  },
  {
    type: 'group',
    label: '分组容器',
    icon: GroupIcon,
    defaultConfig: { label: '分组容器', children: [], collapsed: false },
  },
]

const emit = defineEmits<{
    'drag-start': [event: DragEvent, component: ComponentConfig & { id: string }]
  }>()

function handleDragStart(event: DragEvent, component: ComponentConfig) {
  const fieldData = {
    id: generateId(),
    type: component.type,
    label: component.defaultConfig.label,
    required: false,
    readonly: false,
    step: 0,
    ...component.defaultConfig,
  }

  event.dataTransfer?.setData('application/json', JSON.stringify(fieldData))
    event.dataTransfer!.effectAllowed = 'copy'

    emit('drag-start', event, { ...component, id: fieldData.id })
}
</script>

<style scoped>
  .component-panel {
    width: 260px;
    height: 100%;
    background-color: var(--color-background-white);
    border-right: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .component-panel__header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border-light);
    flex-shrink: 0;
  }

  .component-panel__title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .component-panel__sections {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  .component-panel__section {
    margin-bottom: var(--spacing-xl);
  }

  .component-panel__section:last-child {
    margin-bottom: 0;
  }

  .component-panel__section-title {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 var(--spacing-md) 0;
  }

  .component-panel__items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    background-color: var(--color-background);
    cursor: grab;
    transition: all var(--transition-fast);
    user-select: none;
  }

  .component-item:hover {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--color-shadow);
  }

  .component-item:active {
    cursor: grabbing;
  }

  .component-item__icon {
    width: 32px;
    height: 32px;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .component-item__label {
    font-size: var(--font-size-xs);
    color: var(--color-text-regular);
    text-align: center;
  }
</style>
