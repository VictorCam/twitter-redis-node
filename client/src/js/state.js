import { reactive } from 'vue'

//state
var state = reactive({
    count: 69,
    count2: 49
})

//call api and mutate
const inc = (amount) => {
    state.count = 696969
    return state.count
}

export { 
    state,
    inc,
}