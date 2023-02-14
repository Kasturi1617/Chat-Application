all_users = {};

function newUserJoined(username, room, id)
{
  const data = {
    'username': username,
    'room': room
  };
  all_users[id] = data;
}

function userLeft(id)
{
  delete all_users[id];
}

module.exports = {
  all_users,
  newUserJoined,
  userLeft
};
