<script>
  import Howl from '../components/Howl.svelte'
  import { f_elapsed } from '../stores/function'

  //give me the timestamp now from 3hours ago in unix
  const now = new Date().getTime()
  const threeHoursAgo = now - (3 * 60 * 60 * 1000)

  console.log(f_elapsed(threeHoursAgo))



</script>


<Howl></Howl>