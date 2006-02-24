function init() {
count=0;
timer=null;
cur_letter=-1;
//number of steps / letter
y=3; a=3; r=3; d=3; s=2; e=3; b=3; c=2; t=3; f=3; g=3; h=3; i=2;
j=2; k=3; l=2; m=3; n=3; o=2; p=3; q=3; r=3; u=3; v=2; w=3; x=3; z=2;
word=[""];
pasted=[""];
}

function options() {
	init();
    theword = prompt("Script Lettering Tool", {type: "string", value: "word", title: "word: ", width: 100})[0];
    checkValues();
}

function checkValues(){
	charcount=0;
	for (i = 0; i <= theword.length-1; i++){
		thechar=theword.charAt(i)
		if(thechar!=" "){
			word[charcount]=thechar;
			print(word);
			charcount++
		}
	}
}

function moveBy(layer, child, seg, disx, disy){
	layers[layer].children[child].segments[seg].point.x+= disx; 
	layers[layer].children[child].segments[seg].point.y+= disy; 
	layers[layer].children[child].segments[seg].handleIn.x+= disx; 
	layers[layer].children[child].segments[seg].handleIn.y+= disy; 
	layers[layer].children[child].segments[seg].handleOut.x+= disx; 
	layers[layer].children[child].segments[seg].handleOut.y+= disy; 
 }

function moveSegsBy(layer,child,segs,disx,disy){
	layer="editing";
	for (i = 0; i <= segs.length-1; i++){
		pasted.children[child].segments[segs[i]].point.x-= disx; 
		pasted.children[child].segments[segs[i]].handleIn.x-= disx;
		pasted.children[child].segments[segs[i]].handleOut.x-= disx;
		pasted.children[child].segments[segs[i]].point.y-= disy;  
		pasted.children[child].segments[segs[i]].handleIn.y-= disy; 
		pasted.children[child].segments[segs[i]].handleOut.y-= disy;
	}
}

function moveSegsTo(layer,child,segs,x,y){
	for (i = 0; i <= segs.length-1; i++){
			layers[layer].children[child].segments[segs[i]].point.x= x; 
			layers[layer].children[child].segments[segs[i]].handleIn.x= x;
			layers[layer].children[child].segments[segs[i]].handleOut.x= x;
			layers[layer].children[child].segments[segs[i]].point.y= y;  
			layers[layer].children[child].segments[segs[i]].handleIn.y= y; 
			layers[layer].children[child].segments[segs[i]].handleOut.y= y;
	}
 }
 
function copyPasteElements(sourcelayer){
	tocopy=layers[sourcelayer].children[0].clone();
	tocopy.moveBefore(layers["editing"].children[layers["editing"].children.length-1]);
	pasted=tocopy;
}

 function moveObjectsMouse(){
	mouseX=mousePoint.x;
 	mouseY=mousePoint.y;
	var fMatrix = new Matrix(1.0, 0, 0, 1.0,pasted.bounds[2],pasted.bounds[3])
	var matrix = new Matrix(1.0, 0, 0, 1.0, (fMatrix[4]*-1)+mouseX, (fMatrix[5]*-1)+mouseY);
	pasted.transform(matrix);
 }

function font(){
	if(count==0){
		moveObjectsMouse();
	}else{
		doLetter();
	}
}

