/*list-swap.js 0.0.0
Part of the List-Swap project.
Copyright (c) 2013 by Nathan Gerratt, ngerratt@gmail.com
*/
var storageArray = [];
var options = {};

/*Controller*/

function sniffFeatures () {
    if(document.getElementsByClassName &&
       new FileReader() && 
       new Blob()) {
	return true;
    }
    else {
	return false;
    }
}

function setStatusBar (message)
{
    var messageBox = document.getElementById("status");
    messageBox.innerHTML = message;
}

function previewResults() {
    var resultsNum = document.getElementById("preview_num").value;
    if(resultsNum == "") {
	resultsNum = 10;
    }
    
    var table = document.getElementById("hash_preview_table");

    table.innerHTML = "";
    for(var i=0; i<=resultsNum && i < storageArray.length; i++)
    {
	var row = table.insertRow(-1);
	for (var j=0; j<options["fieldsToOutput"].length; j++) {
	    var cell = row.insertCell(-1);
	    cell.innerHTML = storageArray[i][ options["fieldsToOutput"][j] ];
	    cell.className = "preview_cell";
	}
    }
    document.getElementById("preview_container").style.display="block";
}




/*Model*/

function prepareDecodeCSV(fileName, success, failure)
{
    //Takes input filename, calls success with argument of an array[][] decoded from FileName or calls failure with error message.
    
    if(fileName == null || fileName.name == "" ||
       success == null)
    {
	if(failure != null) {
	    failure("Missing file name or success function");
	}
	return;
    }

    var reader = new FileReader();
    reader.onerror = function(evt) {
	failure(evt);
    }
    reader.onload = function() {
	decodeCSV(reader.result, success, failure);
    }
    setStatusBar("Loading file...");
    reader.readAsText(fileName);
}

function decodeCSV(fileBlob, success, failure)
{

    //Given input text in fileBlob, calls success with an array[][] decoded from fileBlob or failure with error message.

	/*CSV SYNTAX (RFC 4180):
	  -Each record goes on its own line
	  -Spaces are significant
	  -Fields may or may not be enclosed by quotes, but quotes are first and last elements in field
	  -Fields containing quotes may contain commas or quotes
	  -Commas inside quotes are part of the field
	  -Internal quotes are escaped by doubling
	  
	  TODO: Records split across lines.
	*/
    if(fileBlob == null || fileBlob == undefined) {
	failure ("Input file not correctly read");
	return;
    }
    var lines = fileBlob.split(/\r\n|\n|\r/g); // start by breaking into hunks. I've seen files on Windows using Unix line endings, so work with either.
    if(lines.length <= 1) {//One line or empty list?
	failure("One or no lines detected in file. Is this a CSV file?");
	return;
    }

    storageArray = [];
    options["hashField"] = -1;
    for (var currLine=0; currLine < lines.length; currLine++)
    {
	if(lines[currLine] == "" && currLine == lines.length-1) { //Last  line of the file is terminated with \n; don't hash that
	    continue;
	}

	if(lines[currLine].indexOf('"') == -1) { //no quotes, so no escaping necessary.
	    storageArray.push(lines[currLine].split(','));
	    if(storageArray[storageArray.length -1].length >= options["hashField"])
	    {
		options["hashField"] = storageArray[storageArray.length-1].length;
	    }
	    continue;
	}
	
	var currString = lines[currLine];
	var arrayBuild = [];
	while(currString != "")
	{
	    var firstComma = currString.indexOf(",");
	    var firstQuote = currString.indexOf('"');

	    if(firstComma >=0 && (firstQuote == -1 || firstComma < firstQuote)) { //The first entry in currString doesn't have quotes.
		arrayBuild.push(currString.substr(0,firstComma));
		currString = currString.substr(firstComma+1);				
	    } else if(firstComma == -1 && firstQuote == -1) { //There's just one column in this row
		arrayBuild.push(currString);
		break;		
	    } else if(firstQuote >= 0){//Let's handle quotes!
		if(firstQuote != 0) { //We have an item containing quotes - but not the leading item. Throw an error - if we find any program that
		                      //generates something like this, we can code special cases.
		    failure("Found an entry with quote not leading on entry on line " + (parseInt(currLine)+1) + " (not valid CSV?)");
		    return;
		}
		
		var secondQuote = currString.indexOf('"', firstQuote+1);
		if(secondQuote == -1) {
		    failure("Parse error: found a single quote on line " + (parseInt(currLine)+1) + ".");
		    return;
		}
		
		var insideQuotes = true;
		firstQuote = currString.indexOf('"', 1);
		while(insideQuotes)
		{
		    secondQuote =  currString.indexOf('"', firstQuote+1);

		    //secondQuote is a doubled quote
		    if(secondQuote == firstQuote + 1) 
		    {
			currString = currString.substr(0,secondQuote)+currString.substr(secondQuote+1);//consume the second quote
			firstQuote = currString.indexOf('"',secondQuote+1);
		    }
		    else//secondQuote isn't doubled - so it must be the end of this field.
		    {
			insideQuotes = false;
		    }
		}
		arrayBuild.push(currString.substr(1, firstQuote-1))
		currString = currString.substr(firstQuote+2);//Consume the second quotation mark and the trailing comma
	    }
	    else { //We are in the last item in the string, which contains neither quotes nor commas. Push everything and quit the loop.
		arrayBuild.push(currString);
		break;
	    }
	}
	storageArray.push(arrayBuild);
	if(arrayBuild.length >= options["hashField"])
	    {
		options["hashField"] = arrayBuild.length;
	    }
    }
    if(storageArray.length == 0) {
	failure("The input file was empty or unreadable. Please try again.");
	return;
    }
    success(storageArray);    
}


