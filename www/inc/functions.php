<?php
	if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
			die('Direct access not allowed');
			exit;
	};

	function get_data($url, $token)
	{
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_USERAGENT,'F9Gamez API - v1.0');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: " . $token, 'Accept: application/json'));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
		$data = curl_exec($ch);
		curl_close($ch);
		$data = json_decode($data,true);
		return $data;
	}

	function GetPlayers() 
	{
		$url = BACKEND . "/items/players?fields=id,name,avatar_url";		
        $json = get_data($url,BACKEND_AUTH);
		return $json['data'];
	}

	function GetGenres() 
	{
		$url = BACKEND . "/items/genres?fields=name";		
        $json = get_data($url,BACKEND_AUTH);
		return $json['data'];
	}

	
?>
