const socket = io();
const audio = new Audio('ting.mp3');
const audio2 = new Audio('joined.mp3');
const users = [];
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('join-room', {username, room});

$("#room-name")[0].innerText = room;

const newUser = `<li> ${username} </li>`;
$("ul").append($(newUser));
users.push(username);

setInterval(() => {
  const message = $("form #input")[0].value;
  if(message) socket.emit("is-typing", username);
  else socket.emit("not-typing");
  }, 100);


function append(user, message, time,position){
  if(position === 'middle')
  {
    const new_element = `
      <div class = "message">
        <p class = "meta"> ${message}  <span> ${time} </span></p>
      </div>`;
    $(".chat-messages").append($(new_element));
    audio2.play();
  }

  else
  {
      const new_element = `
      <div class="message">
        <p class="meta">${user} <span>${time}</span></p>
        <p class="text"> ${message}</p>
      </div>`;
      $(".chat-messages").append($(new_element));
      audio.play();
  }
}

socket.on('user-joined', ({name, room, all_users}) => {
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  append(null, `${name} joined the chat`,time, 'middle');

  for (const [key, value] of Object.entries(all_users)) {
    if(value.room === room && users[username].indexOf(username) == -1)
    {
      const newUser = `<li> ${value.username} </li>`;
      $("ul").append($(newUser));
      users.push(value.username);
    }
  }
});

socket.on('receive', data => {
  if(typeof data === 'image') console.log("Image");
  else append(data.name, data.message, data.time,'left-top');
});

socket.on('user-left', name => {
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  append(null,`${name} left the chat`,time, 'middle');
});

socket.on('room-users', ({ room, all_users }) => {
    // $("#room-name").innerText = room;

  console.log(room);
});


socket.on('is-typing', username => {
  const para = $(".isTyping");
  para[0].innerText = `${username} is typing...`;
});

socket.on('not-typing', () => {
  const para = $(".isTyping");
  para[0].innerText = '';
});

$(".chat-form-container form").on('submit', function(e) {
  e.preventDefault();
  message = $("form #input")[0].value;

  if (message) {
    let currentDate = new Date();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    append(username,input.value, time,'right-in');
    socket.emit('new-chat-message', input.value);
    input.value = '';
  }
});

$(".save").on('click', function(){
  const all_messages = $(".chat-messages")[0].children;

  for(var i = 0; i < all_messages.length; i++)
  {
    const container  = all_messages[i]["children"];
    const sender = container[0].innerText;
    var message = "";
    if(container.length > 1)
      message = container[1].innerText;
    if(i == all_messages.length - 1) message += '\n------------------------------End Session--------------------------------';
    socket.emit('save-chat', {sender, message});
  }

  while(all_messages.length)
    all_messages[0].remove();

  alert("All messages saved in \"messages.txt\" file");
});

$(".fa-camera").on('click', function(){
  console.log("Clicked camera");
  const reader = new FileReader();
  reader.onload = function(){
    const base64 = this.result.replace(/.*base64,/, '');
    socket.emit('image', base64);
  };
  reader.readAsDataURL(this.files[0]);
});
