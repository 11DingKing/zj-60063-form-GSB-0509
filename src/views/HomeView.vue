<template>
  <div class="home-view">
    <header class="home-view__hero">
      <div class="home-view__hero-content">
        <div class="home-view__hero-text">
          <h1 class="home-view__title">动态表单设计器</h1>
          <p class="home-view__subtitle">可视化拖拽设计表单，快速发布收集数据</p>
          <div class="home-view__features">
            <div class="home-view__feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>拖拽设计</span>
            </div>
            <div class="home-view__feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>一键发布</span>
            </div>
            <div class="home-view__feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>数据管理</span>
            </div>
          </div>
        </div>
        <button class="home-view__create-btn" @click="createNewForm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建表单
        </button>
      </div>
    </header>

    <main class="home-view__main">
      <div class="home-view__section">
        <div class="home-view__section-header">
          <div class="home-view__section-title-group">
            <h2 class="home-view__section-title">我的表单</h2>
            <span class="home-view__section-count">{{ formStore.forms.length }} 个表单</span>
          </div>
        </div>

        <div v-if="formStore.forms.length === 0" class="home-view__empty">
          <div class="home-view__empty-illustration">
            <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="40"
                y="20"
                width="120"
                height="110"
                rx="8"
                stroke="currentColor"
                stroke-width="2"
                fill="white"
              />
              <rect
                x="50"
                y="35"
                width="100"
                height="12"
                rx="4"
                fill="currentColor"
                opacity="0.3"
              />
              <rect x="50" y="55" width="70" height="8" rx="2" fill="currentColor" opacity="0.2" />
              <rect
                x="50"
                y="70"
                width="100"
                height="8"
                rx="2"
                fill="currentColor"
                opacity="0.15"
              />
              <rect x="50" y="85" width="80" height="8" rx="2" fill="currentColor" opacity="0.15" />
              <rect
                x="50"
                y="100"
                width="100"
                height="8"
                rx="2"
                fill="currentColor"
                opacity="0.15"
              />
              <circle cx="100" cy="75" r="30" fill="currentColor" opacity="0.05" />
              <path
                d="M85 75h15m7.5 0h-7.5v-7.5M100 75v7.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
          <h3 class="home-view__empty-title">还没有创建任何表单</h3>
          <p class="home-view__empty-text">点击下方按钮或选择模板开始创建</p>
          <button class="home-view__empty-btn" @click="createNewForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            创建第一个表单
          </button>
        </div>

        <div v-else class="home-view__grid">
          <div v-for="form in formStore.forms" :key="form.id" class="form-card">
            <div class="form-card__top">
              <div
                class="form-card__icon"
                :class="{ 'form-card__icon--published': form.isPublished }"
              >
                <svg
                  v-if="form.isPublished"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div
                class="form-card__status-badge"
                :class="{ 'form-card__status-badge--published': form.isPublished }"
              >
                <span v-if="form.isPublished">已发布</span>
                <span v-else>草稿</span>
              </div>
            </div>

            <div class="form-card__body">
              <h3 class="form-card__title">{{ form.title || '未命名表单' }}</h3>
              <div class="form-card__meta">
                <div class="form-card__meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{{ form.fields.length }} 个字段</span>
                </div>
                <div class="form-card__meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{{ formatDate(form.updatedAt) }}</span>
                </div>
              </div>
            </div>

            <div class="form-card__actions">
              <button
                class="form-card__action-btn form-card__action-btn--primary"
                @click="editForm(form.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>编辑</span>
              </button>
              <button
                v-if="form.isPublished"
                class="form-card__action-btn form-card__action-btn--secondary"
                @click="viewSubmissions(form.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>数据</span>
              </button>
              <button
                class="form-card__action-btn form-card__action-btn--danger"
                @click="deleteForm(form.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="home-view__section">
        <div class="home-view__section-header">
          <div class="home-view__section-title-group">
            <h2 class="home-view__section-title">快速模板</h2>
            <span class="home-view__section-hint">选择模板快速开始</span>
          </div>
        </div>

        <div class="home-view__grid home-view__grid--templates">
          <div
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            @click="createFromTemplate(template)"
          >
            <div class="template-card__gradient" :style="getTemplateGradient(template.id)"></div>
            <div class="template-card__content">
              <div class="template-card__icon">
                <span>{{ template.name.charAt(0) }}</span>
              </div>
              <div class="template-card__text">
                <h3 class="template-card__name">{{ template.name }}</h3>
                <p class="template-card__description">{{ template.description }}</p>
              </div>
            </div>
            <div class="template-card__arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFormStore } from '@/store'
