/*list-swap.js 0.0.0
Part of the List-Swap project.
Copyright (c) 2013 by Nathan Gerratt, ngerratt@gmail.com
*/

function selectOption(option)
{
    switch(option)
    {
    case "start_hash":
	document.getElementById("main_menu").style.display="none";
	document.getElementById("main_hash").style.display="inline";
	break;
	
    case "start_combine":
	document.getElementById("main_menu").style.display="none";
	document.getElementById("main_combine").style.display="inline";
	break;
	
    default:
    }
}

function hash_load_file()
{
    var filename = document.getElementById("hash_input_file").files[0];
    if(filename == null || filename == undefined || filename.name == null) {
	return;
    } 
    else
    {
	processCSV(filename, function(results) { hash_populate_form(results);},
		   function(evt) { alert ("Couldn't load file: " + evt)});
	
    }
}

function processCSV(fileName, success, failure)
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
    var lines = fileBlob.split(/\r\n|\n/g); // start by breaking into hunks. I've seen files on Windows using Unix line endings, so work with either.
    if(lines.length <= 1) {//One line or empty list?
	failure("One or no lines detected in file. Is this a CSV file?");
	return;
    }

    var contents = [];
    for (var currLine in lines)
    {
	if(lines[currLine].indexOf('"') == -1) { //no quotes, so no escaping necessary.
	    contents.push(lines[currLine].split(','));
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
	    }
	    else if(firstQuote >= 0){//Let's handle quotes!
		if(firstQuote != 0) { //We have an item containing quotes - but not the leading item. Throw an error - if we find any program that
				      //generates something like this, we can code special cases.
		    failure("Found an entry with quote not leading on entry on line " + (parseInt(currLine)+1) + " - not valid CSV!");
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
	contents.push(arrayBuild);
    }
    success(contents);    
}
	
function hash_populate_form (results)
{
    //Takes the contents of array<string>[][] results and puts the first row into output_fields

    if(results.length < 2) {//A single row
	alert("only one row!");
	return;
    }
    var email_field = document.getElementById("email_field");
    var output_fields = document.getElementById("output_fields");
    output_fields.options.length = 0;
    email_field.options.length = 0;
    output_fields.options.length = results[0].length;
    email_field.options.length = 0;
    for(var i in results[0]) {
	output_fields.options[i] = new Option(results[0][i], i);
	email_field.options[i] = new Option(results[0][i], i);
    }
}