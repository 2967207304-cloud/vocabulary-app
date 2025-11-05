<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="logo">📚 背单词</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">今日学习</router-link>
          <router-link to="/words" class="nav-link">单词库</router-link>
          <router-link to="/import" class="nav-link">批量导入</router-link>
          <router-link to="/review" class="nav-link">学习计划</router-link>
          <router-link to="/statistics" class="nav-link">学习统计</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 主应用组件
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link.router-link-active {
  color: #667eea;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>

