import { defineStore } from 'pinia'
import type { FormConfig, Field, SubmissionRecord, FormTemplate } from '@/types'
import { templates } from '@/utils/templates'
import { generateId } from '@/utils/helpers'

const STORAGE_KEY_FORMS = 'form-designer-forms'
const STORAGE_KEY_SUBMISSIONS = 'form-designer-submissions'
const STORAGE_KEY_DRAFT = 'form-designer-draft-'

interface FormState {
  currentFormId: string | null
  selectedFieldId: string | null
  forms: FormConfig[]
  submissions: SubmissionRecord[]
  isPreviewMode: boolean
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const useFormStore = defineStore('form', {
  state: (): FormState => ({
    currentFormId: null,
    selectedFieldId: null,
    forms: loadFromStorage<FormConfig[]>(STORAGE_KEY_FORMS, []),
    submissions: loadFromStorage<SubmissionRecord[]>(STORAGE_KEY_SUBMISSIONS, []),
    isPreviewMode: false,
  }),

  getters: {
    currentForm: (state): FormConfig | undefined => {
      return state.forms.find((f) => f.id === state.currentFormId)
    },

    currentFormFields: (state): Field[] => {
      const form = state.forms.find((f) => f.id === state.currentFormId)
      return form?.fields || []
    },

    selectedField: (state): Field | undefined => {
      if (!state.selectedFieldId) return undefined
      const form = state.forms.find((f) => f.id === state.currentFormId)
      if (!form) return undefined

      const findField = (fields: Field[]): Field | undefined => {
        for (const field of fields) {
          if (field.id === state.selectedFieldId) return field
          if (field.type === 'group') {
            const found = findField((field as any).children || [])
            if (found) return found
          }
        }
        return undefined
      }

      return findField(form.fields)
    },

    templates: (): FormTemplate[] => {
      return templates
    },

    getFormById:
      (state) =>
      (id: string): FormConfig | undefined => {
        return state.forms.find((f) => f.id === id)
      },

    getSubmissionsByFormId:
      (state) =>
      (formId: string): SubmissionRecord[] => {
        return state.submissions.filter((s) => s.formId === formId)
      },
  },

  actions: {
    createNewForm() {
      const now = new Date().toISOString()
      const newForm: FormConfig = {
        id: generateId(),
        title: '未命名表单',
        description: '',
        submitButtonText: '提交',
        allowDraft: false,
        submitMessage: '提交成功！',
        steps: [{ id: generateId(), title: '第一步' }],
        fields: [],
        isPublished: false,
        createdAt: now,
        updatedAt: now,
      }

      this.forms.push(newForm)
      this.currentFormId = newForm.id
      this.selectedFieldId = null
      this.saveForms()
      return newForm
    },

    loadForm(id: string) {
      const form = this.forms.find((f) => f.id === id)
      if (form) {
        this.currentFormId = id
        this.selectedFieldId = null
      }
      return form
    },

    saveCurrentForm() {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index !== -1) {
        this.forms[index].updatedAt = new Date().toISOString()
        this.saveForms()
      }
    },

    saveForm() {
      this.saveCurrentForm()
    },

    publishForm() {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index !== -1) {
        this.forms[index].isPublished = true
        this.forms[index].publishedAt = new Date().toISOString()
        this.forms[index].updatedAt = new Date().toISOString()
        this.saveForms()
      }
    },

    deleteForm(id: string) {
      const index = this.forms.findIndex((f) => f.id === id)
      if (index !== -1) {
        this.forms.splice(index, 1)
        if (this.currentFormId === id) {
          this.currentFormId = null
          this.selectedFieldId = null
        }
        this.submissions = this.submissions.filter((s) => s.formId !== id)
        this.saveForms()
        this.saveSubmissions()
      }
    },

    updateFormConfig(updates: Partial<FormConfig>) {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index !== -1) {
        this.forms[index] = {
          ...this.forms[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        this.saveForms()
      }
    },

    addField(field: Field, targetIndex?: number, parentGroupId?: string) {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index === -1) return

      if (parentGroupId) {
        const addToGroup = (fields: Field[]): boolean => {
          for (let i = 0; i < fields.length; i++) {
            const f = fields[i]
            if (f.type === 'group' && f.id === parentGroupId) {
              if (targetIndex !== undefined) {
                f.children.splice(targetIndex, 0, field)
              } else {
                f.children.push(field)
              }
              return true
            }
            if (f.type === 'group' && addToGroup(f.children)) {
              return true
            }
          }
          return false
        }
        addToGroup(this.forms[index].fields)
      } else {
        if (targetIndex !== undefined) {
          this.forms[index].fields.splice(targetIndex, 0, field)
        } else {
          this.forms[index].fields.push(field)
        }
      }

      this.selectedFieldId = field.id
      this.saveCurrentForm()
    },

    updateField(fieldId: string, updates: Partial<Field>) {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index === -1) return

      const updateInFields = (fields: Field[]): boolean => {
        for (let i = 0; i < fields.length; i++) {
          if (fields[i].id === fieldId) {
            fields[i] = { ...fields[i], ...updates } as Field
            return true
          }
          if (fields[i].type === 'group') {
            if (updateInFields((fields[i] as any).children)) {
              return true
            }
          }
        }
        return false
      }

      updateInFields(this.forms[index].fields)
      this.saveCurrentForm()
    },

