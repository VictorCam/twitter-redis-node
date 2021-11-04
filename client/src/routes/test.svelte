<script>
import { getContext } from "svelte";


// function move(e) {
//     if (e.buttons) {
//         context.fillStyle = 'green';
//         context.beginPath();
//         context.arc(e.x, e.y,
//     }
// }
function test(e) {
    console.log("testing123", e)
}

function test2(e) {
    console.log("testing123", e)
    context.fillStyle = 'green';
    context.beginPath();
    context.arc(e.x, e.y)
}
</script>


<h1>Test</h1>

<!-- <canvas class="canvas" on:mouseover={test}>hello</canvas> -->
<canvas class="canvas" on:mouse={test2}>hello</canvas>





<style>
    .canvas {
        border: 0.1rem solid rgb(0, 0, 0);
        width: 30rem;
        height: 30rem;
    }
</style>