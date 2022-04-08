<?php

$db_login = 'mysql';
$db_pass = '';
$db_name = 'sran';
$db_table = 'hueta_pars';
$db_host = 'localhost';

try {
    $dbh = new PDO('mysql:host=' . $db_host . ';dbname=' . $db_name, $db_login, $db_pass);
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}

$connect = mysqli_connect($db_host,$db_login,$db_pass,$db_name);