         var $ = jQuery;

         var Map = function(div) {
            this.$div = $(div);

            this.scale = 800;

            this.data = null;
            this.streets = new Array();

   // Add canvas
   this.$canvas = $("<canvas id='map-canvas'></canvas>");
   this.$canvas[0].width = this.$div.width();
   this.$canvas[0].height = this.$div.height();

   this.$div.append(this.$canvas);

   // Register events
   var _this = this;
   $(window).on('resize', function() {
      clearTimeout(_this.resizeTimeout);
      _this.resizeTimeout = setTimeout(function() {
         _this.draw();
      }, 500);
   });

   this.$canvas.on('mousewheel', function(event) {
      _this.scale = Math.max(100, _this.scale - event.originalEvent.deltaY / 2);
      _this.draw();
   });

   this.$canvas.on('mousedown', function(event) {
      _this.last_position = {
         x: event.clientX,
         y: event.clientY
      };

      $(this).bind('mousemove', function(event) {
         var delta = {
            x: _this.last_position.x - event.clientX,
            y: _this.last_position.y - event.clientY
         };
   /*         
        _this.data.area[0] -= delta.y / (10 * _this.scale);
        _this.data.area[2] -= delta.y / (10 * _this.scale);
        
        _this.data.area[1] += delta.x / (10 * _this.scale);
        _this.data.area[3] += delta.x / (10 * _this.scale);
        */
        _this.data.bbox[1] -= delta.y / (10 * _this.scale);
        _this.data.bbox[3] -= delta.y / (10 * _this.scale);
        
        _this.data.bbox[0] += delta.x / (10 * _this.scale);
        _this.data.bbox[2] += delta.x / (10 * _this.scale);   

        _this.last_position = {
         x: event.clientX,
         y: event.clientY
        };
        
        _this.draw();
    });
   });

   this.$canvas.on('mouseup', function(event) {
      $(this).unbind('mousemove');
   })

   return this;
   };

   Map.prototype.load = function(osm) {
      var _this = this;
      $.getJSON(osm, function(data) {
         _this.data = data;
         _this.draw();

         $(_this).trigger('data_updated');
      });
   };

