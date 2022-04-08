<?php
    header("Content-Type: text/plain; charset=utf-8");
    error_reporting(E_ALL);
    ini_set('display_errors', '1');

    require_once 'db_conf.php';

    $stmt = $dbh->query("				
                        SELECT *
                        FROM hueta_pars
                        WHERE region is NULL
        ");



$records = array();

while ( $row = $stmt->fetch() )
{
    
$parsing_results = site_parser($row['page']);
// var_dump($parsing_results);
$n = $parsing_results['content'];

$formattedContent = htmlspecialchars($n);
// var_dump($formattedContent);

$nameFull = strpos($formattedContent,'Полное наименование'); //position
$NameBezStart = substr($formattedContent,$nameFull + 164);
$shortName = strpos($NameBezStart, 'Cокращенное наименование');
$nameCorrect = substr($NameBezStart,0,$shortName - 142);
if (strlen($nameCorrect) > 200) {
    $nameCorrect = NULL;
}

$regionFull = strpos($formattedContent,"Регион:"); //position
$regionBezStart = substr($formattedContent,$regionFull + 78);
$regionINN = strpos($regionBezStart, 'ИНН:');
$regionCorrect = substr($regionBezStart,0,$regionINN - 137);
if (strlen($regionCorrect) > 200) {
    $regionCorrect = NULL;
}

$addressFull = strpos($formattedContent,"Адрес места нахождения:"); //position
$addressBezStart = substr($formattedContent,$addressFull + 115);
$addressEnd = strpos($addressBezStart, 'Телефон:');
$addressCorrect = substr($addressBezStart,0,$addressEnd - 141);
if (strlen($addressCorrect) > 500) {
    $addressCorrect = NULL;
}

$phoneFull = strpos($formattedContent,"Телефон:"); //position
$phoneBezStart = substr($formattedContent,$phoneFull + 87);
$phoneEnd = strpos($phoneBezStart, 'Факс:');
$phoneCorrect = substr($phoneBezStart,0,$phoneEnd -141);
if (strlen($phoneCorrect) > 200) {
    $phoneCorrect = NULL;
}
echo $sql;
// $status = $parsing_results['status'];
var_dump($row);
// if ( !$parsing_results['content'] )
//     $sql = "UPDATE $db_table SET status = '$status' WHERE id = '{$row['id']}'";
// var_dump($row);

$sql = "UPDATE hueta_pars
        SET 
            name = '$nameCorrect',
            region = '$regionCorrect',
            address = '$addressCorrect',
            phone = '$phoneCorrect'
        WHERE id = '{$row['id']}'";




$dbh->prepare($sql)->execute();


//print_r($dbh->errorInfo());
// sleep(1);
}


function site_parser( $url_to_load = null, $proxy_addr = null, $proxy_type = null )
{
    // if ( !$url_to_load )
    //     return false;

    $response = array(
        'status' => null,
        'content' => null,
    );

    $headers = array
    (
        'Connection: close',
        'Cache-Control: max-age=0',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        'Accept-Encoding: gzip, deflate, br',
        'Accept-Charset: windows-1251,utf-8;q=0.7,*;q=0.7',
        'User-Agent: Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36'
    ); //for more agents see http://ru.wikipedia.org/wiki/User_Agent

    $f = fopen(dirname(__FILE__) . '/errors.txt', 'a+');

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ( $proxy_type && $proxy_addr )
        switch ( $proxy_type ) {
            case 'HTTP':
                curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
                break;
            case 'HTTPS':
                curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
                curl_setopt($ch, CURLOPT_HTTPPROXYTUNNEL, 1);
                break;
            case 'SOCKS4':
                curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS4);
                break;
            case 'SOCKS5':
                curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5);
                break;
            default:
                curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
        }

    if ($proxy_addr)
        curl_setopt($ch, CURLOPT_PROXY, $proxy_addr);

    curl_setopt($ch, CURLOPT_URL, $url_to_load);
    //curl_setopt($ch, CURLOPT_FAILONERROR, 1);
    curl_setopt($ch, CURLOPT_ENCODING, 'gzip,deflate');
    curl_setopt($ch, CURLOPT_STDERR, $f);
    curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);// non-cacheable
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // return into a variable
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8000);
    curl_setopt($ch, CURLOPT_TIMEOUT, 80); // times out after 9s
    curl_setopt($ch, CURLOPT_COOKIEJAR, '/tmp/cookies.txt');
    curl_setopt($ch, CURLOPT_COOKIEFILE, '/tmp/cookies.txt');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    $linkcontents = curl_exec($ch);
    $error_reason = curl_error($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $header = substr($linkcontents, 0, $header_size);
    $linkcontents = substr($linkcontents, $header_size);

    //echo $header;
    //echo $linkcontents;
    //exit;

    if ($error_reason) {
        //echo "error: " . $error_reason;
    }

    curl_close($ch);

    fclose($f);


    if ( !$header && $error_reason )
       return array(
            'status' => 0,
            'content' => null,
        );

    if ( strpos( $header,'HTTP/1.1 20' ) !== false )
        $response['status'] = '200';
    else
        $response['status'] = $http_code;

    switch ( detect_cyr_charset($linkcontents) )
    {
        case "w":  //WIN-1251
            $linkcontents = iconv("CP1251", "UTF-8//IGNORE", "$linkcontents");
            break;
        case "m": //mac
            $linkcontents = iconv("MAC", "UTF-8//IGNORE", "$linkcontents");
            break;
        case "k":
            $linkcontents = iconv("KOI8-R", "UTF-8//IGNORE", "$linkcontents");
            break;
        case "d":
            $linkcontents = iconv("CP866", "UTF-8//IGNORE", "$linkcontents");
            break;
    }

    $search = array(
        "'&(amp|#38);'i",
        "'&(lt|#60);'i",
        "'&(gt|#62);'i",
        "'&(nbsp|#160);'i",
        "'&(iexcl|#161);'i",
        "'&(cent|#162);'i",
        "'&(pound|#163);'i",
        "'&(copy|#169);'i",
        "'&(#45);'i",
        "'&(#40);'i",
        "'&(#41);'i",
    );

    $replace = array(
        "&",
        "<",
        ">",
        " ",
        iconv("CP1251", "UTF-8", chr(161)),
        iconv("CP1251", "UTF-8", chr(162)),
        iconv("CP1251", "UTF-8", chr(163)),
        iconv("CP1251", "UTF-8", chr(169)),
        iconv("CP1251", "UTF-8", chr(150)),
        iconv("CP1251", "UTF-8", chr(40)),
        iconv("CP1251", "UTF-8", chr(41)),
    );

    $urltext = $linkcontents;

    $urltext = preg_replace($search, $replace, $urltext);

    if ( $urltext )
        $response['content'] = $urltext;
    else
        $response['status'] = '404';

    return $response;
}


