
window.onload = function() {
    if(sniffFeatures) {
	document.getElementById("file_warning").style.display="none";
    }

    if(sniffFeatures()) {
	document.getElementById("feature_warning").style.display="none";
    }
}
