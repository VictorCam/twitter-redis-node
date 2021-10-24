import cookie from 'cookie'

export const handle = async ({request, resolve}) => {
    try {
        var cookies = cookie.parse(request.headers.cookie || '')
        
        console.log("handle")

        //check if cookie exists if not then it does not exist
        if(!cookies['auth']) { request.locals.auth = false }
        else { request.locals.auth = true }

        var res = await resolve(request)
        // console.log(res)
        
        return {
            ...res,
        }
    }
    catch(e) {
        //handle error events
        console.log("OOF ERROR:", e)
    }
}

export const getSession = (request) => {
    console.log("getSession")
    return {
        auth: request.locals.auth
    }
}