// render MAP

   Map.prototype.draw = function() {
      var _this = this;

      var ctx = this.$canvas[0].getContext('2d');

      this.$canvas[0].width = this.$div.width();
      this.$canvas[0].height = this.$div.height();
      ctx.width = this.$div.width();
      ctx.height = this.$div.height();

   //坐标缩放权值
   var xmult = this.scale / (this.data.bbox[2] - this.data.bbox[0]);
   var ymult = this.scale / (this.data.bbox[3] - this.data.bbox[1]);

   var m = new Array;
    var n = new Array;
   var way_name = new Array;
   var num = 0;

   $.each(this.data.features, function(indx, way) { 

      var fillColour = 'black'; 
      ctx.fillStyle = 'black'; 
     if (way.properties.highway === undefined) {     // river || building || water area
      ctx.beginPath();

      var hasInRange = false;
         //var fillColour = 'black'; 
//river
        if(way.properties.waterway === 'river'){
         $.each(way.geometry.coordinates, function(nindx, node) {
            var x = (node[0] - _this.data.bbox[0]) * xmult;
            var y = (_this.data.bbox[3] - node[1]) * ymult;

            if (nindx === 0) {
               ctx.moveTo(x, y);
            } else {
               ctx.lineTo(x, y);
            }

            if (node[0] > Math.min(_this.data.bbox[0], _this.data.bbox[2]) && node[0] < Math.max(_this.data.bbox[0], _this.data.bbox[2])) { hasInRange = true };
            if (node[1] > Math.min(_this.data.bbox[1], _this.data.bbox[3]) && node[1] < Math.max(_this.data.bbox[1], _this.data.bbox[3])) { hasInRange = true };
         });

        switch(way.properties.waterway){ // river
         case 'river':
         ctx.lineWidth = 3;
         fillClour = '#0088FF';
         break;
        }      

        ctx.lineWidth += 2;
        ctx.strokeStyle = fillClour;
        ctx.stroke();
    }
//building water area
        else{//building water area
         $.each(way.geometry.coordinates[0], function(nindx, node) {
            var x = (node[0] - _this.data.bbox[0]) * xmult;
            var y = (_this.data.bbox[3] - node[1]) * ymult;


            if (nindx === 0) {
               ctx.moveTo(x, y);
            } else {
               ctx.lineTo(x, y);
            }

            if (node[0] > Math.min(_this.data.bbox[0], _this.data.bbox[2]) && node[0] < Math.max(_this.data.bbox[0], _this.data.bbox[2])) { hasInRange = true };
            if (node[1] > Math.min(_this.data.bbox[1], _this.data.bbox[3]) && node[1] < Math.max(_this.data.bbox[1], _this.data.bbox[3])) { hasInRange = true };
         });

         if (!hasInRange) { return; };
         ctx.lineWidth = 1;
         fillColour = '#D3D3D3';       
         switch(way.properties.water){
            case 'lake':
            fillColour = '#b5d0d0';
            break;
         }

         ctx.fillStyle = fillColour;
         ctx.globalAlpha = 0.9; 
         ctx.strokeStyle = '#888888';    
         ctx.fill();
         ctx.stroke();

          if(way.properties.name === undefined) return ;
          else{
          //鼠标在上面时显示建筑名字   
          }

        }
        /*
        ctx.fillStyle = 'black'; 
         ctx.font="20px Georgia";      
         ctx.fillText('hello',m,n); 
         */
    };
    ctx.fillStyle = 'black'; 


// [ways] :motorway primary secondary tertiary road/residential
     if(true) {

      ctx.beginPath();

      var hasInRange = false;
      $.each(way.geometry.coordinates, function(nindx, node) {
         var x = (node[0] - _this.data.bbox[0]) * xmult;
         var y = (_this.data.bbox[3] - node[1]) * ymult;




         if (nindx === 0) {
            ctx.moveTo(x, y);
            if(way.properties.name!=undefined){
               m[num]=x;
               n[num]=y;
               way_name[num]=way.properties.name;
               num += 1;
            }
            
            //ctx.fillText=(way.properties.name,m,n);
         } 
         else {
            ctx.lineTo(x, y);
         }
         //ctx.fillText(way_name[num],m[num],n[num]); 
         
         if (node[0] > Math.min(_this.data.bbox[0], _this.data.bbox[2]) && node[0] < Math.max(_this.data.bbox[0], _this.data.bbox[2])) { hasInRange = true };
         if (node[1] > Math.min(_this.data.bbox[1], _this.data.bbox[3]) && node[1] < Math.max(_this.data.bbox[1], _this.data.bbox[3])) { hasInRange = true };
      });

      if (!hasInRange) { return; };

      ctx.lineWidth = 1;
      var fillClour = '#ddd';
      var strokeClour = 'transparent';

   //var color = d3.scale.category20(); // d3.js

     switch(way.properties.highway) { //ways
      case 'residential':
      case 'unclassified':
      case 'road':
      ctx.lineWidth = 4;
      fillClour = '#ddd';
      strokeClour = '#999';

      break;

      case 'tertiary':
      case 'tertiary_link':
      ctx.lineWidth = 6;
      fillClour = '#f8f8ba';
      strokeClour = '#bbb';

      break;

      case 'secondary':
      case 'secondary_link':
      ctx.lineWidth = 7;
      fillClour = '#f9d6aa';
      strokeClour = '#a37b48';

      break;

      case 'primary':
      case 'primary_link':
      ctx.lineWidth = 8;
      fillClour = '#dd9f9f';
      strokeClour = '#8d4346';

      break;

      case 'trunk':
      case 'trunk_link':
      ctx.lineWidth = 9;
      fillClour = '#94d494';
      strokeClour = '#477147';

      break;

      case 'motorway':
      case 'motorway_link':
      ctx.lineWidth = 10;
      fillClour = '#89a4cb';
      strokeClour = '#506077';

      break;
     }  

     ctx.lineWidth += 1;
     ctx.strokeStyle = strokeClour;
     ctx.stroke();

     ctx.lineWidth -= 1;
     ctx.strokeStyle = fillClour;
     ctx.stroke();


      if(way.properties.name === undefined) return ;
      else{
/*
         var way_name = way.properties.name;
        ctx.fillstyle = 'black';
        ctx.font="20px Arial";
        ctx.textBaseline="middle";
        ctx.textAlign = "center";
        ctx.fillText(way_name,m,n); 
*/
      }
     
   };
//ctx.fillText(num,m[num-1],n[num-1]);
   }); // .each(this.data.features, function(indx, way)

   for (var i = 0; i < way_name.length; i++) {
        ctx.fillstyle = 'black';
        ctx.font="20px Arial";
        ctx.textBaseline="middle";
        ctx.textAlign = "center";
        ctx.fillText(way_name[i],m[i],n[i]);
        //相同路名只显示一次
        for (var j = i; j <way_name.length; j++) {
         if(way_name[j]===way_name[j+1]) j++;
         else{
            i=j; 
            break;
         }
        };
   }; 


   } // draw function