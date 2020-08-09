<?php
  $f_json = 'orders.json';
  $json = file_get_contents("$f_json");
  if($_POST) {
    $draw = $_POST['draw'];
    $json = json_decode($json, true);
    $json['draw'] = $draw;
    $json = json_encode($json);
  }
echo $json;
?>