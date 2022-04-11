<template>
    <div class="release-notes">
        <VueComponent/>
    </div>
</template>

<script>
import {
  getCollectionByField,
  getEntireCollection,
} from '@/firebase';
import { VueComponent } from '../../public/release-notes.md';
import 'es6-promise/auto';


export default {
  name: 'ReleaseNotes',
  components: {
    VueComponent,
  },
}
</script>

<style scoped>
  .release-notes {
    width: 50%;
    margin: auto;
  }
</style>
