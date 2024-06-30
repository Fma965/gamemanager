//#region WebSocket
const uuid = uuidv4();

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let webSocket = null;
function connect_socket() {
    webSocket = new WebSocket('https://games.f9.casa/ws');
}
connect_socket();

webSocket.onmessage = (event) => {
    var data = JSON.parse(event.data)
    if(data.type == "random" && data.uuid != uuid) {
        alertDone(data, false);
    }
};

webSocket.onclose = (event) => {
    console.log("Web Socket connection lost");
    connect_socket();
};

webSocket.addEventListener("open", () => {
    console.log("Connected To Web Socket");
});
//#endregion

//#region DOM
var url;
function GetAllURIParams() {
    url = new URL(window.location.href);
    GetURIParam('genres', '.genre');
    GetURIParam('modes', '.mode');   
    GetURIParam('players', '.player')     

    if (url.searchParams.get("free") == "false") {
        jQuery('#free-games').prop( "checked", false);
    } 

    if (url.searchParams.get("remote") == "false") {
        jQuery('#remote-play').prop("checked", false );
    }

    if( jQuery('.player').filter(':checked').length > 0) {
        jQuery('#remote-play').prop("disabled", false);
        jQuery('#free-games').prop("disabled", false);
    }
}

function GetURIParam(param, classname) {
    var params = null;
    if (url.searchParams.get(param) !== null) params = url.searchParams.get(param).toLowerCase().split(",");
    if(params !== null) {
        jQuery.each(jQuery(classname), function(i,elem){
            jQuery(elem).prop( "checked", false)
        });
        params.forEach(function(item) {
            jQuery(classname+'[data-value="'+item+'"]').prop( "checked", true );
        });
    }
}

jQuery(document).on("change", ".player", function () {
    jQuery('#remote-play').prop("disabled", false);
    jQuery('#free-games').prop("disabled", false);
});

jQuery(document).on("change", "input[class^='filter-checkbox']", function () {
    FilterTable();
});

dataTable = $('#games').DataTable({
    "language": {
        "loadingRecords": "Loading Data, Please Wait...",
    },
    processing: true,                        
    dom: 'lrt',
    paging: false,
    ajax: '/games.php',
    processing: true,
    order: [[ 0, 'asc' ]],
    fixedHeader: {
        footer: true,
        header: false,
    },
    columns: [
        { data: 'name' },
        { data: 'owned_by' },
        { data: 'platforms' },
        { data: 'genre.name' },
        { data: 'mode.name' },
        { data: 'min_players' },
        { data: 'max_players' },
        { data: 'is_free' },
        { data: 'remote_play_together' },
    ],
    "columnDefs": [ 
    {
        targets: 0,
        orderable: false,
        data: "name",
        render: function ( data, type, row, meta ) {
            var link = row.steam_appid == null ? row.link : 'https://store.steampowered.com/app/' + row.steam_appid
            return '<a class="datatablelink" style="text-decoration:none;" target="_blank" href="'+ link +'">'+data+'</a>';
        }  
    }, 
    {
        targets: 1,
        orderable: false,
        data: "owned_by",
        render: function ( data, type, row, meta ) {
            var output = "";
            if (Array.isArray(data) && data.length) {
                data.forEach(function(owner) {  
                    if (type === 'display') {
                        output += owner.name == "Free" ? " Free " : ""
                        output += '<img class="tooltips avatar" title="'+owner.name+'" src="'+owner.avatar_url+'"></img>';
                    }
                    if (type === 'filter') {
                        output += owner.name + ' '; 
                    }
                });
                
                if (type === 'filter') {
                    output += row.remote_play_together == true ? " RemotePlay " : "";
                    output += row.is_free == true ? " Free " : "";
                }
            } 
            else output = "Not Owned"
            return output
        }  
    }, 
    {
        targets: 2,
        orderable: false,
        data: "platforms",
        render: function ( data, type, row, meta ) {
            if (Array.isArray(data) && data.length) {  
                if (type === 'display') {
                    data = data.join(" ");
                    data = data.replace('Battle.net', '<a class="datatablelink tooltips color-primary" target="_blank" href="'+row.link+'" title="Battle.net"><img class="icon" src="/assets/img/battlenet.png" /></a>');
                    data = data.replace('Steam', '<a class="datatablelink tooltips color-primary" href="https://store.steampowered.com/app/'+row.steam_appid+'" title="Steam"><img class="icon" src="/assets/img/steam.png" /></a>');
                    data = data.replace('Web', '<a class="datatablelink tooltips color-primary" href="'+row.link+'" title="Browser Based"><img class="icon" src="/assets/img/web.png" /></a>');  
                    data = data.replace('Epic Games', '<a class="datatablelink tooltips color-primary" href="'+row.link+'" title="Epic Games"><img class="icon" src="/assets/img/epic.png" /></a>');  
                    data = data.replace('Emulator', '<a class="datatablelink tooltips color-primary" href="'+row.link+'" title="Emulator"><img class="icon" src="/assets/img/emulator.png" /></a>');  
                    data = data.replace('Riot Games', '<a class="datatablelink tooltips color-primary" href="'+row.link+'" title="Riot Games"><img class="icon" src="/assets/img/riot.png" /></a>');  
                }
                if (type === 'filter') {
                    data = data.join(" ");
                }  
            }
            return data;
        } 
    },  {
        targets: 3,
        orderable: true,
        data: "genre",
        render: function ( data, type, row, meta ) {
            if (type === 'display') {
                return replaceGenreWithIcon(data);
            }
            else return data;
        }  
    },{
        targets: 7,
        orderable: false,
        data: "is_free",
        render: function ( data, type, row, meta ) {
            if (type === 'display') {
                return data ? '<i style="color: var(--bs-green);" class="fa-solid fa-circle-check"></i>' : '<i style="color: var(--bs-red);" class="fa-solid fa-circle-xmark"></i>';
            }
            if (type === 'filter') {
                return data ? "free" : "paid";
            }  
            return data
        } 
    },{
        targets: 8,
        orderable: false,
        data: "remote_play_together",
        render: function ( data, type, row, meta ) {
            if (type === 'display') {
                return '<img class="icon ' + (data ? 'green-filter"' : 'red-filter"') + ' src="/assets/img/remoteplaytogether.png" />';
            }
            return data
        } 
    }
],    
    
    "initComplete": function(settings, json) {
        jQuery.Zebra_Tooltips(jQuery('.tooltips'));
        GetAllURIParams();
        FilterTable();
    }
});

