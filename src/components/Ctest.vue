<template>
    <div class="feed-list">
        <div class="tweet-item">
          <span><slot name="profile-pic"></slot></span>
          <header class="post-header">
            <a class="user-id" href="#" target="_blank">
              <span class="username"><slot name="username"></slot></span>
              &nbsp;
              <span class="usercode"><slot name="usercode"></slot></span>
            </a>
            <time>Jun 10</time>
          <div class="dropdown m-left">
              <button class="dropbtn">...</button>
            <div class="dropdown-content">
              <slot name="dropdown1"></slot>
            </div>
          </div>
          </header>
          <div class="common-content">
            <slot class="body-content" name="body-content"></slot>
          </div>
          <ul class="message-options u-flex">
            <li class="message-options-item">
                <button class="icon-button"><span class="icon">💬</span></button>
                <span class="text">0</span>
            </li>
            <li class="message-options-item">
                <button class="icon-button"><span class="icon">🔃</span></button>
                <span class="text">0</span>
            </li>
            <li class="message-options-item">
                <button class="icon-button"><span class="icon">👍</span></button>
                <span class="text">100</span>
            </li>
            <li class="message-options-item">
              <slot name="delete"></slot>
            </li>
          </ul>
        </div>
    </div>
</template>

<script>
export default {
  name: 'Post'
}
</script>

<style>
.feed-list {
  margin: 1px;
  padding: 0;
  border: 0;
}

.tweet-item {
  display: grid;
  grid-template-columns: 10% auto;
  grid-template-rows: 20px;
  grid-template-areas: "hd date"
                       "hd content"
                       "hd last";
  column-gap: 10px;
  background-color: rgb(223, 223, 223);
}

.tweet-item:hover {
  background-color: rgb(212, 212, 212);
}

.common-content {
  grid-area: content;
}

.post-header {
  grid-area: date;
  display: flex !important;
}

.user-id {
  text-decoration: none;
}

.profile-image {
	border-radius: 50%;
}

time:before {
  content: "·";
  margin: 0 5px;
}

img {
  display: block;
  max-width: 100%;
}

.m-left {
  margin-left: auto;
}

.u-flex {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  list-style: none;
}

.username {
  color: black;
}

.u-flex {
	display: flex !important;
}

.message-options {
  grid-area: last;
	justify-content: space-between !important;
}

.dropbtn {
  background-color: #b3b3b3;
  color: white;
  padding: 1px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 5px 5px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1
}

.dropdown:hover .dropdown-content {
  cursor: pointer;
  display: block;
  right: 0;
}

.dropdown:hover .dropbtn {
  background-color: #3e8e41;

}

</style>