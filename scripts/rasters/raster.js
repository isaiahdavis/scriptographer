// raster.js is a base script for all the raster scripts
// that take a selection of a raster and a path object
// as a starting point for some raster processing
// the only thing that has to be defined is the drawDot 
// function
var raster = null;
var dot = null;
var sel = null;

function initRaster() {
	sel = activeDocument.getSelectedArt();
	for (var i = 0; i < sel.length; i++) {
		obj = sel[i];
		if (raster == null && obj instanceof Raster) raster = obj;
		else if (dot == null) dot = obj;
		if (raster != null && dot != null) break;
	}
	return (raster != null && dot != null);
}

function executeRaster() {
	var c = 0;
	var group = new Group();
	dot = dot.clone();
	var m = Matrix.getTranslateInstance(dot.bounds.center.multiply(-1));
	dot.transform(m);
//	var img = raster.getImage();
	for (var x = 0; x < raster.width; x++) {
		for (var y = 0; y < raster.height; y++) {
//			var c = new java.awt.Color(img.getRGB(x, y));
//			var col = 1 - (0.3 * c.red + 0.59  * c.green + 0.11 * c.blue) / 255;
			var radius = raster.getPixel(x, y).convert(Color.TYPE_GRAY).gray;
			var obj = createDot(x, raster.height - y, dot, radius);
			if (obj) group.append(obj);
		}
	}
	dot.remove();
	for (var i = 0; i < sel.length; i++) {
		sel[i].selected = false;
	}
	return group;
}