    deleteField(fieldId: string) {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index === -1) return

      const deleteFromFields = (fields: Field[]): boolean => {
        const fieldIndex = fields.findIndex((f) => f.id === fieldId)
        if (fieldIndex !== -1) {
          fields.splice(fieldIndex, 1)
          return true
        }
        for (const field of fields) {
          if (field.type === 'group' && deleteFromFields((field as any).children)) {
            return true
          }
        }
        return false
      }

      deleteFromFields(this.forms[index].fields)

      if (this.selectedFieldId === fieldId) {
        this.selectedFieldId = null
      }

      this.saveCurrentForm()
    },

    moveField(fromIndex: number, toIndex: number, parentGroupId?: string) {
      if (!this.currentFormId) return

      const index = this.forms.findIndex((f) => f.id === this.currentFormId)
      if (index === -1) return

      if (parentGroupId) {
        const moveInGroup = (fields: Field[]): boolean => {
          for (const field of fields) {
            if (field.type === 'group' && field.id === parentGroupId) {
              const [removed] = field.children.splice(fromIndex, 1)
              field.children.splice(toIndex, 0, removed)
              return true
            }
            if (field.type === 'group' && moveInGroup((field as any).children)) {
              return true
            }
          }
          return false
        }
        moveInGroup(this.forms[index].fields)
      } else {
        const [removed] = this.forms[index].fields.splice(fromIndex, 1)
        this.forms[index].fields.splice(toIndex, 0, removed)
      }

      this.saveCurrentForm()
    },

    selectField(fieldId: string | null) {
      this.selectedFieldId = fieldId
    },

    loadTemplate(templateId: string) {
      const template = templates.find((t) => t.id === templateId)
      if (!template) return null

      const now = new Date().toISOString()
      const newForm: FormConfig = {
        id: generateId(),
        ...template.config,
        createdAt: now,
        updatedAt: now,
      }

      const reassignIds = (fields: Field[]): Field[] => {
        return fields.map((field) => {
          const newField = { ...field, id: generateId() }
          if (newField.type === 'group') {
            ;(newField as any).children = reassignIds((newField as any).children)
          }
          return newField
        })
      }

      newForm.fields = reassignIds(newForm.fields)
      newForm.steps = newForm.steps.map((step) => ({ ...step, id: generateId() }))

      this.forms.push(newForm)
      this.currentFormId = newForm.id
      this.selectedFieldId = null
      this.saveForms()

      return newForm
    },

    addSubmission(formId: string, data: Record<string, any>) {
      const submission: SubmissionRecord = {
        id: generateId(),
        formId,
        data,
        submittedAt: new Date().toISOString(),
      }

      this.submissions.push(submission)
      this.saveSubmissions()
      return submission
    },

    deleteSubmission(id: string) {
      const index = this.submissions.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.submissions.splice(index, 1)
        this.saveSubmissions()
      }
    },

    saveDraft(formId: string, data: Record<string, any>) {
      saveToStorage(STORAGE_KEY_DRAFT + formId, {
        data,
        savedAt: new Date().toISOString(),
      })
    },

    loadDraft(formId: string) {
      return loadFromStorage<any>(STORAGE_KEY_DRAFT + formId, null)
    },

    clearDraft(formId: string) {
      localStorage.removeItem(STORAGE_KEY_DRAFT + formId)
    },

    togglePreviewMode() {
      this.isPreviewMode = !this.isPreviewMode
    },

    saveForms() {
      saveToStorage(STORAGE_KEY_FORMS, this.forms)
    },

    saveSubmissions() {
      saveToStorage(STORAGE_KEY_SUBMISSIONS, this.submissions)
    },
  },
})
