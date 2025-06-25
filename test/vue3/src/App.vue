<template>
  <img alt="Vue logo" src="./assets/images/logo.png">
  <Imported msg="Welcome to Your Vue.js App"/>
</template>

<script>
import Imported from './components/Imported.vue'

export default {
  name: 'App',
  components: {
    Imported
  }
}
</script>

<style lang="scss">
@use './assets/styles/imported.scss';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
