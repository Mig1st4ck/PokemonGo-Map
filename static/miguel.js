function pad(number) {
    return number <= 99 ? ("0" + number).slice(-2) : number;
};
function pad3(num) {
    var s = num+"";
    while (s.length < 3) s = "0" + s;
    return s;
};
var pokemons = {};
function setupMiguelPokemon(item) {
    var new_id = pad3(item.pokemon_id);
    var show = parseInt(localStorage.getItem(new_id + '_' + item.pokemon_name));
    if (isNaN(show)){
        show = 3;
        localStorage.setItem(new_id + '_' + item.pokemon_name, show);
    }
    if (show > 0) {
        var disappear_date = new Date(item.disappear_time);
        console.log(new_id, item.pokemon_name, 
        pad(disappear_date.getHours()) + ':' + pad(disappear_date.getMinutes()) + ':' + pad(disappear_date.getSeconds())
        , item.latitude + ',' + item.longitude);
        if (show === 3){
            // todo Change to use the new notifications
            sendMyNotification('A wild ' + item.pokemon_name + ' appeared!', 'Click to load map', 'static/icons/' + item.pokemon_id + '.png', item);
            // prompt(new_id + ": " + item.pokemon_name + " Founded", item.latitude + ',' + item.longitude);
        }
    } else {
        return;
    }
    if (!pokemons[new_id]) {
        pokemons[new_id] = {
            item: item,
            count: 0,
            pos: 0,
            pocos: []
        }
    }
    if (pokemons[new_id].pocos.indexOf(item.latitude + ',' + item.longitude) < 0){
        pokemons[new_id].pocos.push(item.latitude + ',' + item.longitude);
    }
    pokemons[new_id].count = pokemons[new_id].pocos.length;

}

function sendMyNotification(title, text, icon, item) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification(title, {
            icon: icon,
            body: text,
            sound: 'sounds/ding.mp3'
        });

        notification.onclick = function () {
            notification.close();
            var latlng = new google.maps.LatLng(item.latitude, item.longitude);
            window.map.setCenter(latlng);
        };
    }
}

function setupLayout() {
    var ulPocos = $('<ul id="pokemons" class="links">');
    var navPocos = $('<nav id="nav-pocos"></nav>').append(ulPocos);

    var newA = $('<a>').attr({
        'href': '#nav-pocos'
    }).html('Show Pockemons');
    $('#nav').after(navPocos);
    $('#header a:first').after(newA);

    newA.click(function (){
        navPocos.toggleClass('visible');
    });
}
setupLayout();