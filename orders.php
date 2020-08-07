<?php
  $f_json = 'orders.json';
  $json = file_get_contents("$f_json");
  require( 'plugins/datatables-server-side/ssp.class.php' );
echo $json;
?>