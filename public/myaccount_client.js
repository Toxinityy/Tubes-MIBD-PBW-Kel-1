const followersNumber = document.querySelector("#myaccount-followers-number");
const followersText = document.querySelector("#myaccount-followers-text");
const followingNumber = document.querySelector("#myaccount-following-number");
const followingText = document.querySelector("#myaccount-following-text");

const timelineContent = document.querySelector("#myaccount-timeline-content");
const followersContent = document.querySelector("#myaccount-followers-list-box");
const followingContent = document.querySelector("#myaccount-following-list-box");

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

const listFollowers = document.querySelectorAll('.myaccount-followers-person-box');

const listFollowing = document.querySelectorAll('.myaccount-following-person-box');

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