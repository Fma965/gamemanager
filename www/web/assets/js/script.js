
jQuery(document).ready(function ($) {
    dataTable = $('#games').DataTable({
        "language": {
            "loadingRecords": "Loading Data, Please Wait..."
        },
        processing: true,                        
        dom: 'lrt',
        paging: false,
        ajax: '/games.php',
        processing: true,
        order: [[ 0, 'asc' ]],
        columns: [
            { data: 'name' },
            { data: 'owned_by' },
            { data: 'platforms' },
            { data: 'genre.name' },
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
                            if(owner.name == "Free") {
                                output = "Free";
                            } else {
                                output += '<img class="tooltips avatar" title="'+owner.name+'" src="'+owner.avatar_url+'"></img>';
                            } 
                        }
                        if (type === 'filter') {
                            output += owner.id + ' '; 
                        }
                    });
                    if (type === 'filter') {
                        output += row.remote_play_together == true ? " remote" : "";
                        output += row.is_free == true ? " free" : "";
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
                    if(data == "Party") return data.replace('Party', '<span class="tooltips genre-icon" title="'+data+'">🎉</span> Party');
                    if(data == "Action") return data.replace('Action', '<span class="tooltips genre-icon" title="'+data+'">⚔️</span> Action');
                    if(data == "BattleRoyale") return data.replace('BattleRoyale', '<span class="tooltips genre-icon" title="'+data+'">👑</span> Battle Royale');
                    return data;
                }
                else return data;
            }  
        },{
            targets: 6,
            orderable: false,
            data: "is_free",
            render: function ( data, type, row, meta ) {
                if (type === 'display') {
                    return data ? '<i style="color: var(--bs-green);" class="fa-solid fa-circle-check"></i>' : '<i style="color: var(--bs-red);" class="fa-solid fa-circle-xmark"></i>';
                }
                return data
            } 
        },{
            targets: 7,
            orderable: false,
            data: "remote_play_together",
            render: function ( data, type, row, meta ) {
                return '<img class="icon ' + (data ? 'green-filter"' : 'red-filter"') + ' src="/assets/img/remoteplaytogether.png" />';
            } 
        }],    
        
        "initComplete": function(settings, json) {
            jQuery.Zebra_Tooltips(jQuery('.tooltips'));

            var url = new URL(window.location.href);
            
            var players = url.searchParams.get("players").toLowerCase().split(",");
            if(players !== null) {
                players.forEach(function(player) {
                    jQuery('.player-counter[data-name="'+player+'"]').prop( "checked", true );
                });
            }
            var genres = url.searchParams.get("genres").toLowerCase().split(",");
            if(genres !== null) {
                jQuery.each(jQuery('.genre'), function(i,elem){
                    jQuery(elem).prop( "checked", false)
                });
                genres.forEach(function(genre) {
                    jQuery('.genre[data-value="'+genre+'"]').prop( "checked", true );
                });
            }
            
            var free = url.searchParams.get("free");
            if (free == "false") jQuery('#free-games').prop( "checked", false);

            var remote = url.searchParams.get("remote");
            if (remote == "false") jQuery('#remote-play').prop( "checked", false );

            FilterTable();
        }
    });

    jQuery(document).on("change", "input[class^='filter-checkbox']", function () {
        FilterTable();
    });

    function FilterTable() {
        dataTable.search('').columns().search('').draw();
        jQuery('#games tr').show();

        var searchTerms = []
        var urlFilterPlayers = []
        jQuery.each(jQuery('.player-counter'), function(i,elem){
            if(jQuery(elem).prop('checked')) {
                searchTerms.push(jQuery(this).val());
                urlFilterPlayers.push(jQuery(this).data("name"))
            }
        })
        urlFilterPlayers = "?players=" + urlFilterPlayers.join(",");

        var players = searchTerms.length == 0 ? "" : '(' + searchTerms.join(' ') + ')';
        var regex = [];
        var settings = "";

        var urlFilterFree = "&free="
        regex.push('paid');
        if(jQuery('#free-games').prop('checked')) {
            regex.push('free') 
            urlFilterFree += "true";
        } else {
            urlFilterFree += "false";
        }

        var urlFilterRemote = "&remote="
        if(jQuery('#remote-play').prop('checked')) {
            regex.push('remote')
            urlFilterRemote += "true";
        } else {
            regex.push('online')
            urlFilterRemote += "false";
        }

        settings = regex.join('|') + (searchTerms.length == 0 ? "" : "|");

        dataTable.column(1).search('(' + settings + players + ')', {regex: true}).draw();
        
        var urlFilterGenres = []
        var genres = jQuery('#genre-list').text().split("|");;
        jQuery.each(jQuery('.genre'), function(i,elem){
            if(jQuery(elem).prop('checked') == false) {
                genres = genres.filter(e => e !== jQuery(this).val())
            } else {
                urlFilterGenres.push(jQuery(this).data("value"))
            }
        })
        urlFilterGenres = "&genres=" + urlFilterGenres.join(",");
        dataTable.column(3).search('(' + genres.join('|') + ')', {regex: true}).draw();
        
        var players = jQuery('.player-counter').filter(':checked').length; 
        if(players != 0) {
            jQuery.each(jQuery('#games tr'), function(i,elem){
                if(i == 0) return;
                var min = jQuery('#games tr:eq('+i+') td:eq(4)').text()
                var max = jQuery('#games tr:eq('+i+') td:eq(5)').text()
                
                if((players >= min) && (players <= max)) {    
                    
                } else {
                    jQuery(this).hide();
                }
            });
        }

        jQuery('#player-count').text(players);
        jQuery('#game-count').text(jQuery('#games tr:visible').length - 1);

        window.history.replaceState(null, document.title, window.location.origin + urlFilterPlayers + urlFilterGenres + urlFilterFree + urlFilterRemote);
    }
});

