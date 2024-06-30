<?php
    require_once '/app/inc/config.php';
    require_once '/app/inc/functions.php'; 

    $all_players[] = ["id"=>999, "name"=>"Free", "avatar_url"=>""];

    $url = BACKEND . "/items/games?fields=*.*.id,*.*.name,*.*.avatar_url";			
    $json = get_data($url,BACKEND_AUTH);
    foreach($json['data'] as $game) {
        $game_owned_by = [];
        $platforms = [];

        if($game['is_free']) {
            $game_owned_by = $all_players;
        } else {
            foreach($game['owned_by'] as $owned_by) {
                $game_owned_by[] = [
                    "id"=>$owned_by['players_id']['id'],
                    "name"=>$owned_by['players_id']['name'],
                    "avatar_url"=>$owned_by['players_id']['avatar_url']
                ];
            }  
        }

        foreach($game['platform'] as $platform) {
            $platforms[] = $platform['platforms_id']['name'];
        }  
        
        $output['data'][] = [
            "name"=>$game['name'],
            "owned_by"=>$game_owned_by,
            "platforms"=>$platforms,
            "genre"=>$game['genre'],
            "mode"=>$game['mode'],
            "min_players"=>$game['min_players'],
            "max_players"=>$game['max_players'],
            "is_free"=>$game['is_free'],
            "remote_play_together"=>$game['remote_play_together'],
            "steam_appid"=>$game['steam_appid'],
            "notes"=>$game['notes'],
            "link"=>$game['link'],
        ];
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($output['data'],true);
?>