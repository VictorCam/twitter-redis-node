<template>
  <div class="profile">
    <Navigation></Navigation>
    <h1>Profile</h1>
    <div v-if="profile.ID">
        <p>Username: {{ profile.Name }} </p>
        <p>Profile ID: {{ profile.ID }}</p>
    </div>

    <div v-else>LOADING</div>
  </div>
</template>


<script>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useState } from '@/helpers'
import Navigation from '@/components/Navigation.vue'

export default {
    name: 'Profile',
    components: {
        Navigation
    },
    setup() {
        const store = useStore()
        const route = useRoute()

        // console.log(route.query)
        // console.log(route.params)

        store.dispatch("profile", Number(route.params.id))
        const { profile } = useState(['profile']) //state api calls
        return { profile }
    }
}
</script>