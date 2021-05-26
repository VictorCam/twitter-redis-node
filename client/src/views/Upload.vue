<template>
<div>
    <Navigation></Navigation>
    <h1>Upload</h1>
    <input type="file" name="recfile" enctype="multipart/form-data" @change="onFileSelected"/>
</div>
</template>

<script>
import { reactive } from 'vue'
// import { useStore } from 'vuex'
import Navigation from '@/components/Navigation.vue'
import axios from 'axios'

export default {
    components: {
        Navigation
    },
    setup() {
        // const store = useStore()

        const jfile = {selectedFile: null}
        const file = reactive({...jfile})
        
        function onFileSelected(e) {
            file.selectedFile = e.target.files
            const data = new FormData()
            data.append('recfile', e.target.files[0])
            axios.post("http://localhost:13377/profile_pic", data, {withCredentials:true})
            // store.dispatch("profilePic", file.selectedFile)
            // Object.assign(file, jfile)
        }


        return { onFileSelected }
    }
}
</script>