dataTable.search.fixed('range', function (searchStr, data, index) {
    var playercount = jQuery('.player').filter(':checked').length; 
    var min = data['min_players'];
    var max = data['max_players'];
    
    if ((isNaN(min) && isNaN(max)) || (isNaN(min) && playercount <= max) || (min <= playercount && isNaN(max)) || (min <= playercount && playercount <= max) || playercount == 0) {
        return true;
    }
    return false;
});

function ResetTable() {
    dataTable.search('').columns().search('').draw();
    jQuery('#games tr').show();
}

function FilterTable() {
    ResetTable()

    var urlFilter = []
    var players = jQuery("#player-list").text().split("|");
    jQuery.each(jQuery(".player"), function(i,elem){
        if(jQuery(elem).prop('checked') == false) {
            players = players.filter(e => e !== jQuery(this).val())
        } else {
            urlFilter.push(jQuery(this).data("value"))
        }
    })

    var urlParams =  "?players=" + urlFilter.join(",");
    
    var remoteplay = "";
    if(jQuery('#remote-play').prop('checked') == true) {
        remoteplay = ")|(RemotePlay"
        urlParams = urlParams + "&remote=true"
    } else{
        urlParams = urlParams + "&remote=false"
    }

    var cost = "";
    if(jQuery('#free-games').prop('checked') == true) {
        cost = ")|(Free"
        urlParams = urlParams + "&free=true"
    } else{
        urlParams = urlParams + "&free=false"
    }

    dataTable.column(1).search('(' + players.join(".*") + remoteplay + cost + ')', {regex: true, smart: false}).draw();

    urlParams = urlParams + FilterCol("genres", ".genre", "#genre-list", "|", 3);
    urlParams = urlParams + FilterCol("modes", ".mode", "#mode-list", "|^", 4);

    var playercount = jQuery('.player').filter(':checked').length; 

    jQuery('#player-count').text(playercount + ((playercount == 0 || playercount > 1) ? " Players" : " Player")); 

    var gamecount = jQuery('#games tbody tr:visible').length - ($("#games tbody td:first").hasClass("dt-empty") ? 1 : 0);
    jQuery('#game-count').text(gamecount + ((gamecount == 0 || gamecount > 1) ? " Games" : " Game")); 

    window.history.replaceState(null, document.title, window.location.origin + urlParams);
}

