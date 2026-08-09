<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">🏓</span>
          <span class="logo-text">国乒荣耀榜</span>
        </router-link>
        <nav class="nav-links">
          <router-link to="/" class="nav-link">荣耀榜</router-link>
          <router-link to="/tournaments" class="nav-link">赛事</router-link>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="footer-content">
        <p>国乒荣耀榜 · 1988年至今 · 排名公式 v1.0</p>
        <p class="footer-note">数据来源：ITTF、中国乒乓球协会、WTT官方数据</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #d4142a 0%, #b80f22 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(212, 20, 42, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.logo-icon {
  font-size: 24px;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255,255,255,0.15);
  color: white;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: calc(100vh - 56px - 60px);
}

.app-footer {
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  padding: 16px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-content p {
  margin: 4px 0;
  color: #999;
  font-size: 12px;
}

.footer-note {
  font-size: 11px !important;
  color: #bbb !important;
}
</style>
