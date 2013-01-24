var SplineChart;
var Question;
var CubicSpline, MonotonicCubicSpline;

(function() {

 MonotonicCubicSpline = function(){function p(f,d){var e,k,h,j,b,l,i,a,g,c,m;i=f.length;h=[];l=[];e=[];k=[];j=[];a=[];b=0;for(g=i-1;0<=g?b<g:b>g;0<=g?b+=1:b-=1){h[b]=(d[b+1]-d[b])/(f[b+1]-f[b]);if(b>0)l[b]=(h[b-1]+h[b])/2}l[0]=h[0];l[i-1]=h[i-2];g=[];b=0;for(c=i-1;0<=c?b<c:b>c;0<=c?b+=1:b-=1)h[b]===0&&g.push(b);c=0;for(m=g.length;c<m;c++){b=g[c];l[b]=l[b+1]=0}b=0;for(g=i-1;0<=g?b<g:b>g;0<=g?b+=1:b-=1){e[b]=l[b]/h[b];k[b]=l[b+1]/h[b];j[b]=Math.pow(e[b],2)+Math.pow(k[b],2);a[b]=3/Math.sqrt(j[b])}g=[]; b=0;for(c=i-1;0<=c?b<c:b>c;0<=c?b+=1:b-=1)j[b]>9&&g.push(b);j=0;for(c=g.length;j<c;j++){b=g[j];l[b]=a[b]*e[b]*h[b];l[b+1]=a[b]*k[b]*h[b]}this.x=f.slice(0,i);this.y=d.slice(0,i);this.m=l}p.prototype.interpolate=function(f){var d,e,k,h;for(e=d=this.x.length-2;d<=0?e<=0:e>=0;d<=0?e+=1:e-=1)if(this.x[e]<=f)break;d=this.x[e+1]-this.x[e];f=(f-this.x[e])/d;k=Math.pow(f,2);h=Math.pow(f,3);return(2*h-3*k+1)*this.y[e]+(h-2*k+f)*d*this.m[e]+(-2*h+3*k)*this.y[e+1]+(h-k)*d*this.m[e+1]};return p}(); CubicSpline=function(){function p(f,d,e,k){var h,j,b,l,i,a,g,c,m,o,n;if(f!=null&&d!=null){b=e!=null&&k!=null;c=f.length-1;i=[];o=[];g=[];m=[];n=[];j=[];h=[];l=[];for(a=0;0<=c?a<c:a>c;0<=c?a+=1:a-=1)i[a]=f[a+1]-f[a];if(b){o[0]=3*(d[1]-d[0])/i[0]-3*e;o[c]=3*k-3*(d[c]-d[c-1])/i[c-1]}for(a=1;1<=c?a<c:a>c;1<=c?a+=1:a-=1)o[a]=3/i[a]*(d[a+1]-d[a])-3/i[a-1]*(d[a]-d[a-1]);if(b){g[0]=2*i[0];m[0]=0.5;n[0]=o[0]/g[0]}else{g[0]=1;m[0]=0;n[0]=0}for(a=1;1<=c?a<c:a>c;1<=c?a+=1:a-=1){g[a]=2*(f[a+1]-f[a-1])-i[a-1]* m[a-1];m[a]=i[a]/g[a];n[a]=(o[a]-i[a-1]*n[a-1])/g[a]}if(b){g[c]=i[c-1]*(2-m[c-1]);n[c]=(o[c]-i[c-1]*n[c-1])/g[c];j[c]=n[c]}else{g[c]=1;n[c]=0;j[c]=0}for(a=e=c-1;e<=0?a<=0:a>=0;e<=0?a+=1:a-=1){j[a]=n[a]-m[a]*j[a+1];h[a]=(d[a+1]-d[a])/i[a]-i[a]*(j[a+1]+2*j[a])/3;l[a]=(j[a+1]-j[a])/(3*i[a])}this.x=f.slice(0,c+1);this.a=d.slice(0,c);this.b=h;this.c=j.slice(0,c);this.d=l}}p.prototype.derivative=function(){var f,d,e,k,h;d=new this.constructor;d.x=this.x.slice(0,this.x.length);d.a=this.b.slice(0,this.b.length); h=this.c;e=0;for(k=h.length;e<k;e++){f=h[e];d.b=2*f}h=this.d;e=0;for(k=h.length;e<k;e++){f=h[e];d.c=3*f}f=0;for(e=this.d.length;0<=e?f<e:f>e;0<=e?f+=1:f-=1)d.d=0;return d};p.prototype.interpolate=function(f){var d,e;for(d=e=this.x.length-1;e<=0?d<=0:d>=0;e<=0?d+=1:d-=1)if(this.x[d]<=f)break;f=f-this.x[d];return this.a[d]+this.b[d]*f+this.c[d]*Math.pow(f,2)+this.d[d]*Math.pow(f,3)};return p}();


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

Question = Backbone.Model.extend({
  _answer: null,
  answer: function() {
    if (arguments.length > 0) {
      this._answer = arguments[0];
      return this;
    }
    return this._answer;
  }
});

SplineChart = Backbone.Model.extend({
  initialize: function(div_id, xAxisLabel, yAxisLabel, color, splineFunc, xmax, ymax) {

    this.div_id = div_id;
    this.iOS = !! window.navigator.appVersion.match(/\biP(ad|od|hone)\b/) || navigator.userAgent.match(/Android/);;
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
    this.color = color;
    this.splineFunc = splineFunc;
    this.handleSize = 14;
    if (this.iOS) this.handleSize *= 1.6;
    this.questions = [];
    this.ys = [];
    this.handles = [];
    this.xLabs = [];
    this.yLabs = [];
    this.domLoaded = false;
    this.useLinear = true;
    this.ymin = 0;
    this.yminData = this.ymin;
    this.ymax = ymax;
    this.ymaxData = this.ymax;
    this.xmin = 0;
    this.xminData = this.xmin;
    this.xmax = xmax;
    this.xmaxData = this.xmax;
    this.customized = false;
    var me = this;
    $(document).ready(function() { me.domLoaded=true; me.draw(false); });
    $('canvas#chart').dblclick(function(e){ 
      me.add(e);
    });
    var me = this;
    $('#chart').bind('touchend', function(event) {
       var e = event.originalEvent;
       var now = new Date().getTime();
       var lastTouch = me.lastTouch || now + 1 /** the first time this will make delta a negative number */;
       var delta = now - lastTouch;
       //console.log(e);
       var x = e.clientX || e.changedTouches[0].clientX;
       var y = e.clientY || e.changedTouches[0].clientY;
       if(delta < 500 && delta > 0 && Math.abs(x-me.prevX) < 20 && Math.abs(y-me.prevY) < 20) {
          me.add(event);
          me.lastTouch = 0;
       } else {
        me.lastTouch = now;
        me.prevX = x;
        me.prevY = y;
      }
    });
  },

  deleteAllPoints: function() {
    for (var i = 0; i < this.handles.length; i++) {
      this.handles[i].remove();
      this.xLabs[i].remove();
      this.yLabs[i].remove();
    };
    this.handles = [];
    this.xLabs = [];
    this.yLabs = [];
    this.questions = [];
    this.ys = []
  },

  setDefaultPoints:function() {
    var middlePoint = [(this.xmax-this.xmin)/2, (this.ymax - this.ymin)/2];
    var endPoint = [this.xmax, this.ymax];
    this.addNewPoint(middlePoint[0], middlePoint[1], true);
    this.addNewPoint(endPoint[0], endPoint[1], true);
    this.customized = false;
  },

  setPoints: function(points) {
    this.deleteAllPoints();

    //Now add either new points or the default points
    if(points) {
      for (var i = 0; i < points.length; i++) {
        this.addNewPoint(points[i][0], points[i][1], true);
      };
      this.customized = true;
    } else {
      this.setDefaultPoints();
    }

    //Remove from all arrays
    this.draw(false);

  },

  addAxisLabels: function(div, width, height) {
      var xAxisLabel = $('<div/>', {'class': 'cubic_spline_xaxis_label'});
      xAxisLabel.css({width: width + 'px'});
      div.append(xAxisLabel);
      //var yAxisLabel = $('div', {'class': 'cubic_spline_yaxis_label'});
      //yAxisLabel.update().css({top: (height / 2 - 9) + 'px'});
      //div.insert(yAxisLabel);
  },
  addPointLabelsX: function(i) {
    var div = $('#'+this.div_id);
    var xLab = $('<div/>', {'class': 'cubic_spline_xlabel'});
    this.xLabs.splice(i, 0, xLab);
    div.append(xLab);
    return xLab;
  },
  addPointLabelsY: function(i) {
    var div = $('#'+this.div_id);
    yLab = $('<div/>', {'class': 'cubic_spline_ylabel'});
    this.yLabs.splice(i, 0, yLab);
    div.append(yLab);
    return yLab;
  },
  addHandle: function(i) {
    var me = this;
    var div = $('#'+this.div_id);
    handle = $('<div/>', {'class': 'cubic_spline_handle'});
    var handleSizeStyle = (this.handleSize + 8) + 'px';
    var handleBRadStyle = (this.handleSize) + 'px';
    handle.css({
     width: handleSizeStyle, 
     height: handleSizeStyle,
     MozBorderRadius: handleBRadStyle, 
     WebkitBorderRadius: handleBRadStyle, 
     borderRadius: handleBRadStyle
    });
    me.handles.splice(i, 0, handle);
    div.append(handle);

    handle.bind('dblclick',  function(e) { 
      var handle_i = _.map(me.handles, function(x){ return x[0]; }).indexOf(this);
      me.delete(handle_i, e); 
    });
    handle.bind('mousedown',  function(e) { 
      var handle_i = _.map(me.handles, function(x){ return x[0]; }).indexOf(this);
      me.slide(handle_i, e); 
    });
    if (me.iOS) handle.bind('touchstart', function(e) {
      var handle_i = _.map(me.handles, function(x){ return x[0]; }).indexOf(this);
      if (me.lastTapTime && new Date().getTime() - me.lastTapTime < 500 && me.lastTapHandle == handle_i)
        me.delete(handle_i, e);
      else 
        me.slide(handle_i, e);
      me.lastTapHandle = handle_i;
      me.lastTapTime = new Date().getTime();
    });


    return handle;
  },
  draw: function(firstTime) {
    var me = this;
    var div = $('#'+this.div_id);
    var canvas = div.children('canvas')[0];
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
    canvas.width = canvas.width;
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
      var hours = Math.floor(Number(x) / 60);
      var minutes = Math.round((Number(x) - (hours * 60)));
      if(minutes < 10) {
        minutes = '0'+ minutes;
      }
      var newXLabel = '';
      if(hours) {
        newXLabel += hours+"h";
      }
      newXLabel+=minutes+'m'
      xLab.html(newXLabel);
      xLab.css({left: (pxX - 75) + 'px', top: (height + 9) + 'px', visibility: 'visible'});
      
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
      yLab.html(y+'&deg');
      yLab.css({top: ((height - pxY) - 10) + 'px', visibility: 'visible'});
    }, function(x, y, pxX, pxY, i) { 

      // x labels
      var xLab;
      if (firstTime) {
         xLab = me.addPointLabelsX(i);
      } else {
         xLab = me.xLabs[i];
      }
      xLab.html(x);
      xLab.css({visibility: 'hidden'});
      
      // y labels
      var yLab;
      if (firstTime) {
        yLab = me.addPointLabelsY(i, y);
      } else {
        yLab = me.yLabs[i];
      }
      yLab.html(y);
      yLab.css({visibility: 'hidden'});

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

      handle.css({left: (pxX - me.handleSize / 2 + 1) + 'px', top: ((height - pxY) - (me.handleSize+12) / 2 + 1) + 'px', visibility: 'visible'});
    }, function(x, y, pxX, pxY, i) {
      if (firstTime) {
          handle = me.addHandle(i);
      } else {
        handle = me.handles[i];     
      }    
      handle.css({visibility: 'hidden'});
    });
  },
  slide: function(i, e) {
    this.customized = true;
    e.stopPropagation();
    e = e.originalEvent;
    var precision = 2;
    var me = this, doc = $('#chart_monotonic');
    var q = me.questions[i];
    me.slideX = parseFloat(q.answer());
    me.slideY = me.ys[i];
    me.slidePxX = e.clientX || e.changedTouches[0].clientX;
    me.slidePyY = e.clientY || e.changedTouches[0].clientY;
    $('#page').css({cursor: 'move'});
    me.setHandleHighlight(i, true);
    var moveFunc = function(e) {
      e.stopPropagation();
      e = e.originalEvent;
      var newX = me.slideX + ((e.clientX || e.changedTouches[0].clientX) - me.slidePxX) / me.xfactor;
      var newY = me.slideY - ((e.clientY || e.changedTouches[0].clientY) - me.slidePyY) / me.yfactor;
      q.answer(me.truncateX(newX, i));
      me.ys[i] = me.truncateY(newY, i);
      me.draw();
    }
    doc.bind('mousemove', moveFunc);
    if (me.iOS) doc.bind('touchmove', moveFunc);
    var upFunc = function(e) { 
      doc.unbind('mousemove');
      if (me.iOS) doc.unbind('touchmove');
      $('#page').css({cursor: 'default'});
      if(me.deleted) {
        me.deleted = false;
        return;
      }
      me.setHandleHighlight(i, false);
    }
    doc.bind('mouseup', upFunc);
    if (me.iOS) {
      doc.bind('touchend', upFunc);
      doc.bind('touchcancel', upFunc);
    }
  },
  add: function(e) {
    e.stopPropagation();
    if(this.handles.length > 5) {
      RadianApp.Utilities.errorModal('Radian only supports up to six key frames.');
      return;
    }
    e = e.originalEvent;
    var me = this, doc = $(document);
    var x = e.clientX || e.changedTouches[0].clientX;
    var y = e.clientY || e.changedTouches[0].clientY;
    var chart = $('#chart');
    var results = chart[0].relMouseCoords(e);
    x = results.x;
    y = chart.height() - results.y;


    x /= me.xfactor;
    y /= me.yfactor;

    x = this.format(x);
    y = this.format(y);

    this.addNewPoint(x, y);
  },

  delete: function(i, e) {
    this.customized = true;
    e.stopPropagation();
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
    this.deleted = true;
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
    x = Math.max(x, this.xminData);
    x = Math.min(x, this.xmaxData);
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
    if(this.handles[i]) {
      this.handles[i].css({background: h ? '#008bca' : '#c8c8c8'});
      this.xLabs[i].css({fontWeight: h ? 'bold' : 'normal'});
      this.yLabs[i].css({fontWeight: h ? 'bold' : 'normal'});
    }
  },
  point: function(question, y) {
    this.questions.push(question);
    this.ys.push(y);
    if(this.domLoaded) {
      (function() { this.draw(); }).bind(this);
    }
  },
  addNewPoint: function(x, y, notFromClick) {
    this.customized = true;
    var i = 0;
    //if(!notFromClick) { y -= 25; }
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
    this.customized = true;
    this.useLinear = isLinear
    this.draw(false);
  },

  getPoints: function() {
    if(!this.customized) return null;
    var points = [];
    for (var i = 0; i < this.questions.length; i++) {
      points.push([Number(this.questions[i].answer()), Number(this.ys[i])]);
    };
    return points;
  },

  isLinear: function() {
    return this.useLinear;
  }

});

})();

