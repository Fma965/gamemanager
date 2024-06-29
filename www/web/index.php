<?php
    require_once 'init.php';
    $_SESSION['logged_in'] = true;
    $_SESSION['admin'] = (in_array("Owner", explode("|",$_SERVER['HTTP_X_AUTHENTIK_GROUPS'])) ? true : false);
    $_SESSION['userData'] = [ 'name'=>$_SERVER['HTTP_X_AUTHENTIK_USERNAME'] ];

        echo $twig->render('index.html.twig', [
            'userData' => isset($_SESSION['userData']) ? $_SESSION['userData'] : [],
            'players' => GetPlayers(),
            'genres' => GetGenres(),
            'modes' => GetModes()
        ]);
?>