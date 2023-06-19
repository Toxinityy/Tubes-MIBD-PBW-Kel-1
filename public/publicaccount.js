const followersNumber = document.querySelector("#account-publik-followers-number");
const followersText = document.querySelector("#account-publik-followers-text");
const followingNumber = document.querySelector("#account-publik-following-number");
const followingText = document.querySelector("#account-publik-following-text");

const timelineContent = document.querySelector("#account-publik-timeline-content");
const followersContent = document.querySelector("#account-publik-followers-list-box");
const followingContent = document.querySelector("#account-publik-following-list-box");

const formFollow = document.getElementById('account=publik-form-follow');
const followButton = document.querySelector('#account-publik-follow-button input[type="submit"]');
const userId = followButton.id.replace('follow-button',''); 

const buttonClose = document.querySelectorAll('.account-publik-close-button');

function onSuccess(response){
    return response.json();
}
function showResultPost(text){
    console.log(text);
}

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
const listTas = document.querySelectorAll('.account-publik-kotak-tas');

listFollowers.forEach(followerUser => {
    followerUser.addEventListener('click', ()=>{
        const idUser = followerUser.id.replace('account-publik-follower','');
        window.location.href = `/account-publik?id=${idUser}`;
    });
});

listFollowing.forEach(followingUser => {
    followingUser.addEventListener('click', ()=>{
        const idUser = followingUser.id.replace('account-publik-following','');
        window.location.href = `/account-publik?id=${idUser}`;
    });
});

listTas.forEach(productTas=>{
    productTas.addEventListener('click', ()=>{
        const idTas = productTas.id.replace('account-publik-tas','');
        window.location.href = `/product-details?id=${idTas}`;
    })
});

buttonClose.forEach(closeBut=>{
    closeBut.addEventListener('click', ()=>{
        timelineContent.style.visibility = 'visible';
        followersContent.style.visibility = 'hidden';
        followingContent.style.visibility = 'hidden';
    })
})