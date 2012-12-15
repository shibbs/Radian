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

var Point = Class.create({

    initialize: function(x, y) {
        this.x = x;
        this.y = y;
        this.xLabel = new Element('div', {'class': 'cubic_spline_xaxis_label'});
        this.yLabel = new Element('div', {'class': 'cubic_spline_yaxis_label'});
        this.styleSettings = {
            width: 
        }
    },

    _addHandle: function() {
        handle = new Element('div', {'class': 'cubic_spline_handle'});
        handle.observe('dblclick',  function(e) { me.edit(i, e); });
        handle.observe('mousedown',  function(e) { me.slide(i, e); });
        if (me.iOS) handle.observe('touchstart', function(e) {
          if (me.lastTapTime && new Date().getTime() - me.lastTapTime < 500 && me.lastTapHandle == i)
            me.edit(i, e);
          else 
            me.slide(i, e);
          me.lastTapHandle = i;
          me.lastTapTime = new Date().getTime();
        });
        var handleSizeStyle = (handleSize + 8) + 'px';
        var handleBRadStyle = (handleSize) + 'px';
        handle.setStyle({
           width: handleSizeStyle, 
           height: handleSizeStyle,
           MozBorderRadius: handleBRadStyle, 
           WebkitBorderRadius: handleBRadStyle, 
           borderRadius: handleBRadStyle
         });
        me.handles[i] = handle;
        div.insert(handle);
    },

    updateLocation: function(x, y, pxX, pxY) {
        setStyle({left: (pxX - handleSize / 2 + 1) + 'px', top: ((height - pxY) - (handleSize+12) / 2 + 1) + 'px'});
    },

});

