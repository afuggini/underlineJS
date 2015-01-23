var multiplyValue = function(value, multiplier){
    var str = value;
    var m = multiplier;
    var result = str.match(/(\d*\.?\d*)(.*)/);
    //http://stackoverflow.com/questions/2868947/split1px-into-1px-1-px-in-javascript
    return result[1] * m + result[2];
}
function SingleUnderline(element, underlineStyles, elementStyles) {
    //ctor
    this.element = element;

    this.text = this.element.textContent;

    this.underlineStyles = underlineStyles;

    this.elementStyles = elementStyles;
    this.redrawActive = false;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
    
    this.ratio = window.devicePixelRatio;
        this.canvas.width = this.elementStyles.width*this.ratio;
        this.canvas.height = this.elementStyles.height*this.ratio;
        this.element.appendChild(this.canvas);
        this.canvas.style.width =  this.elementStyles.width + 'px';

        this.ctx.font = this.font = this.elementStyles.fontStyle + ' ' 
                        + multiplyValue(this.elementStyles.fontSize, this.ratio) + ' ' 
                        + this.elementStyles.fontFamily;

    // console.log(this.ratio);
    // determine the text-underline-width / strokeWidth
    this.dotWidth = this.ctx.measureText('.')['width'];

    if (this.underlineStyles['text-underline-width'] == "auto") {
        // if set to auto, calculate the optimized width based on font
        if (this.dotWidth/6 <= 2) {
            this.strokeWidth = Math.round( this.dotWidth/3 )/2;
        } else {
            this.strokeWidth = Math.round( this.dotWidth/6 );
        }
        // console.log(this.strokeWidth);
    } else {
        //if set to px value
        this.strokeWidth = this.underlineStyles['text-underline-width'];
        //get number value
        this.strokeWidth = parseFloat(this.strokeWidth)*this.ratio;
    }
    console.log(this.strokeWidth);

    // determine the text-underline-position / underlinePosition
    // text-underline-position in ratio
    this.underlinePosition = parseFloat(this.elementStyles.height) * this.ratio * 
            (1 - this.elementStyles.baselinePositionRatio 
                + this.underlineStyles['text-underline-position']);

    if(this.strokeWidth <= 1 || (this.strokeWidth%2 && this.strokeWidth > 2)) {
        this.underlinePosition = Math.round(this.underlinePosition - 0.5) + 0.5;
    } else {
        this.underlinePosition = Math.round(this.underlinePosition);
    }

    this.textWidth = this.ctx.measureText(this.text).width;

    this.myString = new GuitarString(this.ctx, 
        new Point(0, this.underlinePosition), 
        new Point(this.textWidth, this.underlinePosition), 
        this.strokeWidth, this.underlineStyles['text-underline-color'], this.ratio);
    this.drawHoles();

}

