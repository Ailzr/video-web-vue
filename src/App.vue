<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui';
import Navigation from './components/Navigation.vue';
import Footer from "./components/Footer.vue";
</script>

<template>
  <div id="app">
    <Navigation/>
    <Suspense>
      <n-message-provider>
        <n-dialog-provider>
          <router-view/>
        </n-dialog-provider>
      </n-message-provider>
    </Suspense>
    <Footer/>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
