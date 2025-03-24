// pageQuery v1.1.2
// MIT License
// Copyright (c) 2025 Jagorak (https://github.com/Jagorak)

(function(){
	let mousePos = {x: 0, y: 0};
	let prevMousePos = {x: 0, y: 0};
	let activeBinder = null;
	let binders = [];
	let binderNames = [];
	let zIndex = [];

	window.onload = function(){
		init();
	};
	
	window.pageQuery = function(){
		init();
	};

	function init(){
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

				activeBinder.translate(activeBinder.pos.x, activeBinder.pos.y);
			}
		}, false);

		let binderElements = document.getElementsByTagName("BINDER");
		
		for(let binder of binderElements){
			loadBinder(binder);
		}
	}

	function Binder(srcElement){
		this.srcElement = srcElement;
		this.pos = {x: 0, y: 0};
		this.shape = {width: 0, height: 0};
		this.pages = [];
		this.pageNames = [];
		//Currentpage always contains the index of pages[] and not the pageName
		this.currentPage = undefined;

		this.init = function(){
			this.srcElement.style.position = "fixed";

			let pageElements = this.srcElement.getElementsByTagName("PAGE");

			for(let page of pageElements){
				i = this.pages.push(page)-1;
				
				let pageName = page.getAttribute("id");
				
				if(pageName){
					this.pageNames[pageName] = i;
				}
				
				this.pageNames[i.toString()] = i;
				
				if(this.currentPage === undefined) this.currentPage = i;
				
				this.hidePage(i);
			}

			if(this.currentPage === undefined){
				console.log(this.srcElement.id);

				return false;
			}
			
			this.showPage(this.currentPage);
			
			this.updateCurrentStyle();
			
			this.resize(
				this.srcElement.getAttribute("width"),
				this.srcElement.getAttribute("height")
			);
			
			this.updateCurrentStyle();
			
			this.translate(
				this.srcElement.getAttribute("x"),
				this.srcElement.getAttribute("y")
			);
			
			if(this.srcElement.getAttribute("visible") == "false") this.hide();
			
			return true;
		};

		this.openPage = function(pageID){
			if(typeof pageID !== "number"){
				pageID = this.pageNames[pageID];
			}
			
			if(this.pages[pageID]){
				this.hidePage(this.currentPage);
				this.showPage(pageID);
				this.currentPage = pageID;
			}else{
				console.log("That page doesn't exist.");
			}
		};

		this.makeActive = function(){
			this.updateCurrentStyle();
			this.srcElement.style.userSelect = "none";

			activeBinder = this;
		};

		this.makeInactive = function(){
			this.srcElement.style.userSelect = "auto";

			activeBinder = null;
		};

		this.updateCurrentStyle = function(){
			let currentStyle = window.getComputedStyle(this.srcElement);

			this.pos = {
				x: parseInt(currentStyle.getPropertyValue("left")),
				y: parseInt(currentStyle.getPropertyValue("top"))
			};
			
			this.shape = {
				width:
					parseInt(currentStyle.getPropertyValue("width")) +
					parseInt(currentStyle.getPropertyValue("padding-left")) +
					parseInt(currentStyle.getPropertyValue("padding-right")),
				height:
					parseInt(currentStyle.getPropertyValue("height")) +
					parseInt(currentStyle.getPropertyValue("padding-top")) +
					parseInt(currentStyle.getPropertyValue("padding-bottom"))
			};
		};

		this.translate = function(x, y){
			if(x || x == 0){
				if(typeof x !== "number"){
					if(x.includes("%")){
						x = (window.innerWidth*parseInt(x)/100)-(this.shape.width*parseInt(x)/100);
					}else{
						x = parseInt(x);
					}
				}

				this.srcElement.style.left = x;
			}
			
			if(y || y == 0){
				if(typeof y !== "number"){
					if(y.includes("%")){
						y = (window.innerHeight*parseInt(y)/100)-(this.shape.height*parseInt(y)/100);
					}else{
						y = parseInt(y);
					}
				}

				this.srcElement.style.top = y;
			}
		};
		
		this.resize = function(width, height){
			if(width || width == 0){
				if(typeof width !== "number"){
					if(width.includes("%")){
						width = window.innerWidth*parseInt(width)/100;
					}else{
						width = parseInt(width);
					}
				}

				this.srcElement.style.width = width;
			}
			
			if(height || height == 0){
				if(typeof height !== "number"){
					if(height.includes("%")){
						height = window.innerWidth*parseInt(height)/100;
					}else{
						height = parseInt(height);
					}
				}

				this.srcElement.style.height = height;
			}
		};

		this.hide = function(){
			this.srcElement.style.display = "none";
		};

		this.show = function(){
			this.srcElement.style.display = "block";
		};

		this.hidePage = function(i){
			this.pages[i].style.display = "none";
		};

		this.showPage = function(i){
			this.pages[i].style.display = "block";
		};
	}

	function loadBinder(srcElement){
		let i = binders.push(new Binder(srcElement))-1;
		
		let success = binders[i].init();
		
		if(!success){
			console.log("You must include at least one <page> tag in your binder.");
			binders.splice(i, 1);
			
			return;
		}
		
		//store the id as well as the index as a string (lazy solution for now)
		let binderName = srcElement.getAttribute("id");
		
		if(binderName){
			binderNames[binderName] = i;
		}
		
		binderNames[i.toString()] = i;
		
		zIndex.push(i);
		
		console.log(binders[i].srcElement);
		binders[i].srcElement.style.zIndex = zIndex.length-1;
	}
	
	function getBinderIndex(binderID){
		if(typeof binderID === "string") return binderNames[binderID];
		else return binderID;
	}

	window.bringToFront = function(binderID){
		binderID = getBinderIndex(binderID);
		
		let i = zIndex.indexOf(binderID);

		zIndex.splice(i, 1);

		for(i; i < zIndex.length; i++){
			binders[zIndex[i]].srcElement.style.zIndex--;
		}

		zIndex[i] = binderID;
		binders[binderID].srcElement.style.zIndex = i;
	};

	
	//this doesn't work yet
	window.defineBinder = function(srcElement, binderID = null){
		if(srcElement.tagName != "BINDER"){
			console.log("To load a new binder you must send a <binder> element.");

			return;
		}

		loadBinder(srcElement);
	};

	window.findParentBinder = function(srcElement){
		let parentNode = srcElement.parentNode;

		while(parentNode){
			if(parentNode.tagName == "BINDER"){
				if(parentNode.id){
					let binderID = getBinderIndex(parentNode.id);
					
					return binderID;
				}else{
					for(let binderID in binders){
						if(binders[binderID].srcElement == parentNode){
							return id;
						}
					}
				}
			}

			parentNode = parentNode.parentNode;
		}

		console.log("This element is not part of a binder object.");
	};

	window.getBinder = function(binderID){
		binderID = getBinderIndex(binderID);
		
		if(binders[binderID]){
			return binders[binderID];
		}else{
			console.log("That binder doesn't exist.");

			return;
		}
	};

	window.closeBinder = function(binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		binders[binderID].hide();
	};

	window.openBinder = function(binderID){
		if(!binderID){
			console.log("Please specify a binder that you'd like to open.");

			return;
		}
		
		binderID = getBinderIndex(binderID);

		binders[binderID].show();
		bringToFront(binderID);
	};

	window.dragBinder = function(binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		binders[binderID].makeActive();
		bringToFront(binderID);
	};

	window.translateBinder = function(x, y, binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		binders[binderID].updateCurrentStyle();
		binders[binderID].translate(x, y);
	};
	
	window.resizeBinder = function(width, height, binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		binders[binderID].updateCurrentStyle();
		binders[binderID].resize(width, height);
	};

	window.prevPage = function(binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		let currentPage = binders[binderID].currentPage;

		if (binders[binderID].currentPage == 0) console.log("There are no earlier pages.");
		else binders[binderID].openPage(currentPage-1);
	};

	window.nextPage = function(binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		let currentPage = binders[binderID].currentPage;

		if(currentPage == binders[binderID].pages.length-1) console.log("There are no later pages.");
		else binders[binderID].openPage(currentPage+1);
	};

	window.openPage = function(pageID, binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		binders[binderID].openPage(pageID);
	};

	window.getCurrentPage = function(binderID = null){
		if(!binderID) binderID = findParentBinder(event.srcElement);
		else binderID = getBinderIndex(binderID);

		return binders[binderID].currentPage;
	};
})();