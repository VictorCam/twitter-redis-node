import cookie from 'cookie'
import axios from 'axios'

export const handle = async ({request, resolve}) => {
    try {
        let cookies = cookie.parse(request.headers.cookie || '')

        if(!cookies['authorization']) {
            request.locals.auth = false
        }
        else { 
            request.locals.auth = true 
        }

        let res = await resolve(request)
        
        return {
            ...res,
        }
    }
    catch(e) {
        //TODO: handle error events
        console.log("OOF ERROR:", e)
    }
}

export const getSession = (request) => {
    return {
        auth: request.locals.auth
    }
}