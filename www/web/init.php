<?php
    require_once '/vendor/autoload.php';
    $loader = new \Twig\Loader\FilesystemLoader('/app/web/templates');
    $twig = new \Twig\Environment($loader);

    require_once '/app/inc/config.php';
    require_once '/app/inc/functions.php'; 

    $twig->addGlobal('backend', BACKEND);

    session_start();

    $script_name = basename($_SERVER['PHP_SELF']);
?>