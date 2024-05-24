<?php
	if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
		die('Direct access not allowed');
		exit;
	};

	// Website Configuration
	define('HOST', 						'');
	define('BACKEND',					'');
	define('BACKEND_AUTH',				'Bearer xxxxxxxxxxxxxxxxxxxxxx');

	// Debug
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

?>
