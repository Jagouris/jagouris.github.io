// pageQuery v1.1.1
// MIT License
// Copyright (c) 2025 Jagaurus (https://github.com/Jagaurus)

(function(){
	let mousePos = {x: 0, y: 0};
	let prevMousePos = {x: 0, y: 0};
	let activeBinder = null;
	let binders = [];
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

		for(let srcElement of binderElements){
			loadBinder(srcElement, srcElement.id);
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
				}else{
					//if a pageName is not specified then store the index as string
					this.pageNames[i.toString()] = i;
				}
				
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

		this.openPage = function(i){
			if(typeof i !== "number"){
				i = this.pageNames[i];
			}
			
			if(this.pages[i]){
				this.hidePage(this.currentPage);
				this.showPage(i);
				this.currentPage = i;
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
			if(width){
				if(typeof width !== "number"){
					if(width.includes("%")){
						width = window.innerWidth*parseInt(width)/100;
					}else{
						width = parseInt(width);
					}
				}

				this.srcElement.style.width = width;
			}
			
			if(height){
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

	function loadBinder(srcElement, id){
		if(id){
			binders[id] = new Binder(srcElement);
		}else{
			id = binders.push(new Binder(srcElement))-1;
		}

		success = binders[id].init(id);

		if(!success){
			console.log("You must include at least one <page> tag in your binder.");

			binders.splice(id, 1);
		}

		zIndex.push(id);
		binders[id].srcElement.style.zIndex = zIndex.length-1;
	}

	window.bringToFront = function(id){
		let i = zIndex.indexOf(id);

		if(i == -1) i = zIndex.indexOf(parseInt(id));

		zIndex.splice(i, 1);

		for(i; i < zIndex.length; i++){
			binders[zIndex[i]].srcElement.style.zIndex--;
		}

		zIndex[i] = id;
		binders[id].srcElement.style.zIndex = i;
	};

	window.defineBinder = function(srcElement, id = null){
		if(srcElement.tagName != "BINDER"){
			console.log("To load a new binder you must send a <binder> element.");

			return;
		}

		loadBinder(srcElement, id);
	};

	window.findParentBinder = function(srcElement){
		let parentNode = srcElement.parentNode;

		while(parentNode){
			if(parentNode.tagName == "BINDER"){
				if(parentNode.id){
					return parentNode.id;
				}else{
					for(let id in binders){
						if(binders[id].srcElement == parentNode){
							return id;
						}
					}
				}
			}

			parentNode = parentNode.parentNode;
		}

		console.log("This element is not part of a binder object.");
	};

	window.getBinder = function(id){
		if(binders[id]){
			return binders[id];
		}else{
			console.log("That binder doesn't exist.");

			return;
		}
	};

	window.closeBinder = function(id = null){
		if(!id) id = findParentBinder(event.srcElement);

		binders[id].hide();
	};

	window.openBinder = function(id){
		if(!id){
			console.log("Please specify a binder that you'd like to open.");

			return;
		}

		binders[id].show();
		bringToFront(id);
	};

	window.dragBinder = function(id = null){
		if(!id) id = findParentBinder(event.srcElement);

		binders[id].makeActive();
		bringToFront(id);
	};

	window.translateBinder = function(x, y, id = null){
		if(!id) id = findParentBinder(event.srcElement);

		binders[id].updateCurrentStyle();
		binders[id].translate(x, y);
	};
	
	window.resizeBinder = function(width, height, id = null){
		if(!id) id = findParentBinder(event.srcElement);

		binders[id].updateCurrentStyle();
		binders[id].resize(width, height);
	};

	window.prevPage = function(id = null){
		if(!id) id = findParentBinder(event.srcElement);

		let currentPage = binders[id].currentPage;

		if (binders[id].currentPage == 0) console.log("There are no earlier pages.");
		else binders[id].openPage(currentPage-1);
	};

	window.nextPage = function(id = null){
		if(!id) id = findParentBinder(event.srcElement);

		let currentPage = binders[id].currentPage;

		if(currentPage == binders[id].pages.length-1) console.log("There are no later pages.");
		else binders[id].openPage(currentPage+1);
	};

	window.openPage = function(page, id = null){
		if(!id) id = findParentBinder(event.srcElement);

		binders[id].openPage(page);
	};

	window.getCurrentPage = function(id = null){
		if(!id) id = findParentBinder(event.srcElement);

		return binders[id].currentPage;
	};
})();