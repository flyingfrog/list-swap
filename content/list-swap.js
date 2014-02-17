
window.onload = function() {
    if(sniffFeatures && sniffFiles && sniffFiles()) {
	document.getElementById("file_warning").style.display="none";
    }

    if(sniffFeatures()) {
	document.getElementById("feature_warning").style.display="none";
    }
}
