<template>
    <div class="resources">
        <VueComponent/>
    </div>
</template>

<script>
import { VueComponent } from '../../public/resources.md';
import 'es6-promise/auto';


export default {
  name: 'ReleaseNotes',
  components: {
    VueComponent,
  },
}
</script>

<style scoped>
  .resources {
    width: 50%;
    margin: auto;
  }
</style>
