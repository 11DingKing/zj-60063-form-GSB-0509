export type FieldType = 
  | 'input'
  | 'textarea'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'time'
  | 'file'
  | 'rate'
  | 'switch'
  | 'cascader'
  | 'signature'
  | 'divider'
  | 'group'

export interface ValidationRule {
  type: 'required' | 'regex' | 'maxLength' | 'minLength' | 'min' | 'max' | 'pattern'
  value?: string | number
  message?: string
}

export interface DisplayCondition {
  triggerFieldId: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  conditionValue: string | number
}

export interface FieldOption {
  label: string
  value: string | number
}

export interface BaseField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  defaultValue?: any
  required?: boolean
  readonly?: boolean
  validationRules?: ValidationRule[]
  displayCondition?: DisplayCondition
  step?: number
}

export interface InputField extends BaseField {
  type: 'input'
  maxLength?: number
}

export interface TextareaField extends BaseField {
  type: 'textarea'
  maxLength?: number
  rows?: number
}

export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface RadioField extends BaseField {
  type: 'radio'
  options: FieldOption[]
}

export interface CheckboxField extends BaseField {
  type: 'checkbox'
  options: FieldOption[]
}

export interface SelectField extends BaseField {
  type: 'select'
  options: FieldOption[]
  multiple?: boolean
}

export interface DateField extends BaseField {
  type: 'date'
  format?: string
}

export interface TimeField extends BaseField {
  type: 'time'
  format?: string
}

export interface FileField extends BaseField {
  type: 'file'
  accept?: string
  multiple?: boolean
}

export interface RateField extends BaseField {
  type: 'rate'
  max?: number
  allowHalf?: boolean
}

export interface SwitchField extends BaseField {
  type: 'switch'
  activeText?: string
  inactiveText?: string
}

export interface CascaderField extends BaseField {
  type: 'cascader'
  options: CascaderOption[]
}

export interface CascaderOption {
  label: string
  value: string | number
  children?: CascaderOption[]
}

export interface SignatureField extends BaseField {
  type: 'signature'
  width?: number
  height?: number
}

export interface DividerField extends BaseField {
  type: 'divider'
  text?: string
}

export interface GroupField extends BaseField {
  type: 'group'
  children: Field[]
  collapsed?: boolean
}

export type Field = 
  | InputField
  | TextareaField
  | NumberField
  | RadioField
  | CheckboxField
  | SelectField
  | DateField
  | TimeField
  | FileField
  | RateField
  | SwitchField
  | CascaderField
  | SignatureField
  | DividerField
  | GroupField

export interface StepConfig {
  id: string
  title: string
}

export interface FormConfig {
  id: string
  title: string
  description?: string
  submitButtonText: string
  allowDraft: boolean
  submitMessage: string
  steps: StepConfig[]
  fields: Field[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SubmissionRecord {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  config: Omit<FormConfig, 'id' | 'createdAt' | 'updatedAt'>
}

export interface ConditionalLogic {
  id: string
  triggerFieldId: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  conditionValue: string | number
  targetFieldId: string
  action: 'show' | 'hide'
}
