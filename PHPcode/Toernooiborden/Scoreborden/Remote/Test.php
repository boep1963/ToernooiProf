<?php
//test figuur als submit

$Code = "1002_CRJ@#";


?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>test</title>
</head>
<body>
<form name="test" method="post" action="Test02.php">
<input type="image" src="Slot.jpg">
<input type="hidden" name="code" value="<?php print("$Code");?>">

</form>
</body>
</html>