function hashArray(hashMethod, columnToHash, firstRowHeaders, 
		   caseOption, prependValue, postpendValue, outputFields,
		   startIndex, success, numRecords)
{
    if(startIndex >= storageArray.length) {
	success();
	return;
    }

    /*We'll calculate how many records to run at any given time. If we
     * don't get one, start with something small.*/
    if(isNaN (numRecords)) {
	numRecords = 500;
    }
    var hashFunction;
    var caseFunction;
    var prePostAdder;

    switch (hashMethod) {
    case "MD5": hashFunction = CryptoJS.MD5; break;
    case "SHA1": hashFunction = CryptoJS.SHA1; break;
    };

    switch (caseOption) {
    case "upper":
	caseFunction = function(str) {return str.toUpperCase();};
	break;
    case "lower":
	caseFunction = function(str) {return str.toLowerCase();};
	break;
    case "keep":
	caseFunction = function(str) {return str;};
	break;
    };

    prePostAdder = function (str) {return prependValue + str + postpendValue};
    if(startIndex == 0 && firstRowHeaders)
    {
	storageArray[0][ options["hashField"] ] = storageArray[0][columnToHash] + "_HASHED";
	startIndex = 1;
    }
    
    var endIndex = startIndex + numRecords;
    if(endIndex > storageArray.length) {
	endIndex = storageArray.length;
    }
    
    var startTime = +new Date();

    for(var i=startIndex; i<endIndex; i++) {
	var hashedValue = hashFunction(prePostAdder(caseFunction(storageArray[i][columnToHash]))).toString();
	storageArray[i][ options["hashField"] ]=hashedValue;
    }

    var stopTime = +new Date();
    /*Our goal is 75 ms per invocation*/
    var runtimeGoal = 75;
	
    if(stopTime - startTime > (runtimeGoal * 1.1)) {
	numRecords = Math.floor(numRecords * .9);
    }
    else if( stopTime - startTime < (runtimeGoal * .9)) {
	numRecords = Math.floor(numRecords * 1.1);
    }
    
    //Call ourselves after we do a little work, to not lock up the browser
    setTimeout(function() {hashArray(hashMethod, columnToHash,firstRowHeaders,
				     caseOption, prependValue, postpendValue, outputFields,
				     endIndex, success, numRecords)}, 25);
    setStatusBar("Processed " + endIndex + " of " + (storageArray.length-1).toString() + " records. (" + Math.floor(endIndex / storageArray.length * 100) + "%)");
}

function hashSaveOutput() {
    storageArray.toString = function () {
	var retVal = "";

	for (var i = 0; i<this.length; i++)
	{
	    var currRow = "";
	    for(var j=0; j<options["fieldsToOutput"].length; j++)
	    {
		var currItem = this[i][ options["fieldsToOutput"][j] ];
		if(currItem == undefined)  {
		    alert(this[i]);
		}
		
		if(j > 0) {
		    currRow += ",";
		}
		var needsWrapping = false;
		var commaLoc = currItem.indexOf(",");
		if(commaLoc >= 0) {
		    needsWrapping = true;
		}

		var quoteLoc = currItem.indexOf('"');
		if(quoteLoc >= 0) {
		    needsWrapping = true;
		    currItem = currItem.replace (/"/g, '""');
		}
		if(needsWrapping) {
		    currRow += '"' + currItem + '"';
		}
		else { 
		    currRow += currItem;
		}
	    }
	    retVal += currRow + "\n";
	}
	return retVal;
    }

    var blob = new Blob ([storageArray.toString()], {type: "text/plain"});
    
    saveAs( blob, "hashed.csv");
}