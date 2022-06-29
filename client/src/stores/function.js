export const f_elapsed = (unix_ts) => {

    unix_ts = 1655225111300

    //if 0 to 60 seconds has passed display the difference in seconds
    //if 1 to 24 hours has passed display the difference in hours
    //if 1 to 7 days has passed display the difference in days
    //if anything else display the date in the format of 'M/D/YYYY'
    let diff = dayjs().diff(dayjs(unix_ts), 'second')

    let howled = '0s'

    if (diff < 60) {
        howled = diff + 's'
    } else if (diff < 3600) {
        howled = Math.floor(diff / 60) + 'm'
    } else if (diff < 86400) {
        howled = Math.floor(diff / 3600) + 'h'
    } else if (diff < 604800) {
        howled = Math.floor(diff / 86400) + 'd'
    } else {
        howled = dayjs(unix_ts).format('M/D/YYYY')
    }

    console.log(howled)
    return howled
}

export function f_register(e) {
    return (get(register_toggle) == '') ? register_toggle.set('is-active') : register_toggle.set('')
}