// Create new wheel object specifying the parameters at creation time.
let theWheel = new Winwheel({
    'textFontSize' : 22,    // Set font size as desired.
    'responsive'   : true,  // This wheel is responsive!
    'animation' :           // Specify the animation to use.
    {
        'type'     : 'spinToStop',
        'duration' : 5,
        'spins'    : 10,
        'callbackFinished' : alertDone,
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

function alertDone(indicatedSegment)
{
    // Do basic alert of the segment text.
    // You would probably want to do something more interesting with this information.
    applause.play();
    Swal.fire({
            title: "<strong>"+indicatedSegment.text+"</strong>",
            iconHtml: '<i class="fa-solid fa-dice"></i>',
            showCloseButton: false,
            focusConfirm: false,
            confirmButtonText: `<i class="fa fa-repeat"></i> Spin Again?`,
            confirmButtonAriaLabel: "Thumbs up, great!",
            showCancelButton: true,
            showDenyButton: true,
            denyButtonText: `<i class="fa fa-repeat"></i>Remove Game & Spin Again?`
            }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                Randomizer();
            } else if (result.isDenied) {
                Randomizer(false, theWheel.getIndicatedSegment().text);
            } else {
                jQuery("#randomizer").hide();
            };
            });
}

let wheelPower    = 0;
let wheelSpinning = false;

jQuery("#random").click(function(e) {
    Randomizer(true);
})

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

    // Swal.fire({
    //     title: "<strong>"+jQuery('#games tr:visible:eq('+rand+') td:eq(0)').text()+"</strong>",
    //     iconHtml: '<i class="fa-solid fa-dice"></i>',
    //     html: 
    //     `<div class="randomgame">
    //       <span><strong>Owned By</strong></span><span>`+jQuery('#games tr:visible:eq('+rand+') td:eq(1)').html()+`</span>
    //       <span><strong>Genre:</strong> `+jQuery('#games tr:visible:eq('+rand+') td:eq(3)').html()+`</span>
    //       <span><strong>Platforms:</strong>  `+jQuery('#games tr:visible:eq('+rand+') td:eq(2)').html()+`</span>
    //       <span><strong>Players:</strong>  `+jQuery('#games tr:visible:eq('+rand+') td:eq(4)').html()+`-`+jQuery('#games tr:visible:eq('+rand+') td:eq(5)').html()+`</span>
    //       </div>`,
    //     showCloseButton: true,
    //     focusConfirm: false,
    //     confirmButtonText: `
    //       <i class="fa fa-repeat"></i> Spin Again?
    //     `,
    //     confirmButtonAriaLabel: "Thumbs up, great!",
    //   }).then((result) => {
    //     /* Read more about isConfirmed, isDenied below */
    //     if (result.isConfirmed) {
    //         jQuery("#random").click();
    //     };
    //   });
}