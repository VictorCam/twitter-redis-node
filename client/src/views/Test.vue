<template>
<Navigation></Navigation>
  <div id="Test">
    <h2>Test</h2>
    <Ctest>
      <template #data>
      </template>
    </Ctest>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useState } from '@/helpers'
import Ctest from '@/components/Ctest.vue'
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'Test',
  components: {
    Ctest, Navigation
  },
  setup() {
    const store = useStore()
    
    store.dispatch('all_users') //created api call
    const { all_users } = useState(['all_users']) //computed api call
    return { all_users }
  }
}
</script>
