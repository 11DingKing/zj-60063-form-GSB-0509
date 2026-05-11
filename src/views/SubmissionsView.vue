<template>
  <div class="submissions-view">
    <div class="submissions-view__header">
      <div class="submissions-view__header-left">
        <button class="submissions-view__btn submissions-view__btn--ghost" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div class="submissions-view__title-group">
          <h1 class="submissions-view__title">{{ formTitle || '提交记录' }}</h1>
          <span class="submissions-view__count">共 {{ submissions.length }} 条记录</span>
        </div>
      </div>

      <div class="submissions-view__header-right">
        <button
          class="submissions-view__btn submissions-view__btn--secondary"
          @click="handleExportToCSV"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导出 CSV
        </button>
      </div>
    </div>

    <div class="submissions-view__filters">
      <div class="submissions-view__filter-group">
        <label class="submissions-view__filter-label">筛选字段</label>
        <select v-model="selectedFilterField" class="submissions-view__filter-select">
          <option value="">全部字段</option>
          <option v-for="field in filterableFields" :key="field.id" :value="field.id">
            {{ field.label }}
          </option>
        </select>
      </div>

      <div class="submissions-view__filter-group">
        <label class="submissions-view__filter-label">搜索关键词</label>
        <input
          v-model="searchKeyword"
          type="text"
          class="submissions-view__filter-input"
          placeholder="输入关键词搜索..."
        />
      </div>

      <div class="submissions-view__filter-group submissions-view__filter-group--actions">
        <button
          class="submissions-view__btn submissions-view__btn--secondary"
          @click="clearFilters"
        >
          重置
        </button>
      </div>
    </div>

    <div class="submissions-view__table-wrapper">
      <table v-if="filteredSubmissions.length > 0" class="submissions-table">
        <thead>
          <tr>
            <th
              v-for="column in tableColumns"
              :key="column.id"
              class="submissions-table__header"
              @click="toggleSort(column.id)"
            >
              <div class="submissions-table__header-content">
                <span>{{ column.label }}</span>
                <span
                  class="submissions-table__sort-icon"
                  :class="{
                    'submissions-table__sort-icon--active': sortField === column.id,
                  }"
                >
                  <svg
                    v-if="sortField === column.id && sortDirection === 'asc'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  <svg
                    v-else-if="sortField === column.id && sortDirection === 'desc'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="7 15 12 10 17 15" />
                    <polyline points="7 10 12 5 17 10" />
                  </svg>
                </span>
              </div>
            </th>
            <th class="submissions-table__header submissions-table__header--actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(submission, index) in paginatedSubmissions"
            :key="submission.id"
            class="submissions-table__row"
            :class="{ 'submissions-table__row--even': index % 2 === 1 }"
          >
            <td v-for="column in tableColumns" :key="column.id" class="submissions-table__cell">
              <template v-if="column.id === '_index'">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </template>
              <template v-else-if="column.id === '_submittedAt'">
                {{ formatDate(submission.submittedAt) }}
              </template>
              <template v-else>
                {{ formatCellValue(submission.data[column.id]) }}
              </template>
            </td>
            <td class="submissions-table__cell submissions-table__cell--actions">
              <button class="submissions-table__action-btn" @click="viewSubmission(submission)">
                查看详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="submissions-view__empty">
        <div class="submissions-view__empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p class="submissions-view__empty-text">暂无提交记录</p>
      </div>
    </div>

    <div v-if="totalPages > 1" class="submissions-view__pagination">
      <button
        class="submissions-view__page-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </button>
      <div class="submissions-view__page-numbers">
        <template v-for="page in visiblePageNumbers" :key="page">
          <button
            v-if="page !== '...'"
            class="submissions-view__page-btn"
            :class="{ 'submissions-view__page-btn--active': page === currentPage }"
            @click="currentPage = page as number"
          >
            {{ page }}
          </button>
          <span v-else class="submissions-view__page-ellipsis">...</span>
        </template>
      </div>
      <button
        class="submissions-view__page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="submissions-view__modal-overlay"
        @click.self="showDetailModal = false"
      >
        <div class="submissions-view__modal submissions-view__modal--detail">
          <div class="submissions-view__modal-header">
            <h3 class="submissions-view__modal-title">提交详情</h3>
            <button class="submissions-view__modal-close" @click="showDetailModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="submissions-view__modal-body">
            <div class="submission-detail">
              <div class="submission-detail__meta">
                <p>
                  <span class="submission-detail__label">提交时间：</span>
                  <span>{{ formatDate(selectedSubmission?.submittedAt) }}</span>
                </p>
              </div>
              <div class="submission-detail__divider"></div>
              <div class="submission-detail__fields">
                <div v-for="field in formFields" :key="field.id" class="submission-detail__field">
                  <div class="submission-detail__field-label">
                    {{ field.label }}
                    <span v-if="field.required" class="submission-detail__field-required">*</span>
                  </div>
                  <div class="submission-detail__field-value">
                    <template
                      v-if="field.type === 'signature' && selectedSubmission?.data[field.id]"
                    >
                      <img
                        :src="selectedSubmission?.data[field.id]"
                        alt="签名"
                        class="submission-detail__signature"
                      />
                    </template>
                    <template
                      v-else-if="field.type === 'file' && selectedSubmission?.data[field.id]"
                    >
                      <template v-if="Array.isArray(selectedSubmission?.data[field.id])">
                        <div class="submission-detail__files">
                          <template
                            v-for="(file, index) in selectedSubmission?.data[field.id]"
                            :key="index"
                          >
                            <a
                              :href="file.base64"
                              :download="file.name"
                              class="submission-detail__file-link"
                            >
                              {{ file.name }}
                            </a>
                          </template>
                        </div>
                      </template>
                      <template v-else>
                        <a
                          :href="selectedSubmission?.data[field.id].base64"
                          :download="selectedSubmission?.data[field.id].name"
                          class="submission-detail__file-link"
                        >
                          {{ selectedSubmission?.data[field.id].name }}
                        </a>
                      </template>
                    </template>
                    <template v-else>
                      {{ formatCellValue(selectedSubmission?.data[field.id]) }}
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormStore } from '@/store'
import type { Field, SubmissionRecord } from '@/types'
import { exportToCSV, downloadCSV } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()

