function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = (event.pageX || event.clientX || event.changedTouches[0].clientX) - totalOffsetX;
    canvasY = (event.pageY || event.clientY || event.changedTouches[0].clientY) - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

var Question = Class.create({
  _answer: null,
  answer: function() {
    if (arguments.length > 0) {
      this._answer = arguments[0];
      return this;
    }
    return this._answer;
  }
});

var SplineChart = Class.create({
  init: function(div_id, xAxisLabel, yAxisLabel, color, splineFunc) {
    this.div_id = div_id;
    this.iOS = !! window.navigator.appVersion.match(/\biP(ad|od|hone)\b/);
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
    this.color = color;
    this.splineFunc = splineFunc;
    this.handleSize = 14;
    if (this.iOS) this.handleSize *= 2;
    this.questions = [];
    this.ys = [];
    this.handles = [];
    this.xLabs = [];
    this.yLabs = [];
    this.domLoaded = false;
    this.useLinear = false;
    this.ymin = 0;
    this.yminData = this.ymin;
    this.ymax = 235;
    this.ymaxData = this.ymax;
    this.xmin = 0;
    this.xminData = this.xmin;
    this.xmax = 410;
    this.xmaxData = this.xmax;
    document.observe('dom:loaded', (function() { this.domLoaded=true; this.draw(true); }).bind(this));
    var me = this;
    document.getElementById('chart').addEventListener('dblclick', function(e){ 
      me.add(e);
    });
    var me = this;
    document.getElementById('chart').addEventListener('touchend', function(e) {
       var now = new Date().getTime();
       var lastTouch = me.lastTouch || now + 1 /** the first time this will make delta a negative number */;
       var delta = now - lastTouch;
       var x = e.clientX || e.changedTouches[0].clientX;
       var y = e.clientY || e.changedTouches[0].clientY;
       if(delta < 500 && delta > 0 && Math.abs(x-me.prevX) < 20 && Math.abs(y-me.prevY) < 20) {
          me.add(e);
          me.lastTouch = 0;
       } else {
        me.lastTouch = now;
        me.prevX = x;
        me.prevY = y;
      }
    });
  },

  addAxisLabels: function(div, width, height) {
      var xAxisLabel = new Element('div', {'class': 'cubic_spline_xaxis_label'});
      xAxisLabel.update(this.xAxisLabel).setStyle({width: width + 'px'});
      div.insert(xAxisLabel);
      //var yAxisLabel = new Element('div', {'class': 'cubic_spline_yaxis_label'});
      //yAxisLabel.update().setStyle({top: (height / 2 - 9) + 'px'});
      //div.insert(yAxisLabel);
  },
  addPointLabelsX: function(i) {
    var div = $(this.div_id);
    var xLab = new Element('div', {'class': 'cubic_spline_xlabel'});
    this.xLabs.splice(i, 0, xLab);
    div.insert(xLab);
    return xLab;
  },
  addPointLabelsY: function(i) {
    var div = $(this.div_id);
    yLab = new Element('div', {'class': 'cubic_spline_ylabel'});
    this.yLabs.splice(i, 0, yLab);
    div.insert(yLab);
    return yLab;
  },
  addHandle: function(i) {
    var me = this;
    var div = $(this.div_id);
    handle = new Element('div', {'class': 'cubic_spline_handle'});
    handle.observe('dblclick',  function(e) { 
      var handle_i = me.handles.indexOf(this);
      me.delete(handle_i, e); 
    });
    handle.observe('mousedown',  function(e) { 
      var handle_i = me.handles.indexOf(this);
      me.slide(handle_i, e); 
    });
    if (me.iOS) handle.observe('touchstart', function(e) {
      var handle_i = me.handles.indexOf(this);
      if (me.lastTapTime && new Date().getTime() - me.lastTapTime < 500 && me.lastTapHandle == handle_i)
        me.delete(handle_i, e);
      else 
        me.slide(handle_i, e);
      me.lastTapHandle = handle_i;
      me.lastTapTime = new Date().getTime();
    });
    var handleSizeStyle = (this.handleSize + 8) + 'px';
    var handleBRadStyle = (this.handleSize) + 'px';
    handle.setStyle({
     width: handleSizeStyle, 
     height: handleSizeStyle,
     MozBorderRadius: handleBRadStyle, 
     WebkitBorderRadius: handleBRadStyle, 
     borderRadius: handleBRadStyle
    });
    me.handles.splice(i, 0, handle);
    div.insert(handle);
    return handle;
  },
  draw: function(firstTime) {
    var me = this;
    var div = $(this.div_id);
    var canvas = div.down('canvas');
    var width = parseInt(canvas.width);  // it's a string in IE6(+?)
    var height = parseInt(canvas.height);
    
    var pxJump = .5, xPadProp = 0, yPadProp = 0, curveWidth = 2;
    
    
    var xs = this.questions.map(function(a) { return parseFloat(a.answer()); });
    var xsCurve = xs.slice(0);
    xsCurve.push(me.xmaxData);
    xsCurve.unshift(me.xminData);
    var xmin = me.xmin;
    var xmax = me.xmax;
    var xrange = xmax - xmin;
    xmin -= xrange * xPadProp;
    xmax += xrange * xPadProp;
    xrange = xmax - xmin;
    me.xfactor = width / xrange;
    me.xMin = xmin;
    me.xMax = xmax;
    
    var ys = this.ys;
    var ysCurve = ys.slice(0);
    ysCurve.push(me.ymaxData);
    ysCurve.unshift(me.yminData);
    var ymin = me.ymin;
    var ymax = me.ymax;
    var yrange = ymax - ymin;
    ymin -= yrange * yPadProp;
    ymax += yrange * yPadProp;
    yrange = ymax - ymin;
    var yfactor = height / yrange;
    me.yfactor = yfactor;
    me.ymin = ymin;
    me.ymax = ymax;
    
    // fix infinite gradients to be just sub-infinite for plotting purposes
    var lastX, tinyAdjustment = 0.00001;
    var adjustedXs = xsCurve.map(function(x) {
      if (x == lastX) x += tinyAdjustment;
      lastX = x
      return x; 
    });

  
    var cdf = this.splineFunc(adjustedXs, ysCurve);
    
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = '#ccc';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // axis labels
    if (firstTime) {
      this.addAxisLabels(div, width, height);
    }
    
    // general iterator

    var forEachXY = function(callback, hiddencallback) {
      for (var i = 0, len = xs.length; i < len; i ++) {
        var x = xs[i], y = Number(ys[i]);
        var pxX = (x - me.xmin) * me.xfactor;
        var pxY = (y - me.ymin) * yfactor;
        if(x >= me.xmin && x <= me.xmax && y <= me.ymax && y >= me.ymin) {
          callback(x, y, pxX, pxY, i);
        } else {
          if(hiddencallback) hiddencallback(x, y, pxX, pxY, i);
        }
      }
    }
    
    forEachXY(function(x, y, pxX, pxY, i) { 
      // vertical (x) lines
      ctx.strokeStyle = '#3D3D3D';
      ctx.moveTo(pxX, 0);
      ctx.lineTo(pxX, height);

      // x labels
      var xLab;
      if (firstTime) {
         xLab = me.addPointLabelsX(i);
      } else {
         xLab = me.xLabs[i];
      }
      xLab.update(x);
      xLab.setStyle({left: (pxX - 75) + 'px', top: (height + 9) + 'px', visibility: 'visible'});
      
      // horizontal (y) lines
        ctx.moveTo(0, height-pxY);
        ctx.lineTo(width, height-pxY);
      
      // y labels
      var yLab;
      if (firstTime) {
        yLab = me.addPointLabelsY(i, y);
      } else {
        yLab = me.yLabs[i];
      }
      yLab.update(y);
      yLab.setStyle({top: ((height - pxY) - 10) + 'px', visibility: 'visible'});
    }, function(x, y, pxX, pxY, i) { 

      // x labels
      var xLab;
      if (firstTime) {
         xLab = me.addPointLabelsX(i);
      } else {
         xLab = me.xLabs[i];
      }
      xLab.update(x);
      xLab.setStyle({visibility: 'hidden'});
      
      // y labels
      var yLab;
      if (firstTime) {
        yLab = me.addPointLabelsY(i, y);
      } else {
        yLab = me.yLabs[i];
      }
      yLab.update(y);
      yLab.setStyle({visibility: 'hidden'});

    });


    ctx.stroke();
    ctx.closePath();

    // spline
    var started = false;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = curveWidth;
    ctx.beginPath();


    if(me.useLinear) {
      ctx.moveTo((me.xminData - me.xmin) * me.xfactor, height - (me.yminData - me.ymin) * me.yfactor);
      forEachXY(function(x, y, pxX, pxY, i) { 
        ctx.lineTo(pxX, height - pxY);
      });
      ctx.lineTo((me.xmaxData - me.xmin) * me.xfactor, height - (me.ymaxData - me.ymin) * me.yfactor);
    } else {
      for (var pxX = 0; pxX <= width; pxX += pxJump) {
        var splineX = xmin + pxX / me.xfactor;
        var splineY = cdf.interpolate(splineX);
        if (typeof(splineY) == 'number') {
          pxY = (splineY - ymin) * yfactor;
          ctx.lineTo(pxX, height - pxY);
        }
      }
    }

    

    ctx.stroke();
    ctx.closePath();
    
    // handles
    var handle;
    var count = 0;
    forEachXY(function(x, y, pxX, pxY, i) {
      if (firstTime) {
          handle = me.addHandle(i);
      } else {
        handle = me.handles[i];     
      }     

      handle.setStyle({left: (pxX - me.handleSize / 2 + 1) + 'px', top: ((height - pxY) - (me.handleSize+12) / 2 + 1) + 'px', visibility: 'visible'});
    }, function(x, y, pxX, pxY, i) {
      if (firstTime) {
          handle = me.addHandle(i);
      } else {
        handle = me.handles[i];     
      }    
      handle.setStyle({visibility: 'hidden'});
    });
  },
  slide: function(i, e) {
    e.stop();
    var precision = 2;
    var me = this, doc = $(document);
    var q = me.questions[i];
    me.slideX = parseFloat(q.answer());
    me.slideY = me.ys[i];
    me.slidePxX = e.clientX || e.changedTouches[0].clientX;
    me.slidePyY = e.clientY || e.changedTouches[0].clientY;
    $('page').setStyle({cursor: 'move'});
    me.setHandleHighlight(i, true);
    var moveFunc = function(e) {
      e.stop();
      var newX = me.slideX + ((e.clientX || e.changedTouches[0].clientX) - me.slidePxX) / me.xfactor;
      var newY = me.slideY - ((e.clientY || e.changedTouches[0].clientY) - me.slidePyY) / me.yfactor;
      q.answer(me.truncateX(newX, i));
      me.ys[i] = me.truncateY(newY, i);
      me.draw();
    }
    doc.observe('mousemove', moveFunc);
    if (me.iOS) doc.observe('touchmove', moveFunc);
    var upFunc = function(e) { 
      doc.stopObserving('mousemove');
      if (me.iOS) doc.stopObserving('touchmove');
      $('page').setStyle({cursor: 'default'});

      me.setHandleHighlight(i, false);
    }
    doc.observe('mouseup', upFunc);
    if (me.iOS) {
      doc.observe('touchend', upFunc);
      doc.observe('touchcancel', upFunc);
    }
  },
  add: function(e) {
    e.stop();
    var me = this, doc = $(document);
    var x = e.clientX || e.changedTouches[0].clientX;
    var y = e.clientY || e.changedTouches[0].clientY;
    var chart = $('chart');
    var results = chart.relMouseCoords(e);
    x = results.x;
    y = chart.height - results.y+25;


    x /= me.xfactor;
    y /= me.yfactor;

    x = this.format(x);
    y = this.format(y);

    this.addNewPoint(x, y);
  },

  delete: function(i, e) {
    e.stop();
    var me = this;
    this.handles[i].remove();
    this.xLabs[i].remove();
    this.yLabs[i].remove();

    //Remove from all arrays
    this.handles.splice(i, 1);
    this.xLabs.splice(i, 1);
    this.yLabs.splice(i, 1);
    this.questions.splice(i, 1);
    this.ys.splice(i, 1);
    this.draw(false);
  },
  format: function(x) {
    var minGap = 5, precision = 2;
    x = Math.round(x/5) * 5;
    x = x.toFixed(precision);  // sometimes ends .XX99999999999 or .XX000000001 otherwise
    xStr = x + '';
    xStr = xStr.replace(/[.]0+$/, '').replace(/([.][0-9]+)0+$/, '$1');  // eliminate trailing zeroes
    return xStr;
  },
  truncateX: function(x, i) {  // fixes and formats x
    var minGap = 5, precision = 2;
    x = Math.round(x/5) * 5;
    x = x.toFixed(precision);
    if (i > 0) x = Math.max(x, parseFloat(this.questions[i - 1].answer()) + minGap);
    if (i < this.questions.length - 1) x = Math.min(x, parseFloat(this.questions[i + 1].answer()) - minGap);
    x = Math.max(x, this.xminData+5);
    x = Math.min(x, this.xmaxData-5);
    x = x.toFixed(precision);  // sometimes ends .XX99999999999 or .XX000000001 otherwise
    xStr = x + '';
    xStr = xStr.replace(/[.]0+$/, '').replace(/([.][0-9]+)0+$/, '$1');  // eliminate trailing zeroes
    return xStr;
  },

  truncateY: function(y, i) {  // fixes and formats x
    var minGap = 0, precision = 2;
    y = Math.round(y/5) * 5;
    y = y.toFixed(precision);
    if (i > 0) y = Math.max(y, parseFloat(this.ys[i - 1]) + minGap);
    if (i < this.questions.length - 1) y = Math.min(y, parseFloat(this.ys[i + 1]) - minGap);
    y = Math.max(y, this.yminData);
    y = Math.min(y, this.ymaxData);
    y = y.toFixed(precision);  // sometimes ends .XX99999999999 or .XX000000001 otherwise
    yStr = y + '';
    yStr = yStr.replace(/[.]0+$/, '').replace(/([.][0-9]+)0+$/, '$1');  // eliminate trailing zeroes
    return yStr;
  },
  setHandleHighlight: function(i, h) {  // h = true if highlighted
    this.handles[i].setStyle({background: h ? '#008bca' : '#c8c8c8'});
    this.xLabs[i].setStyle({fontWeight: h ? 'bold' : 'normal'});
    this.yLabs[i].setStyle({fontWeight: h ? 'bold' : 'normal'});
  },
  point: function(question, y) {
    this.questions.push(question);
    this.ys.push(y);
    if(this.domLoaded) {
      (function() { this.draw(); }).bind(this);
    }
  },
  addNewPoint: function(x, y) {
    var i = 0;
    y -= 25;
    for (var i = 0; i < this.questions.length; i++) {
      var nextX = parseFloat(this.questions[i].answer());
      if(nextX == x) {
        x -= 5;
      }
      if(x < nextX) {
        break;
      }
      count = i;
    };

    this.ys.splice(i, 0, y);
    var prev = i!=0 ? i-1 : i;
    var next = i!=this.questions.length ? i+1 : i;
    if(Number(this.ys[i]) < Number(this.ys[prev])) {
      this.ys[i] = Number(this.ys[prev]);
    } else if (Number(this.ys[i]) > Number(this.ys[next])) {
      this.ys[i] = Number(this.ys[next]);
    }

    // Insert the x and y value
    this.questions.splice(i, 0, new Question().answer(x));
    

    // Add x and y labels
    this.addPointLabelsX(i);
    this.addPointLabelsY(i);
    
    //Create the handle
    this.addHandle(i);
    this.draw(false);

  },
  setLinear: function(isLinear) {
    this.useLinear = isLinear
    this.draw(false);
  },
});
