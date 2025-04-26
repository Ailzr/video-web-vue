<script setup lang="ts">
import { ref, onMounted } from "vue";

// Initialize theme state from localStorage
let isDarkMode = ref(false);

// Set up theme on component mount
onMounted(() => {
  if (localStorage.getItem('video-web-golang-theme') === "true") {
    isDarkMode.value = true;
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
  }
});

// Toggle between light and dark mode
const toggleMode = () => {
  isDarkMode.value = !isDarkMode.value;
  
  if (isDarkMode.value) {
    localStorage.setItem("video-web-golang-theme", "true");
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
  } else {
    localStorage.setItem("video-web-golang-theme", "false");
    document.body.classList.remove("dark");
    document.documentElement.classList.remove("dark");
  }
}
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">关于我们</h3>
        <ul class="footer-links">
          <li><a href="#">关于平台</a></li>
          <li><a href="#">联系我们</a></li>
          <li><a href="#">加入我们</a></li>
          <li><a href="#">帮助中心</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">法律</h3>
        <ul class="footer-links">
          <li><a href="#">用户协议</a></li>
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">版权声明</a></li>
          <li><a href="#">社区规范</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">资源</h3>
        <ul class="footer-links">
          <li><a href="#">创作者中心</a></li>
          <li><a href="#">开发者文档</a></li>
          <li><a href="#">API接口</a></li>
          <li><a href="#">反馈建议</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">关注我们</h3>
        <div class="social-links">
          <a href="#" class="social-link">📱</a>
          <a href="#" class="social-link">💬</a>
          <a href="#" class="social-link">📷</a>
          <a href="#" class="social-link">🐦</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="copyright">
        <p>© 2024 Ailzr. All rights reserved.</p>
        <p>精心打造的视频分享平台</p>
      </div>
    </div>
    
    <!-- Theme Toggle Button
    <button class="theme-toggle" @click="toggleMode" aria-label="切换主题模式">
      <div class="toggle-icon-container">
        <img 
          class="theme-img" 
          v-show="isDarkMode" 
          src="../assets/imgs/night-theme.png" 
          alt="切换到日间模式"
        >
        <img 
          class="theme-img" 
          v-show="!isDarkMode" 
          src="../assets/imgs/day-theme.png" 
          alt="切换到夜间模式"
        >
      </div>
    </button> -->
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--box-bgc);
  color: var(--fontNormal);
  padding: 40px 20px 20px;
  position: relative;
  border-top: 1px solid var(--hover-color);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.footer-section {
  margin-bottom: 20px;
}

.footer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 10px;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #6366f1;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: var(--fontNormal);
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 14px;
}

.footer-links a:hover {
  opacity: 1;
  color: #6366f1;
  padding-left: 5px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--hover-color);
  color: var(--fontNormal);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 18px;
}

.social-link:hover {
  background-color: #6366f1;
  color: white;
  transform: translateY(-3px);
}

.footer-bottom {
  max-width: 1200px;
  margin: 30px auto 0;
  padding-top: 20px;
  border-top: 1px solid var(--hover-color);
  text-align: center;
}

.copyright {
  font-size: 14px;
  opacity: 0.7;
}

.copyright p {
  margin: 5px 0;
}

/* Theme Toggle Button */
.theme-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--box-bgc);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toggle-icon-container {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-img {
  transform: rotate(30deg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .theme-toggle {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer {
    padding: 30px 15px 15px;
  }
  
  .footer-bottom {
    margin-top: 20px;
  }
}
</style>