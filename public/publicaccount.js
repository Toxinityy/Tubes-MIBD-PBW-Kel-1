const followersNumber = document.querySelector("#account-publik-followers-number");
const followersText = document.querySelector("#account-publik-followers-text");
const followingNumber = document.querySelector("#account-publik-following-number");
const followingText = document.querySelector("#account-publik-following-text");

const timelineContent = document.querySelector("#account-publik-timeline-content");
const followersContent = document.querySelector("#account-publik-followers-list-box");
const followingContent = document.querySelector("#account-publik-following-list-box");

followersNumber.addEventListener('click', followersClicked);
followersText.addEventListener('click', followersClicked);

followingNumber.addEventListener('click', followingClicked);
followingText.addEventListener('click', followingClicked);

function followersClicked(){
    timelineContent.style.visibility = 'hidden';
    followersContent.style.visibility = 'visible';
    followingContent.style.visibility = 'hidden';
}
function followingClicked(){
    timelineContent.style.visibility = 'hidden';
    followersContent.style.visibility = 'hidden';
    followingContent.style.visibility = 'visible';
}

const listFollowers = document.querySelectorAll('.account-publik-followers-person-box');

const listFollowing = document.querySelectorAll('.account-publik-following-person-box');

listFollowers.forEach(followerUser => {
    followerUser.addEventListener('click', clickPerson);
});

listFollowing.forEach(followingUser => {
    followingUser.addEventListener('click', clickPerson);
});

function clickPerson(event){
    console.log('clicked');
    const idUser = event.target.dataset.value;
    window.location.href = 'account-publik?id=' + idUser;
}