var SplineChart = Class.create({
  init: function(div_id, xAxisLabel, yAxisLabel, color, splineFunc) {
    this.div_id = div_id;
    this.iOS = !! window.navigator.appVersion.match(/\biP(ad|od|hone)\b/);
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
    this.color = color;
    this.splineFunc = splineFunc;
    
    this.questions = [];
    this.ys = [];
    this.handles = [];
    this.useLinear = false;
    document.observe('dom:loaded', (function() { this.draw(true); }).bind(this));
  },

  addAxisLabels: function(div, width, height) {
      var xAxisLabel = new Element('div', {'class': 'cubic_spline_xaxis_label'});
      xAxisLabel.update(this.xAxisLabel).setStyle({width: width + 'px'});
      div.insert(xAxisLabel);
      var yAxisLabel = new Element('div', {'class': 'cubic_spline_yaxis_label'});
      yAxisLabel.update(this.yAxisLabel).setStyle({top: (height / 2 - 9) + 'px'});
      div.insert(yAxisLabel);
  },
  addPointLabels: function(i) {
    var div = $(this.div_id);
    var xLab = new Element('div', {'class': 'cubic_spline_xlabel'});
    this.xLabs[i] = xLab;
    div.insert(xLab);
    return xLab;
  },
  draw: function(firstTime) {
    var me = this;
    var div = $(this.div_id);
    var canvas = div.down('canvas');
    var width = parseInt(canvas.width);  // it's a string in IE6(+?)
    var height = parseInt(canvas.height);
    
    var pxJump = 3, xPadProp = 0, yPadProp = 0, handleSize = 14, curveWidth = 2;
    if (this.iOS) handleSize *= 2;
    
    var xs = this.questions.map(function(a) { return parseFloat(a.answer()); });
    var xmin = xs.min();
    var xmax = xs.max();
    var xrange = xmax - xmin;
    xmin -= xrange * xPadProp;
    xmax += xrange * xPadProp;
    xrange = xmax - xmin;
    me.xfactor = width / xrange;
    me.xMin = xmin;
    me.xMax = xmax;
    
    var ys = this.ys;
    var ymin = ys.min();
    var ymax = ys.max();
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
    var adjustedXs = xs.map(function(x) {
      if (x == lastX) x += tinyAdjustment;
      lastX = x
      return x; 
    });

   
    var cdf = this.splineFunc(adjustedXs, ys);
    
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
    var forEachXY = function(callback) {
      for (var i = 0, len = xs.length; i < len; i ++) {
        var x = xs[i], y = ys[i];
        var pxX = (x - xmin) * me.xfactor;
        var pxY = (y - ymin) * yfactor;
        callback(x, y, pxX, pxY, i);
      }
    }
    
    forEachXY(function(x, y, pxX, pxY, i) { 
      // vertical (x) lines
      ctx.strokeStyle = '#3D3D3D';
      if(i!=0) { 
      ctx.moveTo(pxX, 0);
      ctx.lineTo(pxX, height);
      }
      // x labels
      var xLab;
      if (firstTime) {
         xLab = me.addPointLabels(i);
      } else {
        xLab = me.xLabs[i];
      }
      xLab.update(x);
      xLab.setStyle({left: (pxX - 75) + 'px', top: (height + 9) + 'px'});
      
      // horizontal (y) lines
      if(i!=0) { 
      ctx.moveTo(0, height-pxY);
      ctx.lineTo(width, height-pxY);
      }
      
      // y labels
      var yLab;
      if (firstTime) {
        yLab = new Element('div', {'class': 'cubic_spline_ylabel'}).update(y);
        me.yLabs[i] = yLab;
        yLab.setStyle({top: ((height - pxY) - 10) + 'px'});
        div.insert(yLab);
      } else {
        yLab = me.yLabs[i];
      }
      yLab.update(y);
      yLab.setStyle({top: ((height - pxY) - 10) + 'px'});
    });


    ctx.stroke();
    ctx.closePath();

    // spline
    var started = false;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = curveWidth;
    ctx.beginPath();

    if(me.useLinear) {
      forEachXY(function(x, y, pxX, pxY, i) { 
        if (started) ctx.lineTo(pxX, height - pxY);
        else {
          ctx.moveTo(pxX, height - pxY);
          started = true;
        }
      });

    } else {
      for (var pxX = 0; pxX <= width; pxX += pxJump) {
        var splineX = xmin + pxX / me.xfactor;
        var splineY = cdf.interpolate(splineX);
        if (typeof(splineY) == 'number') {
          pxY = (splineY - ymin) * yfactor;
          if (started) ctx.lineTo(pxX, height - pxY);
          else {
            ctx.moveTo(pxX, height - pxY);
            started = true;
          }
        }
      }
    }


    ctx.stroke();
    ctx.closePath();
    
    // handles
    var handle;
    forEachXY(function(x, y, pxX, pxY, i) {
        handle = me.handles[i];     
        handle.updateLocation(x, y, pxX, pxY); 
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
    $('page').setStyle({cursor: 'col-resize'});
    me.setHandleHighlight(i, true);
    var moveFunc = function(e) {
      e.stop();
      var newX = me.slideX + ((e.clientX || e.changedTouches[0].clientX) - me.slidePxX) / me.xfactor;
      var newY = me.slideY - ((e.clientY || e.changedTouches[0].clientY) - me.slidePyY) / me.yfactor;
      console.log(newY);
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
  edit: function(i, e) {
    e.stop();
    alert("Double clicked");
  },
  truncateX: function(x, i) {  // fixes and formats x
    var minGap = 5, precision = 2;
    x = Math.round(x/5) * 5;
    x = x.toFixed(precision);
    if (i > 0) x = Math.max(x, parseFloat(this.questions[i - 1].answer()) + minGap);
    if (i < this.questions.length - 1) x = Math.min(x, parseFloat(this.questions[i + 1].answer()) - minGap);
    x = Math.max(x, this.xMin);
    x = Math.min(x, this.xMax);
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
    y = Math.max(y, this.ymin);
    y = Math.min(y, this.ymax);
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
  },
    setLinear: function(isLinear) {
    this.useLinear = isLinear
    this.draw(false);
  },
});