import { templates } from '@/utils/templates'
import type { FormTemplate } from '@/types'

const router = useRouter()
const formStore = useFormStore()

const templateGradients: Record<string, string> = {
  'leave-request': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'satisfaction-survey': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'event-registration': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
}

function getTemplateGradient(templateId: string): string {
  return (
    templateGradients[templateId] ||
      'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  }
  return date.toLocaleDateString('zh-CN')
}

function createNewForm() {
  formStore.createNewForm()
  router.push('/designer')
}

function createFromTemplate(template: FormTemplate) {
  formStore.loadTemplate(template.id)
  router.push('/designer')
}

function editForm(formId: string) {
  formStore.loadForm(formId)
  router.push(`/designer/${formId}`)
}

function viewSubmissions(formId: string) {
  router.push(`/submissions/${formId}`)
}

function deleteForm(formId: string) {
  if (confirm('确定要删除这个表单吗？所有提交数据也会被删除。')) {
    formStore.deleteForm(formId)
  }
}
</script>

<style scoped>
  .home-view {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .home-view__hero {
    background: linear-gradient(135deg, var(--color-primary) 0%, #4c1d95 100%);
    padding: var(--spacing-3xl) var(--spacing-xl);
    position: relative;
    overflow: hidden;
  }

  .home-view__hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  .home-view__hero::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  .home-view__hero-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .home-view__hero-text {
    flex: 1;
  }

  .home-view__title {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    color: white;
    margin: 0 0 var(--spacing-md) 0;
    letter-spacing: -0.5px;
  }

  .home-view__subtitle {
    font-size: var(--font-size-lg);
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 var(--spacing-xl) 0;
  }

  .home-view__features {
    display: flex;
    gap: var(--spacing-xl);
  }

  .home-view__feature {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  .home-view__feature svg {
    width: 20px;
    height: 20px;
  }

  .home-view__create-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg) var(--spacing-2xl);
    background-color: white;
    color: var(--color-primary);
    border: none;
    border-radius: var(--radius-xl);
    font-size: var(--font-size-lg);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .home-view__create-btn svg {
    width: 24px;
    height: 24px;
  }

  .home-view__create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }

  .home-view__main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-2xl) var(--spacing-xl);
  }

  .home-view__section {
    margin-bottom: var(--spacing-3xl);
  }

  .home-view__section:last-child {
    margin-bottom: 0;
  }

  .home-view__section-header {
    margin-bottom: var(--spacing-lg);
  }

  .home-view__section-title-group {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
  }

  .home-view__section-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .home-view__section-count,
  .home-view__section-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .home-view__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--spacing-lg);
  }

  .home-view__grid--templates {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1024px) {
    .home-view__grid--templates {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .home-view__grid--templates {
      grid-template-columns: 1fr;
    }
  }

  .home-view__empty {
    text-align: center;
    padding: var(--spacing-3xl);
    background-color: var(--color-background-white);
    border-radius: var(--radius-xl);
    border: 2px dashed var(--color-border);
  }

  .home-view__empty-illustration {
    width: 200px;
    height: 150px;
    margin: 0 auto var(--spacing-xl);
    color: var(--color-border);
  }

  .home-view__empty-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .home-view__empty-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-xl) 0;
  }

  .home-view__empty-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md) var(--spacing-xl);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .home-view__empty-btn svg {
    width: 18px;
    height: 18px;
  }

  .home-view__empty-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px var(--color-primary);
    opacity: 0.9;
  }

  .form-card {
    background-color: var(--color-background-white);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-light);
    overflow: hidden;
    transition: all var(--transition-fast);
    position: relative;
  }

  .form-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    transform: scaleX(0);
    transition: transform var(--transition-fast);
  }

  .form-card:hover {
    border-color: var(--color-primary-light);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }

  .form-card:hover::before {
    transform: scaleX(1);
  }

  .form-card__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--spacing-lg) var(--spacing-lg) 0;
  }

  .form-card__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .form-card__icon--published {
    background: linear-gradient(
      135deg,
      var(--color-success-light) 0%,
      rgba(16, 185, 129, 0.1) 100%
    );
    color: var(--color-success);
  }

  .form-card__icon svg {
    width: 24px;
    height: 24px;
  }

  .form-card__status-badge {
    padding: 4px var(--spacing-sm);
    background-color: var(--color-background);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .form-card__status-badge--published {
    background-color: var(--color-success-light);
    color: var(--color-success);
  }

  .form-card__body {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .form-card__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-md) 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .form-card__meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-card__meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .form-card__meta-item svg {
    width: 14px;
    height: 14px;
  }

  .form-card__actions {
    display: flex;
    border-top: 1px solid var(--color-border-light);
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }

  .form-card__action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
  }

  .form-card__action-btn svg {
    width: 16px;
    height: 16px;
  }

  .form-card__action-btn--primary {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  }

  .form-card__action-btn--primary:hover {
    background-color: var(--color-primary);
    color: white;
  }

  .form-card__action-btn--secondary {
    background-color: var(--color-background);
    color: var(--color-text-regular);
  }

  .form-card__action-btn--secondary:hover {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  }

  .form-card__action-btn--danger {
    background-color: transparent;
    color: var(--color-text-secondary);
  }

  .form-card__action-btn--danger:hover {
    background-color: var(--color-danger-light);
    color: var(--color-danger);
  }

  .template-card {
    position: relative;
    background-color: var(--color-background-white);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-light);
    padding: var(--spacing-xl);
    cursor: pointer;
    overflow: hidden;
    transition: all var(--transition-fast);
  }

  .template-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    transform: scaleX(0);
    transition: transform var(--transition-fast);
  }

  .template-card:hover {
    border-color: var(--color-primary-light);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    transform: translateY(-6px);
  }

  .template-card:hover::before {
    transform: scaleX(1);
  }

  .template-card:hover .template-card__arrow {
    transform: translateX(4px);
    opacity: 1;
  }

  .template-card__gradient {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    border-radius: 0 0 0 100%;
    opacity: 0.08;
    transition: opacity var(--transition-fast);
  }

  .template-card:hover .template-card__gradient {
    opacity: 0.15;
  }

  .template-card__content {
    position: relative;
    z-index: 1;
  }

  .template-card__icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-lg);
  }

  .template-card__icon span {
    font-size: var(--font-size-xl);
    font-weight: 800;
    color: white;
  }

  .template-card__text {
    margin-bottom: var(--spacing-md);
  }

  .template-card__name {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }

  .template-card__description {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .template-card__arrow {
    position: absolute;
    bottom: var(--spacing-xl);
    right: var(--spacing-xl);
    color: var(--color-primary);
    opacity: 0.6;
    transition: all var(--transition-fast);
  }

  .template-card__arrow svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    .home-view__hero-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xl);
    }

    .home-view__features {
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .home-view__title {
      font-size: var(--font-size-2xl);
    }

    .home-view__subtitle {
      font-size: var(--font-size-md);
    }
  }
</style>