function doLetter(){
	switch (letter){
	case "y":
		switch (count){
 			case 1:
				moveSegsBy("y", 0, [3,7],0,diffY);
				break;
			case 2:
				moveSegsBy("y", 0, [0,1,2],0,diffY);
				break;
			case 3:
				moveSegsBy("y", 0, [4,5,6],0,diffY);
				break;
		}
	break;
	case "a":
		switch (count){
			case 1:
				moveSegsBy("a", 0, [5,4,3],0,diffY);
				break;
			case 2:
				moveSegsBy("a", 0, [7,8,9],0,diffY);
				break;
			case 3:
				moveSegsBy("a", 0, [2,1,0],0,diffY);
				break;
		}
	break;
	case "d":
		switch (count){
			case 1:
				moveSegsBy("d", 0, [0,1,2,3,4,5],0,diffY);
				moveSegsBy("d", 1, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("d", 1, [1],0,diffY);
				break;
			case 3:
				moveSegsBy("d", 0, [0,1,2],0,diffY);
				break;
		}
	break;
	case "s":
		switch (count){
			case 1:
				moveSegsBy("s", 0, [0,1,2,3],0,diffY);
				break;
			case 2:
				moveSegsBy("s", 0, [4,5,6,7],0,diffY);
				break;
		}
	break;
	case "e":
		switch (count){
			case 1:
				moveSegsBy("e", 0, [7,6,5],0,diffY);
				break;	
				case 2:
				moveSegsBy("e", 0, [2,3,4],0,diffY);
				break;	
			case 3:
				moveSegsBy("e", 0, [0,1],0,diffY);
				break;	
		}
	break;
	case "b":
		switch (count){
			case 1:
				moveSegsBy("b", 1, [0,1,2,3,4,5],0,diffY);
				moveSegsBy("b", 0, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("b", 0, [1],0,diffY);
				break;
			case 3:
				moveSegsBy("b", 1, [0,1,2],0,diffY);
				break;
		}
	break;
	case "c":
		switch (count){
			case 1:
				moveSegsBy("c", 0, [0,1,2],0,diffY);
				break;
			case 2:
				moveSegsBy("c", 0, [3,4,5],0,diffY);
				break;
		}
	break;
	case "t":
		switch (count){
			case 1:
				moveSegsBy("t", 0, [0,1],0,diffY);
				break;
			case 2:
				moveSegsBy("t", 0, [2],0,diffY);
				break;
			case 3:
				moveSegsBy("t", 1, [0,1],0,diffY);
				break;
		}
	break;
	case "f":
		switch (count){
			case 1:
				moveSegsBy("f", 0, [3,2,1],0,diffY);
				break;
			case 2:
				moveSegsBy("f", 0, [0],0,diffY);
				break;
			case 3:
				moveSegsBy("f", 1, [0,1],0,diffY);
				break;
		}
	break;
	case "g":
		switch (count){
			case 1:
				moveSegsBy("g", 0, [2,1,0],0,diffY);
				break;
			case 2:
				moveSegsBy("g", 0, [3],0,diffY);
				moveSegsBy("g", 1, [0,1,2,3,4,5],0,diffY);
				break;
			case 3:
				moveSegsBy("g", 1, [3,4,5],0,diffY);
				break;
		}
	break;
	case "h":
		switch (count){
			case 1:
				moveSegsBy("h", 0, [0,4],0,diffY);
				moveSegsBy("h", 1, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("h", 1, [1],0,diffY);
				break;
			case 3:
				moveSegsBy("h", 0, [1,2,3],0,diffY);
				break;
		}
	break;
	case "i":
		switch (count){
			case 1:
				moveSegsBy("i", 0, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("i", 0, [1],0,diffY);
				moveSegsBy("i", 1, [0],0,diffY);
				break;
		}
	break;
	case "j":
		switch (count){
			case 1:
				moveSegsBy("j", 0, [0,1,2],0,diffY);
				break;
			case 2:
				moveSegsBy("j", 0, [3],0,diffY);
				moveSegsBy("j", 1, [0],0,diffY);
				break;
		}
	break;
	case "k":
		switch (count){
			case 1:
				moveSegsBy("k", 0, [0],0,diffY);
				moveSegsBy("k", 1, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("k", 0, [1],0,diffY);
				moveSegsBy("k", 2, [1],0,diffY);
				break;
			case 3:
				moveSegsBy("k", 1, [1],0,diffY);
				moveSegsBy("k", 2, [0],0,diffY);
				break;
		}
	break;
	case "l":
		switch (count){
			case 1:
				moveSegsBy("l", 0, [1],0,diffY);
				break;
			case 2:
				moveSegsBy("l", 0, [0],0,diffY);
				break;
			}
	break;
	case "m":
		switch (count){
			case 1:
				moveSegsBy("m", 0, [0],0,diffY);
				moveSegsBy("m", 1, [4],0,diffY);
				moveSegsBy("m", 2, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("m", 1, [0],0,diffY);
				break;
			case 3:
				moveSegsBy("m", 0, [1],0,diffY);
				moveSegsBy("m", 1, [1,2,3],0,diffY);
				moveSegsBy("m", 2, [1,2,3],0,diffY);
				break;
		}
	break;
	case "n":
		switch (count){
			case 1:
				moveSegsBy("n", 0, [0],0,diffY);
				moveSegsBy("n", 1, [4],0,diffY);
				break;
			case 2:
				moveSegsBy("n", 1, [0],0,diffY);
				break;
			case 3:
				moveSegsBy("n", 0, [1],0,diffY);
				moveSegsBy("n", 1, [1,2,3],0,diffY);
				break;	
		}
	break;
	case "o":
		switch (count){
			case 1:
				moveSegsBy("o", 0, [0,1,2],0,diffY);
				break;
			case 2:
				moveSegsBy("o", 0, [3,4,5],0,diffY);
				break;	
		}
	break;
	case "p":
		switch (count){
			case 1:
				moveSegsBy("p", 0, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("p", 0, [1],0,diffY);
				moveSegsBy("p", 1, [0,1,2,3,4,5],0,diffY);
				break;
			case 3:
				moveSegsBy("p", 1, [3,4,5],0,diffY);
				break;
		}
	break;
	case "q":
		switch (count){
			case 1:
				moveSegsBy("q", 0, [0],0,diffY);
				break;
			case 2:
				moveSegsBy("q", 0, [1],0,diffY);
				moveSegsBy("q", 1, [0,1,2,3,4,5],0,diffY);
				break;
			case 3:
				moveSegsBy("q", 1, [3,4,5],0,diffY);
				break;
		}
	break;
	case "r":
		switch (count){
			case 1:
				//moveSegsBy("r", 0, [3],0,diffY);
				moveSegsBy("r", 0, [4],0,diffY);
				break;
			case 2:
				moveSegsBy("r", 0, [0,1,2,3],0,diffY);
				break;
			case 3:
				moveSegsBy("r", 0, [0],0,diffY);
				break;
		}
	break;
	case "u":
		switch (count){
			case 1:
				moveSegsBy("u", 1, [4],0,diffY);
				break;
			case 2:
				moveSegsBy("u", 1, [0],0,diffY);
				moveSegsBy("u", 0, [1],0,diffY);
				break;
			case 3:
				moveSegsBy("u", 0, [0],0,diffY);
				moveSegsBy("u", 1, [1,2,3],0,diffY);
				break;	
		}
	break;
	case "v":
		switch (count){
			case 1:
				moveSegsBy("v", 0, [0,2],0,diffY);
				break;		
			case 2:
				moveSegsBy("v", 0, [1],0,diffY);
				break;
		}
	break;
	case "w":
		switch (count){
			case 1:
				moveSegsBy("w", 0, [0,4],0,diffY);
				break;		
			case 2:
				moveSegsBy("w", 0, [1,3],0,diffY);
			break;
			case 3:
				moveSegsBy("w", 0, [2],0,diffY);
				break;
		}
	break;
	case "x":
		switch (count){
			case 1:
				moveSegsBy("x", 0, [0],0,diffY);
				moveSegsBy("x", 1, [2],0,diffY);
				break;
			case 2:
				moveSegsBy("x", 0, [2],0,diffY);
				moveSegsBy("x", 1, [0],0,diffY);
				break;	
			case 3:
				moveSegsBy("x", 0, [1],0,diffY);
				moveSegsBy("x", 1, [1],0,diffY);
				break;	
		}
	break;
	case "z":
		switch (count){
			case 1:
				moveSegsBy("z", 0, [0,1],0,diffY);
				break;
			case 2:
				moveSegsBy("z", 0, [2,3],0,diffY);
				break;		
		}
	}
}

function mouseDrag(event){
	oldX=newX;
	newX=mousePoint.x;
	diffX=oldX-newX;
	
	oldY=newY;
	newY=mousePoint.y;
	diffY=oldY-newY;
	font();
	redraw()
}
    
function mouseDown(event){
	if(word!=""){
		if(count>eval(word[cur_letter]) | cur_letter==-1){
			if(word.length>cur_letter+1){	
				pasted=[""];
				cur_letter++
				copyPasteElements(word[cur_letter]);
				letter=word[cur_letter];
				print(letter);
				count=0;
			}
		}
		newX=mousePoint.x;
		newY=mousePoint.y;
	}else{
		alert("please enter a word first in the tool options.")
	}
}

function mouseUp(event){
	if(word.length<cur_letter+1){
		alert("done! Please enter another word in the tool options");
	}
	count++;
}