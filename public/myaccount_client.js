const followersNumber = document.querySelector("#myaccount-followers-number");
const followersText = document.querySelector("#myaccount-followers-text");
const followingNumber = document.querySelector("#myaccount-following-number");
const followingText = document.querySelector("#myaccount-following-text");

const timelineContent = document.querySelector("#myaccount-timeline-content");
const followersContent = document.querySelector("#myaccount-followers-list-box");
const followingContent = document.querySelector("#myaccount-following-list-box");

const formElement = document.getElementById('myaccount-upload-img-form');
const imageInputElement = document.getElementById('myaccount-image-input');
const currentProfileImg = document.getElementById('img-myaccount-profil');
const buttonCancelUpload = document.getElementById('cancel-img-upload-button');

followersNumber.addEventListener('click', followersClicked);
followersText.addEventListener('click', followersClicked);

followingNumber.addEventListener('click', followingClicked);
followingText.addEventListener('click', followingClicked);

function onSuccess(response){
    return response.json();
}
function showResultPost(text){
    currentProfileImg.src = text.response;
    formElement.style.visibility = 'hidden';
}

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
    followerUser.addEventListener('click', ()=>{
        const idUser = followerUser.id.replace('myaccount-follower','');
        window.location.href = `/account-publik?id=${idUser}`;
    });
});

listFollowing.forEach(followingUser => {
    followingUser.addEventListener('click', ()=>{
        const idUser = followingUser.id.replace('myaccount-following','');
        window.location.href = `/account-publik?id=${idUser}`;
    });
});

currentProfileImg.addEventListener('click', function() {
    formElement.style.visibility = "visible"
});

buttonCancelUpload.addEventListener('click', ()=>{
    formElement.style.visibility = "hidden";
})

formElement.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', imageInputElement.files[0]);

    fetch('/my-account', {
        method: 'POST',
        body: formData
    }).then(onSuccess).then(showResultPost);
});