function detect_cyr_charset( $str = null )
{
    if (!$str)
        return false;

    @define('LOWERCASE', 3);
    @define('UPPERCASE', 1);
    $charsets = array(
        'k' => 0,
        'w' => 0,
        'd' => 0,
        'i' => 0,
        'm' => 0
    );
    for ( $i = 0, $length = mb_strlen($str); $i < $length; $i++ )
    {
        $char = ord($str[$i]);
        //non-russian characters
        if ($char < 128 || $char > 256) continue;
        //CP866
        if (($char > 159 && $char < 176) || ($char > 223 && $char < 242))
            $charsets['d'] += LOWERCASE;
        if (($char > 127 && $char < 160)) $charsets['d'] += UPPERCASE;
        //KOI8-R
        if (($char > 191 && $char < 223)) $charsets['k'] += LOWERCASE;
        if (($char > 222 && $char < 256)) $charsets['k'] += UPPERCASE;
        //WIN-1251
        if ($char > 223 && $char < 256) $charsets['w'] += LOWERCASE;
        if ($char > 191 && $char < 224) $charsets['w'] += UPPERCASE;
        //MAC
        if ($char > 221 && $char < 255) $charsets['m'] += LOWERCASE;
        if ($char > 127 && $char < 160) $charsets['m'] += UPPERCASE;
        //ISO-8859-5
        if ($char > 207 && $char < 240) $charsets['i'] += LOWERCASE;
        if ($char > 175 && $char < 208) $charsets['i'] += UPPERCASE;
    }
    arsort($charsets);
    return key($charsets);
}

?>

=