function FilterCol(param, classname, list, sep, col) {
    var urlFilter = []
    var items = jQuery(list).text().split("|");
    jQuery.each(jQuery(classname), function(i,elem){
        if(jQuery(elem).prop('checked') == false) {
            items = items.filter(e => e !== jQuery(this).val())
        } else {
            urlFilter.push(jQuery(this).data("value"))
        }
    })
    dataTable.column(col).search('(' + items.join(sep) + ')', {regex: true, smart: false}).draw();
    return "&" + param + "=" + urlFilter.join(",");
}

const genreIcons = {
    "Party": "🎉",
    "Battle Royale": "👑",
    "Shooter": "🔫",
    "Social Deduction": "🤔",
    "Fighter": "🥷",
    "Platformer": "🧱",
    "Strategy": "♟️",
    "Survival": "💀",
    "Puzzle": "🧩",
    "Racing": "🚗",
    "Horror": "🔪",
    "Cooking": "🧑‍🍳",
    "Sports": "⚽",
    "MOBA": "🏟️"
};

function replaceGenreWithIcon(data) {
    if (genreIcons[data]) {
        return data.replace(data, `<span class="tooltips genre-icon" title="${data}">${genreIcons[data]}</span> ${data}`);
    }
    return data;
}

//#region Wheel
let theWheel = new Winwheel({
    'textFontSize' : 22,    // Set font size as desired.
    'responsive'   : true,  // This wheel is responsive!
    'animation' :           // Specify the animation to use.
    {
        'type'     : 'spinToStop',
        'duration' : 5,
        'spins'    : 10,
        'callbackFinished' : postSpin,
        'callbackSound'    : playSound,   // Function to call when the tick sound is to be triggered.
        'soundTrigger'     : 'segment'        // Specify pins are to trigger the sound, the other option is 'segment'.
    },
});

let audio = new Audio('/assets/audio/tick.mp3');  // Create audio object and load tick.mp3 file.

function playSound()
{
    // Stop and rewind the sound if it already happens to be playing.
    audio.pause();
    audio.currentTime = 0;

    // Play the sound.
    audio.play();
}

function postSpin(data) {
    webSocket.send(JSON.stringify(msg = {
        type: "random",
        text: data.text,
        username: jQuery("#username").text(),
        uuid: uuid,
    }));
    applause.play();
    alertDone(data)
}

function alertDone(data, manual = true)
{
    var text = "";
    if(!manual) var text = 'Random Game picked by ' + data.username;
    Swal.fire({
            title: "<strong>"+data.text+"</strong>",
            text: text,
            iconHtml: '<i class="fa-solid fa-dice"></i>',
            showCloseButton: false,
            focusConfirm: false,
            confirmButtonText: `<i class="fa fa-repeat"></i>&nbsp; Spin Again`,
            confirmButtonAriaLabel: "Thumbs up, great!",
            showConfirmButton: manual,
            showCancelButton: manual,
            showDenyButton: manual,
            denyButtonText: `<i class="fa fa-repeat"></i>&nbsp; Remove Game & Spin Again`
            }).then((result) => {
            if (result.isConfirmed) {
                Randomizer();
            } else if (result.isDenied) {
                Randomizer(false, theWheel.getIndicatedSegment().text);
            } else {
                jQuery("#randomizer").hide();
            };
            });
}

jQuery("#random").click(function(e) {
    Randomizer(true);
})

let wheelPower    = 0;
let wheelSpinning = false;

var randomizerGames = []
function Randomizer(fresh, excluded) {  
    theWheel.stopAnimation(false); 
    theWheel.rotationAngle = 0; 
    theWheel.draw();            
    wheelSpinning = false;
    theWheel.clearCanvas();
    theWheel.numSegments = 0;

    if(fresh == true) {
        randomizerGames = [];
        jQuery.each(jQuery('#games td:first-child:visible'), function(i,elem){
            if(jQuery(this).text()) {
                
                randomizerGames.push(jQuery(this).text());
            }
        })
    }

    if(excluded != "") {
        var index = randomizerGames.indexOf(excluded);
        if (index !== -1) {
            randomizerGames.splice(index, 1);
        }
    }

    randomizerGames.forEach(game => {
        theWheel.addSegment({
            'text' :game,
            'fillStyle' : '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
        }, 1);
    });
    
    theWheel.draw();
    jQuery("#randomizer").show();

    if (wheelSpinning == false) {
        theWheel.startAnimation();
        wheelSpinning = true;
    }
}
//#endregion