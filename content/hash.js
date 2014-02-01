/*hash.js
  Contains functions specific to hash.html
  (c) 2014, Nathan Gerratt
*/

window.onload = function () {
    var tooltips = document.getElementsByClassName("main_hash_options_tooltip");
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