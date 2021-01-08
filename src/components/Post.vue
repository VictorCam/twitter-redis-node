<template>
  <div class="post">
    <div class="container">
      <div class="container-c">
        <slot name="data"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Post'
}
</script>

<style>
.container {
  display: flex;
  justify-content: center;
}

.container-c {
  background-color: rgb(218, 218, 218);
  border: solid 0.1em;
  margin: 0.5em;
  padding: 0.5em;
  width: 30%;
}

</style>