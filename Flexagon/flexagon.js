//Flexagon v1.3.0 copyright (c) Jagorak (https://github.com/Jagorak/)

(function(){
   let mousePos = {x: 0, y: 0};
   let prevMousePos = {x: 0, y: 0};

   const ID_RE = new RegExp(" ");
   const PG_RE = new RegExp("page ");
   const PQ_RE = new RegExp("%");
   const PX_RE = new RegExp("px");
   const FN_RE = new RegExp("\(.*?\)");

   let binderList = [];
   let binderNames = [];
   let zIndex = [];
   let activeBinder;

   window.onload = function(){
      init();
   };

   window.flexagon = function(){
      init();
   };

   function init(){
      let binderNodes = document.querySelectorAll("BINDER");

      for(let binder of binderNodes) loadBinder(binder);

      document.addEventListener('mouseup', function(){
         if(activeBinder) activeBinder.makeInactive();
      }, false);

      document.addEventListener('mousemove', function(e){
         prevMousePos = {
            x: mousePos.x,
            y: mousePos.y
         };

         mousePos = {
            x: e.clientX,
            y: e.clientY
         };

         if(activeBinder){
            activeBinder.pos.x += mousePos.x-prevMousePos.x;
            activeBinder.pos.y += mousePos.y-prevMousePos.y;

            activeBinder.translateX(activeBinder.pos.x);
            activeBinder.translateY(activeBinder.pos.y);
         }
      }, false);
   }

   window.translateBinder = function(x = null, y = null, binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].readNewCSS();
      binderList[binderID].translateX(x);
      binderList[binderID].translateY(y);
   };

   window.resizeBinder = function(width = null, height = null, binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].readNewCSS();
      binderList[binderID].resize(width, height);
   };

   window.bringToFront = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      let i = zIndex.indexOf(binderID);

      zIndex.splice(i, 1);

      for(i; i < zIndex.length; i++) binderList[zIndex[i]].node.style.zIndex--;
      
      zIndex[i] = binderID;
      
      binderList[binderID].node.style.zIndex = i;
   };

   window.openBinder = function(binderID){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      bringToFront(binderID);
      binderList[binderID].show();
   };

   window.closeBinder = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].hide();
   };

   window.getBinder = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      if(binderList[binderID]) return binderList[binderID];
   };

   window.openPage = function(pageID, binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].openPage(pageID);
   };

   window.prevPage = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      let currentPage = binderList[binderID].currentPage;
      if (currentPage > 0) binderList[binderID].openPage(currentPage-1);
   };

   window.nextPage = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      let currentPage = binderList[binderID].currentPage;
      if (currentPage < binderList[binderID].pageList.length-1) binderList[binderID].openPage(currentPage+1);
   };

   window.getCurrentPage = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      return binderList[binderID].currentPage;
   };

   window.dragBinder = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].makeActive();
      bringToFront(binderID);
   };

   window.getBinderIndex = function(binderID = null){
      if(typeof binderID === "number") return binderID;
      else if(typeof binderID === "string") return binderNames[binderID];
      else if(typeof binderID === "object") return binderList.indexOf(binderID);
   };

   window.findParentBinder = function(node){
      while(node){
         if(node.tagName == "SPAN"){
            let id = node.id.split(ID_RE);

            if(id[0] == "binder") return getBinderIndex(id[1]);
         }

         node = node.parentNode;
      }
   };
   
   window.cloneBinder = function(binderName = null, binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      let node = binderList[binderID].node.cloneNode(true);
      
      if(!binderNames[binderName]) node.id = binderName;
      else node.id = "";
      
      document.querySelector("body").appendChild(node);
      
      return loadBinder(node);
   };
   
   window.deleteBinder = function(binderID = null){
      if(!binderID && binderID != 0) binderID = findParentBinder(event.srcElement);
      else binderID = getBinderIndex(binderID);

      binderList[binderID].node.remove();
      binderList[binderID] = undefined;
      let i = zIndex.indexOf(binderID);

      zIndex.splice(i, 1);

      for(i; i < zIndex.length; i++) binderList[zIndex[i]].node.style.zIndex--;
   };
   
   function Binder(node){
      this.node = node;
      this.pos = {x: 0, y: 0};
      this.dim = {width: 0, height: 0};
      this.pageList = [];
      this.pageNames = [];
      this.currentPage = 0;

      this.init = function(){
         let id = this.node.id;
         if(!id) id = (binderList.length).toString();
         this.node.id = "binder " + id;

         this.node.style.display = "block";
         
         if(this.node.tagName == "BINDER"){
            this.node = convertToSpan(this.node);
            
            let pageNodes = this.node.querySelectorAll("PAGE");

            for(let page of pageNodes) this.loadPage(convertToSpan(page));
         }else if(this.node.tagName == "SPAN"){
            let spanNodes = this.node.querySelectorAll("SPAN");

            for(let node of spanNodes) if(PG_RE.test(node.id)) this.loadPage(node);
         }

         this.node.style.position = "fixed";

         this.openPage(0);

         this.readNewCSS();

         this.resize(
            this.node.attributes["width"],
            this.node.attributes["height"]
         );

         this.readNewCSS();

         this.translateX(this.node.attributes["x"]);
         this.translateY(this.node.attributes["y"]);

         if(this.node.attributes["hidden"] !== undefined) if(this.node.attributes["hidden"] != "false") this.node.style.display = "none";
      };
      
      this.loadPage = function(node){
         let pageIndex = this.pageList.push(node)-1;

         let id = node.id;

         if(id) this.pageNames[node.id] = pageIndex;
         else id = (this.pageList.length).toString();
         node.id = "page " + id;

         this.pageNames[pageIndex.toString()] = pageIndex;

         node.style.display = "none";
      };

      this.makeActive = function(){
         this.readNewCSS();
         this.node.style.userSelect = "none";
         activeBinder = this;
      };

      this.makeInactive = function(){
         this.node.style.userSelect = "auto";
         activeBinder = null;
      };

      this.openPage = function(pageID){
         if(typeof pageID === "string") pageID = this.pageNames[pageID];

         this.pageList[this.currentPage].style.display = "none";
         this.pageList[pageID].style.display = "block";

         this.currentPage = pageID;
      };

      this.hide = () => this.node.style.display = "none";
      this.show = () => this.node.style.display = "block";

      this.readNewCSS = function(){
         let CSS = window.getComputedStyle(this.node);

         this.pos = {
            x: parseInt(CSS["left"]),
            y: parseInt(CSS["top"])
         };

         this.dim = {
            width:
               parseInt(CSS["width"]) +
               parseInt(CSS["padding-left"]) +
               parseInt(CSS["padding-right"]),
            height:
               parseInt(CSS["height"]) +
               parseInt(CSS["padding-top"]) +
               parseInt(CSS["padding-bottom"])
         };
      };

      this.translateX = function(x){
         if(typeof x === "number"){
            this.node.style.left = x.toString() + "px";
         }else{
            if(PQ_RE.test(x)){
               x = parseInt(x);
               x = (window.innerWidth*x/100)-(this.dim.width*x/100);

               this.node.style.left = x.toString() + "px";
            }else if(PX_RE.test(x)) this.node.style.left = x;
         }
      };

      this.translateY = function(y){
         if(typeof y === "number"){
            this.node.style.top = y.toString() + "px";
         }else{
            if(PQ_RE.test(y)){
               y = parseInt(y);
               y = (window.innerHeight*y/100)-(this.dim.height*y/100);

               this.node.style.top = y.toString() + "px";
            }else if(PX_RE.test(y)) this.node.style.top = y;
         }
      };

      this.resize = function(width, height){
         if(typeof width === "number"){
            this.node.style.top = width.toString() + "px";
         }else{
            if(PQ_RE.test(width)){
               width = window.innerWidth*parseInt(width)/100;

               this.node.style.width = width.toString() + "px";
            }else if(PX_RE.test(width)) this.node.style.width = width;
         }

         if(typeof height === "number"){
            this.node.style.height = height.toString() + "px";
         }else{
            if(PQ_RE.test(height)){
               height = window.innerHeight*parseInt(height)/100;
               
               this.node.style.height = height.toString() + "px";
            }else if(PX_RE.test(height)) this.node.style.height = height;
         }
      };

      this.init();
   }

   function convertToSpan(oldNode){
      let newNode = document.createElement("SPAN");

      for(let attribute of oldNode.attributes){
         newNode.attributes[attribute.name] = attribute.value;
         
         if(FN_RE.test(attribute.value)) newNode.setAttribute(attribute.name, attribute.value);
      }

      for(let child of oldNode.children) newNode.appendChild(child.cloneNode(true));

      oldNode.parentNode.insertBefore(newNode, oldNode);

      copyStyle(oldNode, newNode);
      newNode.id = oldNode.id;

      oldNode.remove();

      return newNode;
   }

   function copyStyle(oldNode, newNode){
      oldStyle = window.getComputedStyle(oldNode);
      newStyle = window.getComputedStyle(newNode);

      for(let rule of oldStyle) if(oldStyle[rule] != newStyle[rule]) newNode.style[rule] = oldStyle[rule];
   }
   
   function loadBinder(node){
      let binderName = node.id;
      let i = binderList.push(new Binder(node))-1;

      if(binderName) binderNames[binderName] = i;
      binderNames[i.toString()] = i;

      zIndex.push(i);
      binderList[i].node.style.zIndex = zIndex.length-1;
      
      return binderList[i];
   }
})();