const formTitle = ref('')
const formFields = ref<Field[]>([])
const submissions = ref<SubmissionRecord[]>([])

const selectedFilterField = ref('')
const searchKeyword = ref('')
const sortField = ref('_submittedAt')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = ref(10)

const showDetailModal = ref(false)
const selectedSubmission = ref<SubmissionRecord | null>(null)

const filterableFields = computed(() => {
  return formFields.value.filter((f) => f.type !== 'divider' && f.type !== 'group')
})

const tableColumns = computed(() => {
  const columns: { id: string; label: string }[] = [{ id: '_index', label: '序号' }]

  formFields.value.forEach((field) => {
    if (field.type !== 'divider' && field.type !== 'group') {
      columns.push({ id: field.id, label: field.label })
    }
  })

  columns.push({ id: '_submittedAt', label: '提交时间' })

  return columns
})

const filteredSubmissions = computed(() => {
  let result = [...submissions.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((submission) => {
      if (!selectedFilterField.value) {
        return Object.values(submission.data).some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
      }
      return String(submission.data[selectedFilterField.value] || '')
        .toLowerCase()
        .includes(keyword)
    })
  }

  result.sort((a, b) => {
    let aVal: any, bVal: any

    if (sortField.value === '_submittedAt') {
      aVal = new Date(a.submittedAt).getTime()
      bVal = new Date(b.submittedAt).getTime()
    } else {
      aVal = a.data[sortField.value] ?? ''
      bVal = b.data[sortField.value] ?? ''
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
    }

    const comparison = String(aVal).localeCompare(String(bVal), 'zh-CN')
    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredSubmissions.value.length / pageSize.value) || 1
})

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSubmissions.value.slice(start, end)
})

const visiblePageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total)
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
})

function toggleSort(fieldId: string) {
  if (sortField.value === fieldId) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = fieldId
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function goBack() {
  router.push('/')
}

function clearFilters() {
  selectedFilterField.value = ''
  searchKeyword.value = ''
  sortField.value = '_submittedAt'
  sortDirection.value = 'desc'
  currentPage.value = 1
}

function formatDate(dateStr: string | number | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatCellValue(value: any): string {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.map((v) => formatCellValue(v)).join(', ')
  }

  if (typeof value === 'object') {
    if (value.base64 && value.name) {
      return value.name
    }
    if (value.label && value.value) {
      return value.label
    }
    return JSON.stringify(value)
  }

  return String(value)
}

function viewSubmission(submission: SubmissionRecord) {
  selectedSubmission.value = submission
  showDetailModal.value = true
}

function handleExportToCSV() {
  if (filteredSubmissions.value.length === 0) {
    alert('没有数据可导出')
    return
  }

  const headers = tableColumns.value.map((c) => c.label)

  const data = filteredSubmissions.value.map((submission, index) => {
    const row: any[] = [index + 1]
    formFields.value.forEach((field) => {
      if (field.type !== 'divider' && field.type !== 'group') {
        row.push(formatCellValue(submission.data[field.id]))
      }
    })
    row.push(formatDate(submission.submittedAt))
    return row
  })

  const csvContent = exportToCSV(headers, data)
  downloadCSV(csvContent, `${formTitle.value || '提交记录'}_${Date.now()}.csv`)
}

onMounted(() => {
  const formId = route.params.formId as string
  if (formId) {
    const form = formStore.forms.find((f) => f.id === formId)
    if (form) {
      formTitle.value = form.title
      formFields.value = form.fields
      submissions.value = formStore.getSubmissions(formId)
    }
  }
})
</script>

<style scoped>
.submissions-view {
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}

.submissions-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-background-white);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: 0 1px 4px var(--color-shadow);
}

