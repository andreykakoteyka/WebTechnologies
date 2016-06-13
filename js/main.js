var states = [
    {
        url: 'cars',
        controller: '',
        templateUrl: ''
    }
];



window.onhashchange = function(e) {
    console.log(e.target.location.hash);
};

var content = document.querySelector('body > .wrapper > .content');
var upBtn = document.querySelector('.up-btn');

upBtn.onclick = function () {
    $(content).animate({scrollTop: 0}, 500);
};

if (content.scrollTop < 30) {
    $(upBtn).addClass('hide');
} else {
    $(upBtn).removeClass('hide');
}

content.addEventListener('scroll', function () {
    if (content.scrollTop < 30) {
        $(upBtn).addClass('hide');
    } else {
        $(upBtn).removeClass('hide');
    }
});

function like(id, element) {
    $.post('/like/'+id, function () {
            $(element).addClass('featured');
        });
}