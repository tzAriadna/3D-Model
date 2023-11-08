<template>
  <header>
    <nav>
      <router-link :to="{ name: 'home'}">Модель шахты</router-link>
      <router-link :to="{ name: 'about'}">страница2</router-link>
    </nav>
  </header>
  <div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
    }
  },
}

</script>


<style>
#app {
  height: 97px;
}
body {
  margin: 0;
}
header {
  height: 100px;
  background: #a3a2a2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
nav a {
  font-weight: bold;
  color: #fff;
  text-decoration: none;
  padding: 15px;
  font-size: 25px;
}
nav a.router-link-exact-active {
  color: #7642b9;
}
body { 
  margin: 0; 
}
</style>