.submissions-view__header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.submissions-view__btn {
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

.submissions-view__btn svg {
  width: 16px;
  height: 16px;
}

.submissions-view__btn--primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.submissions-view__btn--primary:hover {
  background-color: var(--color-primary-dark);
}

.submissions-view__btn--secondary {
  background-color: var(--color-background-white);
  color: var(--color-text-regular);
  border: 1px solid var(--color-border);
}

.submissions-view__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.submissions-view__btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: none;
}

.submissions-view__btn--ghost:hover {
  background-color: var(--color-background);
  color: var(--color-primary);
}

.submissions-view__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submissions-view__title-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.submissions-view__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.submissions-view__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 2px var(--spacing-sm);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
}

.submissions-view__header-right {
  display: flex;
  gap: var(--spacing-sm);
}

.submissions-view__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-background-white);
  border-bottom: 1px solid var(--color-border-light);
}

.submissions-view__filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.submissions-view__filter-group--actions {
  justify-content: flex-end;
}

.submissions-view__filter-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.submissions-view__filter-select,
.submissions-view__filter-input {
  min-width: 180px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.submissions-view__filter-select:focus,
.submissions-view__filter-input:focus {
  border-color: var(--color-primary);
}

.submissions-view__table-wrapper {
  flex: 1;
  padding: var(--spacing-lg);
  overflow: auto;
}

.submissions-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-background-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px var(--color-shadow);
  overflow: hidden;
}

.submissions-table__header {
  background-color: var(--color-background);
  padding: var(--spacing-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-regular);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast);
}

.submissions-table__header:hover {
  background-color: var(--color-primary-light);
}

.submissions-table__header--actions {
  width: 120px;
  cursor: default;
}

.submissions-table__header--actions:hover {
  background-color: var(--color-background);
}

.submissions-table__header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.submissions-table__sort-icon {
  color: var(--color-border);
  transition: color var(--transition-fast);
}

.submissions-table__sort-icon svg {
  width: 14px;
  height: 14px;
}

.submissions-table__sort-icon--active {
  color: var(--color-primary);
}

.submissions-table__row {
  transition: background-color var(--transition-fast);
}

.submissions-table__row:hover {
  background-color: var(--color-primary-light);
}

.submissions-table__row--even {
  background-color: var(--color-background);
}

.submissions-table__row--even:hover {
  background-color: var(--color-primary-light);
}

.submissions-table__cell {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  vertical-align: middle;
}

.submissions-table__cell--actions {
  text-align: center;
}

.submissions-table__action-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.submissions-table__action-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

.submissions-view__empty {
  text-align: center;
  padding: var(--spacing-3xl);
}

.submissions-view__empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-border);
}

.submissions-view__empty-icon svg {
  width: 100%;
  height: 100%;
}

.submissions-view__empty-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.submissions-view__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-background-white);
  border-top: 1px solid var(--color-border-light);
}

.submissions-view__page-numbers {
  display: flex;
  gap: var(--spacing-xs);
}

.submissions-view__page-btn {
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-background-white);
  color: var(--color-text-regular);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.submissions-view__page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.submissions-view__page-btn--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.submissions-view__page-ellipsis {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  color: var(--color-text-secondary);
}

.submissions-view__modal-overlay {
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

.submissions-view__modal {
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

.submissions-view__modal--detail {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
}

.submissions-view__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.submissions-view__modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.submissions-view__modal-close {
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

.submissions-view__modal-close svg {
  width: 20px;
  height: 20px;
}

.submissions-view__modal-close:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.submissions-view__modal-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-xl);
}

.submission-detail {
  font-size: var(--font-size-sm);
}

.submission-detail__meta {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.submission-detail__meta p {
  margin: 0;
  color: var(--color-text-regular);
}

.submission-detail__label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.submission-detail__divider {
  height: 1px;
  background-color: var(--color-border-light);
  margin: var(--spacing-md) 0;
}

.submission-detail__field {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.submission-detail__field:last-child {
  border-bottom: none;
}

.submission-detail__field-label {
  width: 120px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.submission-detail__field-required {
  color: var(--color-danger);
  margin-left: 2px;
}

.submission-detail__field-value {
  flex: 1;
  color: var(--color-text-primary);
  word-break: break-all;
}

.submission-detail__signature {
  max-width: 200px;
  max-height: 100px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.submission-detail__files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.submission-detail__file-link {
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
}

.submission-detail__file-link:hover {
  text-decoration: underline;
}
</style>
