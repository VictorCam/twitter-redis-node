export const sum_toggle = writable('') //sign up modal toggle

export const modal = (e) => {
    return (get(sum_toggle) == '') ? sum_toggle.set('is-active') : sum_toggle.set('')
}

    //submit form
export async function signup(e) {
    const formData = new FormData(e.target)
    
    //loop through the formdata and store in json
    let payload = {};
    formData.forEach((value, key) => {
        payload[key] = value
    })


    if (payload['password_confirmation'] != payload['password']) {
        //display an error message to the user that the passwords do not match 
    }

    //if they match delete the password_confirmation key
    delete payload['password_confirmation']

    //create a request to the server with the payload to localhost:13377/v1/login
    const res = await axios.post(`${s_url}/register`, payload, {withCredentials: true, credentials: 'same-origin'})

    //if status is correct then display 200 response and direct to the login route
    if(res.status == 200) {
        sum_toggle.set('')
        goto("/test")
    }
}