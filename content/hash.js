/*hash.js
  Contains functions specific to hash.html
  (c) 2014, Nathan Gerratt
*/

window.onload = function () {
    var tooltips = document.getElementsByClassName("tooltip");
    for (var i=0; i<tooltips.length; i++)
    {
	var currTooltip = tooltips[i];

	currTooltip.onmouseover = function () {
	    document.getElementById(this.id + "_content").style.display = "block";
	}

	currTooltip.onmouseout = function () {
	    document.getElementById(this.id + "_content").style.display = "none";
	}
    }
} 

function selectOption(option)
{
    switch(option)
    {
    case "start_hash":
	document.getElementById("main_menu").style.display="none";
	document.getElementById("main_hash").style.display="block";
	break;
	
    case "start_combine":
	document.getElementById("main_menu").style.display="none";
	document.getElementById("main_combine").style.display="inline";
	setStatusBar("Start by uploading the two files you'd like to combine.");
	break;

    case "hash_process_file":
	prepareHashArray();
	break;

    default:
    }
}


function hashLoadFile()
{
    var filename = document.getElementById("hash_input_file").files[0];
    if(filename == null || filename == undefined || filename.name == null) {
	setStatusBar("Please select a file to continue.");
	return;
    } 
    else
    {
	prepareDecodeCSV(filename, 
			 function(results) { hashPopulateForm(results);
					     document.getElementById("options_hider").style.display="none";
					     setStatusBar("Choose options for hashing.");},
			 function(evt) { setStatusBar ("Couldn't load file: " + evt)});
    }
}

	
function hashPopulateForm (results)
{
    //Takes the contents of array<string>[][] results and puts the first row into output_fields

    var email_field = document.getElementById("email_field");
    var output_fields = document.getElementById("output_fields");
    output_fields.options.length = 0;
    email_field.options.length = 0;
    output_fields.options.length = results[0].length;
    email_field.options.length = 0;
    for(var i=0; i<results[0].length; i++) {
	output_fields.options[i] = new Option(results[0][i], i, true, true);
	email_field.options[i] = new Option(results[0][i], i, true, true);
    }
}


function prepareHashArray()
{
    var caseOption;
    var emailCaseField = document.getElementsByName("email_case");
    for (var i=0; i<emailCaseField.length; i++) {
	if(emailCaseField[i].checked) {
	    caseOption=emailCaseField[i].value;
	    break;
	}
    }

    var hashMethod;
    var hashMethodField = document.getElementsByName("hash_method");
    for(var i=0;i<hashMethodField.length; i++) {
	if(hashMethodField[i].checked) {
	    hashMethod = hashMethodField[i].value;
	}
    }

    var firstRowHeaders = document.getElementById("first_row_names").checked;
    var columnToHash = document.getElementById("email_field").value;

    options["fieldsToOutput"] = [];
    var outputFieldChooser = document.getElementById("output_fields").options;
    for(var i=0; i<outputFieldChooser.length; i++) { 
	if(outputFieldChooser[i].selected) {
	    options["fieldsToOutput"].push(outputFieldChooser[i].value);
	}	
    }
    options["fieldsToOutput"].push(options["hashField"]);
    
    var prependValue = document.getElementById("prepend_text").value;
    var postpendValue = document.getElementById("postpend_text").value;
    
    setStatusBar("Hashing file values...");
    //We've set up the values - let's hash them!
    hashArray(hashMethod, columnToHash, firstRowHeaders, caseOption, prependValue,
	      postpendValue, options["fieldsToOutput"],0, function() {setStatusBar("Hashing complete. Preview or save the output.")
							   document.getElementById("output_hider").style.display="none";});
    
}