SingleUnderline.prototype.clear = function(){
    this.redrawActive = this.myString.redrawActive;
    // clear
    if(this.myString.redrawActive) {
        // this.myString.clear();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};


SingleUnderline.prototype.update = function(){
    // update
    if(this.myString.redrawActive) {
        this.myString.update();
        // this.drawHoles();
    }
};


SingleUnderline.prototype.draw = function(){
    // draw
    if(this.redrawActive) {
        this.drawUnderline();
        this.drawHoles();
    }
};

SingleUnderline.prototype.drawUnderline = function(){
    //  draw the underline
    this.myString.draw();
}

SingleUnderline.prototype.drawHoles = function(){
    
    // draw the font stroke             
    this.ctx.font = this.font;
    this.ctx.textBaseline = 'top';

    this.ctx.globalCompositeOperation = "destination-out";

    this.ctx.fillStyle = 'green';
    this.ctx.beginPath();
    this.ctx.fillText(this.text, 0, 0);
    this.ctx.lineWidth = 3*this.ratio + this.strokeWidth;
    this.ctx.strokeStyle = 'blue';
    this.ctx.beginPath();
    this.ctx.strokeText(this.text, 0, 0);
}

function MultipleUnderline(element, underlineStyles, elementStyles) {
    //ctor
    this.element = element;

    this.text = this.element.textContent;

    this.underlineStyles = underlineStyles;

    // this.elementStyles = getElementStyles(element);
    this.elementStyles = elementStyles;

    this.canvas = document.createElement("canvas");
        this.canvas.width = this.elementStyles.width;
        this.canvas.height = this.elementStyles.height;
        this.canvas.style.left = this.elementStyles.canvasLeft + 'px';
        this.element.appendChild(this.canvas);
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight + this.elementStyles.lineHeight;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = this.font = this.elementStyles.fontStyle + ' ' + this.elementStyles.fontSize + ' ' + this.elementStyles.fontFamily;

    this.multipleRedrawActive = false;
    if (is_chrome) {
        // chrome floor the lineheight when it is not a whole number
        this.elementStyles.lineHeight = Math.floor(this.elementStyles.lineHeight);
    }


    // determine the text-underline-width / strokeWidth
    this.dotWidth = this.ctx.measureText('.')['width'];
    if (this.underlineStyles['text-underline-width'] == "auto") {
        // if set to auto, calculate the optimized width based on font
        if (this.dotWidth / 6 <= 2) {
            this.strokeWidth = Math.round(this.dotWidth / 3) / 2;
        } else {
            this.strokeWidth = Math.round(this.dotWidth / 6);
        }
    } else {
        //if set to px value
        this.strokeWidth = this.underlineStyles['text-underline-width'];
        //get number value
        this.strokeWidth = parseFloat(this.strokeWidth);
    }

    // determine the text-underline-position / underlinePosition
    // text-underline-position in ratio
    this.underlinePosition = parseFloat(this.elementStyles.fontSize) * 0.89;
    if (this.strokeWidth <= 1 || (this.strokeWidth % 2 && this.strokeWidth > 2)) {
        this.underlinePosition = Math.round(this.underlinePosition - 0.5) + 0.5;
    } else {
        this.underlinePosition = Math.round(this.underlinePosition);
    }

    this.lines = [];
    this.myStrings = [];

    var words = this.text.match(/[^\s-]+-?\s?/g);
    var line = '';

    var linePositionY = 0;
    var firstLineCount = 0;
    for (var n = 0; n < words.length; n++) {
        // add the whitespace after getting the width measurement
        if (words[n].match(/\s+$/)) {
            // the last character of words[n] is whitespace
            var newWord = words[n].replace(/\s+$/, '');
            var testLine = line + newWord;
            var testLineMetrics = this.ctx.measureText(testLine);
            var testLineWidth = testLineMetrics.width;
            testLine = testLine + ' ';
        } else {
            var testLine = line + words[n];
            var testLineMetrics = this.ctx.measureText(testLine);
            var testLineWidth = testLineMetrics.width;
        }

        if (!firstLineCount) {
            //the first line, should consider startingPointX
            if (testLineWidth + this.elementStyles.textIndent > this.elementStyles.parentWidth && n > 0) {
                //  draw the underline
                if (line.match(/\s+$/)) {
                    // the last character of line is whitespace               
                    var lineMetrics = this.ctx.measureText(line.replace(/\s+$/, ''));
                    var lineWidth = lineMetrics.width;
                } else {
                    var lineMetrics = this.ctx.measureText(line);
                    var lineWidth = lineMetrics.width;
                }

                var tempLine = {
                    lineText: line,
                    lineTextIndent: this.elementStyles.textIndent,
                    linePositionY: linePositionY,
                    lineMeasureWidth: lineWidth
                }
                this.lines.push(tempLine)

                line = words[n];
                linePositionY += this.elementStyles.lineHeight;
                firstLineCount++;
            } else {
                line = testLine;
            }
        } else {
            if (testLineWidth > this.elementStyles.parentWidth && n > 0) {
                //  draw the underline
                if (line.match(/\s+$/)) {
                    // the last character of line is whitespace               
                    var lineMetrics = this.ctx.measureText(line.replace(/\s+$/, ''));
                    var lineWidth = lineMetrics.width;
                } else {
                    var lineMetrics = this.ctx.measureText(line);
                    var lineWidth = lineMetrics.width;
                }

                var tempLine = {
                    lineText: line,
                    lineTextIndent: 0,
                    linePositionY: linePositionY,
                    lineMeasureWidth: lineWidth
                }
                this.lines.push(tempLine);

                line = words[n];
                linePositionY += this.elementStyles.lineHeight;
            } else {
                line = testLine;
            }
        }
    }
    // draw the last line
    //  draw the underline
    if (line.match(/\s+$/)) {
        // the last character of line is whitespace               
        var lineMetrics = this.ctx.measureText(line.replace(/\s+$/, ''));
        var lineWidth = lineMetrics.width;
    } else {
        var lineMetrics = this.ctx.measureText(line);
        var lineWidth = lineMetrics.width;
    }

    var tempLine = {
        lineText: line,
        lineTextIndent: 0,
        linePositionY: linePositionY,
        lineMeasureWidth: lineWidth
    }
    this.lines.push(tempLine);



    for(var i = 0; i < this.lines.length; i++) {
        var tempLine = this.lines[i];
        var myString = new GuitarString(
                this.ctx, 
                new Point(tempLine.lineTextIndent, tempLine.linePositionY + this.underlinePosition), 
                new Point(tempLine.lineTextIndent + tempLine.lineMeasureWidth, tempLine.linePositionY + this.underlinePosition), 
                this.strokeWidth, this.underlineStyles['text-underline-color'], 1);
        this.myStrings.push(myString);
    }

    this.drawUnderline();
    this.drawHoles();

}


MultipleUnderline.prototype.clear = function(){
    // clear
    var lastMultipleRedrawActive = this.multipleRedrawActive;
    this.multipleRedrawActive = false;
    for(var i = 0; i < this.myStrings.length; i++) {
        var tempString = this.myStrings[i];
        // this.myString.clear();
        // console.log(tempString.redrawActive);
        if(tempString.redrawActive) {
            this.multipleRedrawActive = true;
        }
    }
    // console.log(this.multipleRedrawActive);
    if (this.multipleRedrawActive) {
        console.log('clear now!')
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // if (!lastMultipleRedrawActive && this.multipleRedrawActive) {
    //     for(var i = 0; i < this.myStrings.length; i++) {
    //         var tempString = this.myStrings[i];
    //         tempString.drawLine();
    //     }
    // }

};

MultipleUnderline.prototype.update = function(){
    //update
};


MultipleUnderline.prototype.draw = function(){
    // draw
    if (this.multipleRedrawActive) {
        this.drawUnderline();
        this.drawHoles();
    }
};


MultipleUnderline.prototype.drawUnderline = function(){
    // draw the underline
    for(var i = 0; i < this.myStrings.length; i++) {
        var tempString = this.myStrings[i];
        // tempString.clear();
            tempString.update();
            tempString.draw();
    }

};


MultipleUnderline.prototype.drawHoles = function(){
    // draw the font stroke
    for(var i = 0; i < this.lines.length; i++) {
        var tempLine = this.lines[i];

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.font = this.font;
        this.ctx.fillStyle = 'green';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(tempLine.lineText, tempLine.lineTextIndent, tempLine.linePositionY);
        this.ctx.lineWidth = 3 + this.strokeWidth;
        this.ctx.strokeStyle = 'blue';
        this.ctx.strokeText(tempLine.lineText, tempLine.lineTextIndent, tempLine.linePositionY);

    }
}

