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
        var desapear_at = `Disappears at ${pad(disappear_date.getHours())}:${pad(disappear_date.getMinutes())}:${pad(disappear_date.getSeconds())}`;
        console.log(new_id, item.pokemon_name, desapear_at);
        if (show === 3){
            // todo Change to use the new notifications
            sendMyNotification('A wild ' + item.pokemon_name + ' appeared!', desapear_at, 'static/icons/' + item.pokemon_id + '.png', item);
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
    if (pokemons[new_id].pocos.indexOf(item.encounter_id) < 0){
        pokemons[new_id].pocos.push(item.encounter_id);
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

        if(localStorage.playSound === 'true'){
          window.audio.play();
        }

        notification.onclick = function () {
            notification.close();
            var latlng = new google.maps.LatLng(item.latitude, item.longitude);
            window.map.setCenter(latlng);
        };
    }
}

function setupLayout() {
    var ulPocos = $('<ul id="pokemons" class="links">')
    var navPocos = $('<nav id="nav-pocos"></nav>').css({
        'zIndex': 10,
        'position': 'absolute',
        'background': '#eee',
        'width': '300px',
        'top': '50px',
        'bottom': '0px',
        'padding': '15px',
    }).append(ulPocos);

    var newA = $('<a>').attr({
        'href': '#nav-pocos'
    }).html('Show Pockemons');
    $('#nav').after(navPocos);
    $('#header a:first').after(newA);

    newA.click(function (){
        navPocos.toggleClass('visible');
    });

    google.maps.event.addListener(map, "rightclick", function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        // populate yor box/field with lat, lng
        $.post(`next_loc?lat=${lat}&lon=${lng}`);
        var latlng = new google.maps.LatLng(lat, lng);
        marker.setVisible(true);
        marker.setOptions({'opacity': 1});
        marker.setPosition(latlng);
    });
}
function updateList() {
    var list = $('#pokemons');
    var lastStamp = new Date().getTime();
    $.each(pokemons, function(i, item){
        var div = list.find('.'+i);
        if (div.length === 0) {
            var show = parseInt(localStorage.getItem(i + '_' + item.item.pokemon_name));
            var background = isNaN(show) || show >= 3 ? 'red': '#ccc';
            div = $('<li>').css({
                'list-style': 'none',
                background: background
            }).append($('<a>')
                    .attr('href', '#' + i)
                    .append($('<img>').attr('src', 'static/icons/'+item.item.pokemon_id+'.png'))
                    .append(i + ' ' + item.item.pokemon_name)
                    .append($('<span>').css({
                        'float': 'right',
                        'margin-top': '7px',
                        'padding': '0 10px',
                        'background': '#fff',
                        'color': '#222',
                        'border-radius': '10px'
                    }).addClass('badge ' + i).text(item.count)))
                    .data(item.item)
                    .click(function() {
                        var new_id = pad3($(this).data().pokemon_id);
                        var rnd = pokemons[new_id].pos++;
                        if (rnd > pokemons[new_id].pocos.length - 1) {
                            rnd = 0;
                        }
                        var item = pokemons[new_id].pocos[rnd].split(',');
                        var latlng = new google.maps.LatLng(item[0], item[1]);

                        map.setCenter(latlng);
                        // console.log("click ", item, latlng);
                    });
            list.append(div);
        } else {
            $.each(item.pocos, function(i, val){
                if (!map_pokemons[val]){
                    var index = item.pocos.indexOf(val);
                    if (index >= 0) {
                        item.pocos.splice(index, 1);
                    }
                    item.count = item.pocos.length;
                }
            });
            div.text(item.count);
        }
    });
}
var clear = setInterval(function(){
    if (window.map && window.marker) {
        clearInterval(clear);
        setupLayout();
    }
}, 500);
setInterval(updateList, 5000);
