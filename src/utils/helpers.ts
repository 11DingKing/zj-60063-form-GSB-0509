export function generateId(): string {
  return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export function evaluateCondition(operator: string, fieldValue: any, conditionValue: any): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === conditionValue
    case 'notEquals':
      return fieldValue !== conditionValue
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue)
      }
      return String(fieldValue).includes(String(conditionValue))
    case 'greaterThan':
      return Number(fieldValue) > Number(conditionValue)
    case 'lessThan':
      return Number(fieldValue) < Number(conditionValue)
    default:
      return true
  }
}

export function validateField(value: any, rules: any[]): { valid: boolean; message?: string } {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (
        value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
      ) {
          return { valid: false, message: rule.message || '此字段为必填项' }
        }
        break
      case 'maxLength':
        if (value && String(value).length > rule.value) {
          return { valid: false, message: rule.message || `长度不能超过 ${rule.value} 个字符` }
        }
        break
      case 'minLength':
        if (value && String(value).length < rule.value) {
          return { valid: false, message: rule.message || `长度不能少于 ${rule.value} 个字符` }
        }
        break
      case 'min':
        if (value !== undefined && value !== null && Number(value) < rule.value) {
          return { valid: false, message: rule.message || `数值不能小于 ${rule.value}` }
        }
        break
      case 'max':
        if (value !== undefined && value !== null && Number(value) > rule.value) {
          return { valid: false, message: rule.message || `数值不能大于 ${rule.value}` }
        }
        break
      case 'regex':
      case 'pattern':
        if (value && rule.value) {
          try {
            const regex = new RegExp(rule.value)
            if (!regex.test(String(value))) {
              return { valid: false, message: rule.message || '格式不正确' }
            }
          } catch {
            // 忽略无效的正则表达式
          }
        }
        break
    }
  }
  return { valid: true }
}

export function exportToCSV(data: any[], headers: { key: string; label: string }[]): string {
  const csvRows: string[] = []

  const headerRow = headers.map((h) => `"${h.label}"`).join(',')
  csvRows.push(headerRow)

  for (const row of data) {
    const values = headers.map((header) => {
      let value = row[header.key]
      if (value === undefined || value === null) {
        value = ''
      } else if (Array.isArray(value)) {
        value = value.join('; ')
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
