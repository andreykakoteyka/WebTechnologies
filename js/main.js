window.onhashchange = function(e) {
    console.log(e.target.location.hash);
};

document.querySelector('.up-btn').onclick = function () {
    document.querySelector('body > .wrapper > .content').scrollTop = 0;
};