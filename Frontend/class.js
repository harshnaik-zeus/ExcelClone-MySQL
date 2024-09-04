class ExcelSheet {
	constructor() {
		/**
		 * @type {HTMLCanvasElement} Main Body, initializing Excel.
		 */
		this.id = document.getElementById("canvas1");
		this.header = document.getElementById("canvas2");
		this.excel = document.getElementById("canvas3");
		this.container = document.getElementById("container");
		this.infinitediv = document.getElementById("mainbig");
		this.scale = window.devicePixelRatio;
		this.fixheight = 20;
		this.fixwidth = 100;
		this.excelheight = 740;
		this.excelwidth = 2000;
		this.cellHeight = this.fixheight;
		this.cellWidth = this.fixwidth;
		this.rows = 20;
		this.cols = 50;
		this.startCell = { col: 0, row: 0 };
		this.endCell = { col: 0, row: 0 };
		this.laststart = { col: 0, row: 0 };
		this.lastend = { col: 0, row: 0 };
		this.startX = 1;
		this.startY = 1;
		this.copyToClipboardString = "";
		this.copyToClipboardData = [];
		this.lastchange = 0;
		this.update = { data: -1, row: -1, col: -1 };

		/**
		 * array of colomns widths and row heights
		 */
		this.cellWidths = Array(50).fill(this.cellWidth);
		this.rowHeights = Array(100000).fill(this.cellHeight);

		// marching ants flag
		this.marchingants = false;

		//selection flags
		this.chartselect = null;
		this.isSelected = false;
		this.widthresize = false;
		this.heightresize = false;
		this.prevcell = { col: 0, row: 0 };
		this.startpoint = null;
		this.endpoint = null;
		this.target = -1;
		this.isHeadMoving = false;
		this.headselection = false;
		this.headtarget = -1;
		this.surplus = 0;
		this.rowStartPoint = null;
		this.rowEndPoint = null;
		this.rowTarget = -1;
		this.isIdMoving = false;
		this.idselection = false;
		this.idtarget = false;
		this.idsurplus = 0;
		this.prevstart = null;
		this.data = new Map();

		/**
		 * naming of elements
		 */
		this.ants = document.querySelector(".marching-ants");
		this.bargraph = document.getElementById("bar");
		this.linegraph = document.getElementById("line");
		this.uploadform = document.getElementById("uploadForm");
		this.progressbar = document.getElementById("progressbar");
		this.finddiv = document.getElementById("findandreplace");
		this.dialoguebox = document.getElementsByClassName("find-replace-container")[0];
		this.closedialoguebox = document.getElementsByClassName("close-button")[0];
		this.findbutton = document.getElementById("findclicked");
		this.replacebutton = document.getElementById("replaceclicked");
		this.findtext = document.getElementById("findTextId");
		this.findtorep = document.getElementById("findReplaceTextId");
		this.replacetext = document.getElementById("replaceTextId");
		this.findall = document.getElementById("findallbtn");
		this.replaceall = document.getElementById("replaceallbtn");


		/**
		 * Get frontend started
		 */
		this.loadData(0);
		this.initializeCanvas();
		this.addEventListeners();
		this.drawTable(this.startX, this.startY);

	}

	/**
	 * Initialize Canvas
	 */
	initializeCanvas() {
		this.id.width = this.fixheight;
		this.id.height = this.excelheight;
		this.header.width = this.excelwidth;
		this.header.height = this.fixheight;
		this.excel.height = this.excelheight;
		this.excel.width = this.excelwidth;
		this.a = this.id.getContext("2d");
		this.b = this.header.getContext("2d");
		this.c = this.excel.getContext("2d");
	}

	/**
	 * Adding Eventlisteners
	 */
	addEventListeners() {
		this.excel.addEventListener("pointerdown", this.handleExcelPointerDown.bind(this));
		this.header.addEventListener("pointerdown", this.handleHeaderPointerDown.bind(this));
		this.id.addEventListener("pointerdown", this.handleIdPointerDown.bind(this));
		document.addEventListener("pointermove", this.handlePointerMove.bind(this));
		document.addEventListener("pointerup", this.handlePointerUp.bind(this));
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
		this.header.addEventListener("dblclick", this.handleHeaderDoubleClick.bind(this));
		this.excel.addEventListener("dblclick", this.handleExcelDoubleClick.bind(this));
		window.addEventListener("resize", this.handleDevicePixelRatio.bind(this));
		ipbox.addEventListener("keydown", this.SaveData.bind(this));
		this.bargraph.addEventListener("click", this.CreateBarGraph.bind(this));
		this.linegraph.addEventListener("click", this.CreateLineGraph.bind(this));
		this.infinitediv.addEventListener("scroll", this.handleViewPort.bind(this));
		this.uploadform.addEventListener("submit", this.submitcsv.bind(this));
		this.finddiv.addEventListener("click", this.showfindrepdiv.bind(this));
		this.closedialoguebox.addEventListener("click", this.hidefindrepdiv.bind(this));
		this.findbutton.addEventListener("click", this.showfinds.bind(this));
		this.replacebutton.addEventListener("click", this.showreplace.bind(this));
		this.findall.addEventListener("click", this.findallbtn.bind(this));
		this.replaceall.addEventListener("click", this.replaceallbtn.bind(this));
		this.copyToClipboard = this.copyToClipboard.bind(this);
		this.updateCell = this.updateCell.bind(this);
		// this.getdataforchart = this.getdataforchart.bind(this);
		// this.findtorep.addEventListener("click", this.findtorepbox.bind(this));
		// this.findtext.addEventListener("click", this.findtextbox.bind(this));
		// this.replacetext.addEventListener("click", this.replacetextbox.bind(this));
		this.handleProgressBar = this.handleProgressBar.bind(this);
		this.deleteCells = this.deleteCells.bind(this);
		// document.querySelectorAll("tab-button").addEventListener("click", this.openTab.bind(this));
	}




	/**
	 * @function Loads Data
	 * @param {startX} s = from where to load data 
	 */
	async loadData(s) {
		try {
			const response = await axios.get(`http://localhost:5099/api/getPageData?id=${s}`);
			if (response.data) {
				for (var arr in response.data) {
					var temp = [];
					for (var i in response.data[arr]) {
						temp.push(response.data[arr][i]);
					}
					this.data[s] = (temp);
					s++;
				}
				this.drawTable(this.startX, this.startY);
				console.log(this.startX, "a");
			}
		} catch (error) {
			console.error("Error loading data:", error);
		}
	}


	/**
	 * @function Draws Header
	 */
	drawHeaders(y) {
		let start = 0.5;
		this.b.textAlign = "center";
		this.b.textBaseline = "middle";
		this.b.font = "12px Calibri";
		for (let i = 0; i < 26; i++) {
			let char = String.fromCharCode(65 + i + y - 1);
			this.b.save();
			this.b.beginPath();
			this.b.lineWidth = 0.2;
			this.b.moveTo(start, 0);
			this.b.lineTo(start, this.fixheight);
			this.b.fillText(char, start + this.cellWidths[i] / 2, this.fixheight / 2);
			start += this.cellWidths[i];
			this.b.stroke();
			this.b.restore();
		}
	}

	/**
	 * @function Draws Ids
	 */
	drawIds(x) {
		this.a.textAlign = "center";
		this.a.textBaseline = "middle";
		this.a.font = "10px Calibri";
		let start = 0.5;
		for (let i = 0; i < 50; i++) {
			this.a.save();
			this.a.beginPath();
			this.a.lineWidth = 0.2;
			this.a.moveTo(0, start);
			this.a.lineTo(this.fixheight, start);
			start += this.rowHeights[i];
			this.a.fillText(
				x++,
				this.fixheight / 2,
				start - this.rowHeights[i] / 2
			);
			this.a.stroke();
			this.a.restore();
		}
	}

	/**
	 * draws vertical and horizontal lines and fills data
	 */
	drawExcel(s, t) {
		this.c.textAlign = "left";
		this.c.textBaseline = "middle";
		this.c.font = "14px Calibri";
		this.c.fontWeight = "600";
		let startX = 0.5;
		let startY = 0.5;

		for (let index = 0; index <= this.cellWidths.length; index++) {
			this.c.save();
			this.c.beginPath();
			this.c.moveTo(startX, 0);
			this.c.lineTo(startX, this.excelheight);
			this.c.lineWidth = 0.3;
			this.c.fillStyle = "#e3e3e3";
			startX += this.cellWidths[index];
			this.c.stroke();
			this.c.restore();
		}

		for (let index = 0; index <= 37; index++) {
			this.c.save();
			this.c.beginPath();
			this.c.fillStyle = "#e3e3e3";
			this.c.moveTo(0, startY);
			this.c.lineTo(this.excelwidth, startY);
			this.c.lineWidth = 0.3;
			startY += this.rowHeights[index];
			this.c.stroke();
			this.c.restore();
		}
		let y = 15;
		for (let i = s - 1; i <= s + 37; i++) {
			let x = 5;
			for (let j = t + 1; j < 15 + t; j++) {

				this.c.save();
				this.c.beginPath();
				this.c.rect(x, y - this.rowHeights[i] / 2, this.cellWidths[j] - 10, this.rowHeights[i]);
				this.c.clip();

				if (this.data[i] && this.data[i][j]) {
					this.c.fillText(this.data[i][j], x, y);
				}
				this.c.restore();
				x += this.cellWidths[j];
			}
			y += this.rowHeights[i];
		}
	}


	/**
	 * @function Draws Table
	 * @param {start row} x 
	 * @param {start colomn} y 
	 */

	drawTable(x, y) {
		x = Math.max(x, 1);
		y = Math.max(y, 1);
		this.a.clearRect(0, 0, this.id.width, this.id.height);
		this.b.clearRect(0, 0, this.header.width, this.header.height);
		this.c.clearRect(0, 0, this.excel.width, this.excel.height);
		this.drawSelection(x);
		this.drawHeaders(y);
		this.drawIds(x);
		this.drawExcel(x, y - 1);
	}

	/**
	 * @param {x-position of event} x
	 * @param {y-position of event} y
	 * @returns cell-position
	 */

	getCellAtPosition(x, y) {
		let col = 0;
		let row = 0;
		let yPos = y;
		let xPos = x;
		while (yPos > this.rowHeights[row] && row < this.rowHeights.length - 1) {
			yPos -= this.rowHeights[row];
			row++;
		}
		while (xPos > this.cellWidths[col] && col < this.cellWidths.length - 1) {
			xPos -= this.cellWidths[col];
			col++;
		}
		return { col, row };
	}

	/**
	 * 
	 * @param {Event} x 
	 * @param {Event} y 
	 * @returns distance from left and top
	 */
	getLeftandTop(x, y) {
		let left = 0;
		let top = 0;
		let sum1 = 0;
		let sum2 = 0;
		let width = -1;
		let height = -1;
		for (let index = 0; index < this.cellWidths.length; index++) {
			if (sum1 + this.cellWidths[index] <= x) {
				sum1 += this.cellWidths[index];
				continue;
			}
			else {
				left = sum1;
				width = this.cellWidths[index];
				break;
			}
		}
		for (let index = 0; index < 37; index++) {
			if (sum2 + this.rowHeights[index] <= y) {
				sum2 += this.rowHeights[index];
				continue;
			}
			else {
				top = sum2;
				height = this.rowHeights[index];
				break;
			}
		}
		return { left, top, width, height };
	}

	/**
	 * @function Draws Big selection green box behind all three canvas and adds rect with a border to give selection effect
	 * Draws marching ants around selection
	 */

	drawSelection(x) {
		if (this.startCell && this.endCell) {
			let startX = Math.min(this.startCell.col, this.endCell.col);
			let endX = Math.max(this.startCell.col, this.endCell.col);
			let startY = Math.min(this.startCell.row, this.endCell.row);
			let endY = Math.max(this.startCell.row, this.endCell.row);
			let heightSum = 0.5,
				widthSum = 0.5;
			let startHeight = 0.5,
				startWidth = 0.5;
			for (let row = 0; row < startY; row++) {
				heightSum += this.rowHeights[row];
			}
			startHeight = heightSum;
			this.c.save();
			this.c.beginPath();
			for (let row = startY; row <= endY; row++) {
				widthSum = 0.5;
				for (let col = 0; col < startX; col++) {
					widthSum += this.cellWidths[col];
				}
				startWidth = widthSum;
				for (let col = startX; col <= endX; col++) {
					this.c.fillStyle = "#e6ffe6";
					this.c.fillRect(
						widthSum,
						heightSum,
						this.cellWidths[col],
						this.rowHeights[row]
					);
					widthSum += this.cellWidths[col];
				}
				heightSum += this.rowHeights[row];
			}
			this.c.stroke();
			this.c.restore();

			this.b.save();
			this.b.beginPath();
			if (this.headselection) {
				this.b.fillStyle = "#107c41";
			} else {
				this.b.fillStyle = "#caead8";
			}
			this.b.fillRect(
				startWidth + 0.5,
				0.5,
				widthSum - startWidth,
				this.cellHeight
			);
			this.b.stroke();
			this.b.restore();

			this.a.save();
			this.a.beginPath();
			if (this.idselection) {
				this.a.fillStyle = "#107c41";
			} else {
				this.a.fillStyle = "#caead8";
			}
			this.a.fillRect(
				0.5,
				startHeight + 0.5,
				this.cellWidth,
				heightSum - startHeight
			);
			this.a.stroke();
			this.a.restore();

			this.c.save();
			this.c.beginPath();
			this.c.strokeStyle = "rgb(16,124,65)";
			this.c.strokeRect(
				startWidth - 0.5,
				startHeight - 0.5,
				widthSum - startWidth + 1,
				heightSum - startHeight + 1
			);
			this.c.stroke();
			this.c.restore();

			this.laststart = this.startCell;
			this.lastend = this.endCell;
			if (this.marchingants) {
				if (x == 1) x = 0;
				this.drawants(
					startWidth - 0.5 + 20,
					startHeight - 0.5 + ((x + 1) * 20),
					widthSum - startWidth + 1 - 14,
					heightSum - startHeight + 1 - 14
				);
			}
		}
		// console.log(this.startX);
		// this.handleTextbox(this.start);
	}

	/**
	 * @param {distance from left} left
	 * @param {distance from top} top
	 * @param {width of div} width
	 * @param {height of div} height
	 * @returns Displays div of marching ants
	 */
	drawants(left, top, width, height) {
		this.ants.style.display = "block";
		this.ants.style.left = `${left + 1}px`;
		this.ants.style.top = `${top + 1}px`;
		this.ants.style.width = `${width + 20}px`;
		this.ants.style.height = `${height + 20}px`;
	}

	/**
	 * @param {PointerEvent} event Down
	 * @type {EventListener} for excel to start range selection
	 */

	handleExcelPointerDown(event) {
		this.isSelected = true;
		this.widthresize = false;
		this.heightresize = false;
		const rect = this.excel.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		this.startCell = this.getCellAtPosition(x, y);
		this.endCell = this.startCell;
		// this.handleTextbox(event);
		this.drawTable(this.startX, this.startY);
		// console.log(this.startY);
	}

	/**
	 * @type {EventListener} for header selection / Resizing
	 * @param {PointerEvent} event Down
	 * @returns target index
	 */
	handleHeaderPointerDown(event) {
		this.isSelected = false;
		this.widthresize = true;
		this.heightresize = false;
		let dotline = document.getElementById("dottedline");
		dotline.style.display = "none";
		this.startpoint = event.offsetX;
		let sum = 0;
		for (let index = 0; index < this.cellWidths.length; index++) {
			sum += this.cellWidths[index];
			if (Math.abs(sum - this.startpoint) <= 10) {
				this.isHeadMoving = true;
				this.surplus = sum - this.startpoint;
				this.target = index;
				return;
			} else if (this.startpoint <= sum) {
				this.headselection = true;
				this.headtarget = index;
				return;
			}
		}
	}

	/**
	 * @type {EventListener} for id selection / Resizing
	 * @param {PointerEvent} event Down
	 * @returns target index
	 */
	handleIdPointerDown(event) {
		this.isSelected = false;
		this.widthresize = false;
		this.heightresize = true;
		let dotline = document.getElementById("dottedline");
		dotline.style.display = "none";
		const rect = this.excel.getBoundingClientRect();
		this.rowStartPoint = event.clientY - rect.top;
		let sum = 0;
		for (let index = this.startY - 1; index < 37; index++) {
			sum += this.rowHeights[index];
			if (Math.abs(sum - this.rowStartPoint) <= 5) {
				this.rowTarget = index;
				this.idsurplus = sum - this.rowStartPoint;
				this.isIdMoving = true;
				return;
			} else if (this.rowStartPoint <= sum) {
				this.idselection = true;
				this.idtarget = index;
				return;
			}
		}
	}

	/**
	 * @type {EventListener} on Document
	 * @param {PointerEvent} event Move
	 */

	handlePointerMove(event) {
		if (this.isSelected) {
			if (this.startCell) {
				const rect = this.excel.getBoundingClientRect();
				let x = event.clientX - rect.left;
				let y = event.clientY - rect.top;
				this.endCell = this.getCellAtPosition(x, y);
				this.drawTable(this.startX, this.startY);
			}
		}

		if (this.widthresize && this.isHeadMoving) {
			let org = this.cellWidths[this.target];
			const rect = this.excel.getBoundingClientRect();
			let currpoint = event.clientX - rect.left;
			let currdiff = currpoint - this.startpoint;
			this.cellWidths[this.target] += currdiff;
			this.b.clearRect(0, 0, this.header.width, this.header.height);
			this.startCell = this.laststart;
			this.endCell = this.lastend;
			this.drawHeaders(this.startY);
			this.cellWidths[this.target] = org;
			let dotline = document.getElementById("dottedline");
			dotline.style.display = "block";
			dotline.style.left = `${event.clientX - rect.x + 20 + this.surplus}px`;
			dotline.style.top = "20px";
			dotline.style.height = "800px";
			dotline.style.borderTop = "none";
			dotline.style.borderLeft = "2px dotted #999";
		}

		if (this.heightresize && this.isIdMoving) {
			const rect = this.excel.getBoundingClientRect();
			let org = this.rowHeights[this.rowTarget];
			let currpoint = event.clientY - rect.top;
			let currdiff = currpoint - this.rowStartPoint;
			this.rowHeights[this.rowTarget] += currdiff;
			this.a.clearRect(0, 0, this.id.width, this.id.height);
			this.startCell = this.laststart;
			this.endCell = this.lastend;
			this.drawIds(this.startY);
			this.rowHeights[this.rowTarget] = org;
			let dotline = document.getElementById("dottedline");
			dotline.style.display = "block";
			dotline.style.left = "20px";
			dotline.style.top = `${event.clientY - rect.y + 20 + this.idsurplus}px`;
			dotline.style.borderTop = "2px dotted #999";
			dotline.style.borderLeft = "none";
		}

		if (this.headselection && !this.isHeadMoving) {
			this.startCell = { col: this.headtarget, row: 0 };
			let x = event.offsetX;
			let y = 0;
			this.endCell = this.getCellAtPosition(x, y);
			this.endCell.row = this.cols - 1 + this.startY;
			this.drawTable(this.startX, this.startY);
		}

		if (this.idselection && !this.isIdMoving) {
			this.startCell = { col: 0, row: this.idtarget };
			let x = 0;
			let y = event.offsetY;
			this.endCell = this.getCellAtPosition(x, y);
			this.endCell.col = this.rows - 1;
			this.drawTable(this.startX, this.startY);
		}
	}

	/**
	 * @type {EventListener} Pointer Up on document
	 * @param {PointerEvent} event Up
	 */

	handlePointerUp(event) {
		if (this.isSelected) {
			this.prevcell = this.endCell;
			this.prevstart = this.startCell;
			this.startCell = null;
			this.endCell = null;
		}

		if (this.widthresize && this.isHeadMoving) {
			const rect = this.excel.getBoundingClientRect();
			this.endpoint = event.clientX - rect.left;
			let diff = this.endpoint - this.startpoint;
			if (this.cellWidths[this.target] + diff <= 40) diff = 0;
			this.cellWidths[this.target] += diff;
			this.isHeadMoving = false;
			let dotline = document.getElementById("dottedline");
			dotline.style.display = "none";
			this.startCell = this.laststart;
			this.endCell = this.lastend;
			this.drawTable(this.startX, this.startY);
		}

		if (this.heightresize && this.isIdMoving) {
			const rect = this.excel.getBoundingClientRect();
			this.rowEndPoint = event.clientY - rect.top;
			let diff = this.rowEndPoint - this.rowStartPoint;
			if (this.rowHeights[this.rowTarget] + diff <= 20) diff = 0;
			this.rowHeights[this.rowTarget] += diff;
			this.isIdMoving = false;
			let dotline = document.getElementById("dottedline");
			dotline.style.display = "none";
			this.startCell = this.laststart;
			this.endCell = this.lastend;
			this.drawTable(this.startX, this.startY);
		}

		if (this.headselection && !this.isHeadMoving) {
			this.startCell = { col: this.headtarget, row: 0 };
			let x = event.offsetX;
			let y = 0;
			this.endCell = this.getCellAtPosition(x, y);
			this.endCell.row = this.cols - 1 + this.startY;
			this.drawTable(this.startX, this.startY);
			this.prevcell = this.startCell;
			this.startCell = null;
			this.endCell = null;
			this.headselection = false;
		}

		if (this.idselection && !this.isIdMoving) {
			this.startCell = { col: 0, row: this.idtarget };
			let x = 0;
			let y = event.offsetY;
			this.endCell = this.getCellAtPosition(x, y);
			this.endCell.col = this.rows - 1;
			this.laststart = this.startCell;
			this.lastend = this.endCell;
			this.drawTable(this.startX, this.startY);
			this.prevcell = this.startCell;
			this.startCell = null;
			this.endCell = null;
			this.idselection = false;
		}
	}


	/**
	 * @function switches find and replace tab
	 * @param {Html elements} tabName 
	 */
	openTab(tabName) {
		const tabContents = document.querySelectorAll('.tab-content');
		const tabButtons = document.querySelectorAll('.tab-button');

		tabContents.forEach(content => {
			content.classList.remove('active');
		});

		tabButtons.forEach(button => {
			button.classList.remove('active');
		});

		document.getElementById(tabName).classList.add('active');
		// document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
	}

	/**
	 * @function shows find and replace div
	 * @param {*} event 
	 */
	showfindrepdiv(event) {
		this.dialoguebox.style.display = "block";
		this.MakeDragable(this.dialoguebox);
	}

	/**
	 * @function hides find and replace div
	 * @param {*} event 
	 */
	hidefindrepdiv(event) {
		this.dialoguebox.style.display = "none";
	}


	/**
	 * @function copies text to clipboard using navigator
	 * @param {text} text 
	 */
	async copyToClipboard(text) {
		await navigator.clipboard.writeText(text).then(
			() => {
				console.log('Text copied to clipboard successfully!');
			},
			(err) => {
				console.error('Could not copy text: ', err);
			}
		);
	}

	/**
	 * @function selections text to copy and adds to a list 
	 * @param {start of range} startcell 
	 * @param {end of range} endcell 
	 * @param {pressed key} x 
	 */
	async CopyPaste(startcell, endcell, x) {
		if (x == "copy") {
			let lx = Math.min(this.lastend.row + this.startX, this.laststart.row + this.startX);
			let ly = Math.min(this.lastend.col, this.laststart.col);
			let hx = Math.max(this.lastend.row + this.startX, this.laststart.row + this.startX);
			let hy = Math.max(this.lastend.col, this.laststart.col);

			this.copyToClipboardString = "";
			for (let j = lx - 1; j <= hx - 1; ++j) {
				for (let i = ly + 1; i <= hy + 1; ++i) {
					this.copyToClipboardString += (this.data[j][i] || "") + ((i === hy + 1) ? "\n" : "	");
				}
			}
			this.copyToClipboardData = [];
			for (let j = lx - 1; j <= hx - 1; ++j) {
				var line = [];
				for (let i = ly + 1; i <= hy + 1; ++i) {
					line.push(this.data[j][i]);
				}
				this.copyToClipboardData.push(line);
			}

			this.copyToClipboard(this.copyToClipboardString);
			// console.log(this.copyToClipboardData);
		}
		else {
			// var deltaX;
			// if (this.startX == 1) deltaX = 0;
			// else deltaX = this.startX;
			var pasteonrow = Math.min(this.lastend.row + this.startX, this.laststart.row + this.startX);
			var pasteoncol = Math.min(this.lastend.col, this.laststart.col);
			const requestBody = {
				data: this.copyToClipboardData,
				row: pasteonrow,
				col: pasteoncol
			};

			try {
				const response = await axios.post('http://localhost:5099/api/PasteData', requestBody);
				console.log('Success, data pasted', response);
				await this.loadData(this.startX);
				this.drawTable(this.startX, this.startY);
			} catch (error) {
				console.error('Error', error);
			}

		}
	}


	/**
	 * @function calls progressbar api to load progress bar
	 */
	async handleProgressBar() {
		await axios.get(`http://localhost:5099/api/getUploadStatus`)
			.then((response) => {
				if (response.data == 100) {
					// location.reload();
				}
				else if (response.data >= 0 && response.data <= 100) {
					this.progressbar.style.display = 'block';
					this.progressbar.value = response.data + 20;
				}
				else {
					this.progressbar.style.display = 'none';
				}
				console.log(response.data);
				setTimeout(this.handleProgressBar, 100);

			})
			.catch(
				(error) => {
					console.error("Error:", error);
				}
			);

	}

	/**
	 * 
	 * @param {SubmitEvent} submits csv to backend
	 */
	async submitcsv(e) {
		e.preventDefault();
		window.onbeforeunload = await function () {
			return "OK";
		}
		this.handleProgressBar();
		const fileInput = document.getElementById("fileInput");
		const formData = new FormData();
		formData.append("file", fileInput.files[0]);
		try {
			await axios.post("http://localhost:5099/api/upload", formData
			)
				.then((response) => {
					console.log(response)
					alert("Data added succesfully, Reload to see");
					location.reload();
				})
				.catch((error) => {
					console.error("Error:", error);
					alert(error);
				});

		} catch (error) {
			console.error("Error ", error);
			alert("Error ", error);
		}
		finally {
			// location.reload();
		}
	}
	/**
	 * @function deletes selected cells from database
	 * @param {row first} r1 
	 * @param {colomn first} c1 
	 * @param {row second} r2 
	 * @param {colomn second} c2 
	 */

	async deleteCells(r1, c1, r2, c2) {
		try {
			const response = await axios.delete('http://localhost:5099/api/deletecells', {
				params: { r1, c1, r2, c2 }
			});
			console.log('sucess, data has been deleted', response);
		} catch (error) {
			console.error('Error', error);
		}
		finally {
			await this.loadData(this.startX);
			this.drawTable(this.startX, this.startY);
		}
	}


	/**
	 * @function opens necessary tab
	 * @param {EventListener} click 
	 */
	showfinds(event) {
		this.openTab('find');

	}
	showreplace(event) {
		this.openTab('replace');
	}

	findallbtn(event) {
		console.log("finding");
		//api req to find
	}

	/**
	 * @function replaces a word with another in database all occurances
	 * @param {EventListener} event 
	 */
	async replaceallbtn(event) {
		var tofind = this.findtorep.value;
		var torep = this.replacetext.value;
		this.dialoguebox.style.cursor = "progress";
		this.replacetext.style.cursor = "progress";
		this.replaceall.style.cursor = "progress";
		try {
			const response = await axios.post('http://localhost:5099/api/FindandReplace', {
				findText: tofind,
				replaceText: torep
			});
			console.log('Success, data has been replaced', response);
			await this.loadData(this.startX - 1);
			this.drawTable(this.startX, this.startY);
		} catch (error) {
			console.error('Error', error);
		}
		this.dialoguebox.style.cursor = "auto";
		this.replacetext.style.cursor = "auto";
		this.replaceall.style.cursor = "auto";
	}




	// findtorepbox(e) {
	//   // this.findtorep.style.zIndex = "1000";
	//   // this.findtorep.focus();
	//   console.log("find to rep")
	// }
	// replacetextbox(e) {
	//   // this.replacetext.focus();
	//   console.log("replace")
	// }
	// findtextbox(e) {
	//   // this.findtext.focus();
	//   console.log("find")
	// }

	/**
	 * @param {pressed keys} event 
	 */

	handleKeyDown(event) {
		if (event.shiftKey) {
			// event.preventDefault();
			if (!this.startCell) {
				this.startCell = { col: this.laststart.col, row: this.laststart.row };
				this.endCell = { col: this.lastend.col, row: this.lastend.row };
			}
			if (event.key == "ArrowUp") {
				this.endCell.row = Math.max(0, this.endCell.row - 1);
			} else if (event.key == "ArrowDown") {
				this.endCell.row += 1;
			} else if (event.key == "ArrowLeft") {
				this.endCell.col = Math.max(0, this.endCell.col - 1);
			} else if (event.key == "ArrowRight") {
				this.endCell.col += 1;
			}
			this.drawTable(this.startX, this.startY);
		} else if (event.ctrlKey) {
			event.preventDefault();
			if (event.key == "c" || event.key == "C") {
				this.startCell = this.laststart;
				this.endCell = this.lastend;
				this.marchingants = true;
				this.CopyPaste(this.startCell, this.endCell, "copy");
				this.drawTable(this.startX, this.startY);
				this.marchingants = false;
			} else if (event.key == "V" || event.key == "v") {
				this.startCell = this.laststart;
				this.endCell = this.lastend;
				this.ants.style.display = "none";
				this.CopyPaste(this.startCell, this.endCell, "paste");
				this.drawTable(this.startX, this.startY);
			} else if (event.key == "X" || event.key == "x") {
				// console.log("cut");
			}
		} else if (event.key === "Enter") {
			this.update.data = ipbox.value;
			this.updateCell(this.update);
			ipbox.style.display = "none";
		} else if (event.key === "Delete") {
			event.preventDefault();
			// this.prevcell = { col: this.prevcell.col + this.startY, row: this.prevcell.row + this.startX };
			// this.prevstart = { col: this.prevstart.col + this.startY, row: this.prevstart.row + this.startX};
			this.deleteCells(this.lastend.row + this.startX, this.lastend.col, this.laststart.row + this.startX, this.laststart.col);
		}
		else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
			event.preventDefault();
			this.startCell = { col: this.laststart.col, row: this.laststart.row };
			this.endCell = { col: this.laststart.col, row: this.laststart.row };
			if (event.key == "ArrowUp") {
				this.prevcell.row = Math.max(0, this.prevcell.row - 1);
			} else if (event.key == "ArrowDown") {
				this.prevcell.row += 1;
			} else if (event.key == "ArrowLeft") {
				this.prevcell.col = Math.max(0, this.prevcell.col - 1);
			} else if (event.key == "ArrowRight") {
				this.prevcell.col += 1;
			}
			this.startCell = this.prevcell;
			this.endCell = this.prevcell;
			this.drawTable(this.startX, this.startY);
			this.startCell = null;
			this.endCell = null;
		}
	}

	/**
	 * @type {EventListener}
	 * @param {KeyboardEvent} event Key Up
	 */

	handleKeyUp(event) {
		if (!event.shiftKey) {
			this.startCell = null;
			this.endCell = null;
		}
	}

	/**
	 * @function resizes colomns based on right lenght
	 * @param {EventListener} event 
	 */

	handleHeaderDoubleClick(event) {
		let h = event.clientX;
		let col = 0;
		let widthSum = 0;
		while (
			h > widthSum + this.cellWidths[col] &&
			col < this.cellWidths.length - 1
		) {
			widthSum += this.cellWidths[col];
			col++;
		}
		this.cellWidths[col] = Math.max(
			this.b.measureText(this.topics[col]).width + 40,
			this.b.measureText(this.data[col]).width + 40,
			100
		);
		this.drawTable(this.startX, this.startY);
	}


	/**
	 * 
	 * @param {data of element to be updated} x 
	 */
	async updateCell(x) {
		const requestBody = {
			data: [[cellData]],
			row: row + 1,
			col: col - 1
		};
		try {
			const response = await axios.post('http://localhost:5099/api/PasteData', requestBody);
			console.log('Success, data updated');
			await this.loadData(this.startX);
			this.drawTable(this.startX, this.startY);
		} catch (error) {
			console.error('Error', error);
		}
	}

	/**
	 * 
	 * @param {} event 
	 */

	handleTextbox(event) {
		const rect = this.excel.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		// console.log(Math.ceil(x / 100), Math.ceil(y / 20) + this.startX, this.startX);
		let dist = this.getLeftandTop(x, y);
		let datacell = this.getCellAtPosition(x, y);
		let ipbox = document.getElementById('ipbox');
		ipbox.style.display = 'block';
		ipbox.style.border = 'none';
		let top = ((Math.floor(y / 20) + this.startX) * 20);
		let left = (Math.floor(x / 100) * 100);
		ipbox.style.left = `${left + 25}px`;
		ipbox.style.top = `${top + 25}px`;
		ipbox.style.width = `${dist.width - 2}px`;
		ipbox.style.height = `${dist.height - 2}px`;
		var row = Math.ceil(y / 20) + this.startX;
		var col = Math.ceil(x / 100);
		if (this.startX == 0) {
			ipbox.value = this.data[row - 1][col];
			console.log(this.data[row - 1][col]);
			this.update = { data: ipbox.value, row: row - 1, col: col };
		}
		else {
			ipbox.value = this.data[row - 2][col];
			console.log(this.data[row - 2][col]);
			this.update = { data: ipbox.value, row: row - 2, col: col };
		}
		ipbox.focus();
	}

	SaveData(event) {
		// this.data[15][5] = "hello";
		this.drawTable(this.startX, this.startY);
	}

	/**
	 * @param {EventListener} Event Deleting Marching ants 
	 */

	handleExcelDoubleClick(event) {
		this.ants.style.display = "none";
		this.handleTextbox(event);
		event.preventDefault();
		this.drawTable(this.startX, this.startY);
	}

	handleDevicePixelRatio(event) {
		// console.log("hello");
		// this.scale = window.devicePixelRatio;
		// console.log(this.scale);

		// this.container = document.getElementById("container");
		// // this.container.scale(this.scale, this.scale);
		// this.a.scale(this.scale, this.scale);
		// this.b.scale(this.scale, this.scale);
		// this.c.scale(this.scale, this.scale);

		// this.drawTable(this.startX,this.startY);
	}

	/**
	 * @function handles view port - what data is visble after scroll
	 * @param {EventListener} Scroll 
	 */

	async handleViewPort(event) {
		let change = this.infinitediv.scrollTop;
		this.startX = Math.floor(change / 20);
		let hell = this.infinitediv.scrollLeft;
		this.startY = Math.floor(hell / 100);

		if (!this.laststart && !this.lastend) {
			this.laststart = { col: 0, row: 0 };
			this.lastend = { col: 0, row: 0 };
		}

		this.startCell = { col: this.laststart.col, row: this.laststart.row };
		this.endCell = { col: this.lastend.col, row: this.lastend.row };

		if (Math.abs(change - this.lastchange) >= 1000) {
			this.lastchange = change;
			await this.loadData(this.startX);
		}
		ipbox.style.display = 'none';
		this.drawTable(this.startX, this.startY);
		this.isSelected = false;
	}


	// getdataforchart(x, y) {
	//   let lx = Math.min(x.row, y.row);
	//   let ly = Math.min(x.col, y.col);
	//   let hx = Math.max(x.row, y.row);
	//   let hy = Math.max(x.col, y.col);

	//   let currdata = [];
	//   for (let i = lx; i <= hx; i++) {
	//     let line = [];
	//     for (let j = ly + 1; j <= hy + 1; j++) {
	//       line.push(this.data[i][j]);
	//     }
	//     currdata.push(line);
	//   }
	//   return { data: currdata, label: ["harsh", "nilesh"] };
	// }

	/**
	 * @function makes any div dragable
	 * @param {HTMLDivElement} graphdiv 
	 */

	MakeDragable(graphdiv) {
		let x, y;

		function DivMove(event) {
			let m = event.clientX;
			let n = event.clientY;

			// console.log(m, n);

			graphdiv.style.top = `${n - y}px`;
			graphdiv.style.left = `${m - x}px`;
		}

		function Divdown(event) {
			// this.chartselect = graphdiv;
			const rect = graphdiv.getBoundingClientRect();
			x = event.clientX - rect.left;
			y = event.clientY - rect.top;

			document.addEventListener("pointermove", DivMove);
			document.addEventListener("pointerup", DivUp);
		}

		function DivUp(event) {
			document.removeEventListener("pointermove", DivMove);
			document.removeEventListener("pointerup", DivUp);
		}

		graphdiv.addEventListener("pointerdown", Divdown);
	}

	/**
	 * @function Creates bar graph
	 * @param {EventListener} onClick 
	 */

	CreateBarGraph(event) {
		let graphcanvas = document.createElement("canvas");
		let graphdiv = document.createElement("div");

		if (this.infinitediv) this.infinitediv.append(graphdiv);
		graphdiv.append(graphcanvas);

		// let { data, label } = this.getdataforchart(this.laststart, this.lastend);
		graphdiv.style.position = 'absolute';
		graphdiv.style.display = 'block';
		graphdiv.style.width = '480px';
		graphdiv.style.height = '288px';
		// graphcanvas.style.width = '480px';
		// graphcanvas.style.height = '288px';
		graphdiv.style.top = '100px';
		graphdiv.style.left = '100px';
		graphdiv.style.background = 'white';
		graphdiv.style.zIndex = '100';

		new Chart(graphcanvas, {
			type: 'bar',
			data: {
				labels: ['Bob', 'Charlie', 'danielle', 'edward', 'fiona', 'george'],
				datasets: [{
					label: '# of Votes',
					data: [80.000, 90.000, 110.000, 120.000, 150.000, 20.000],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		this.MakeDragable(graphdiv);

	}

	/**
	 * @function Makes line graph
	 * @param {EventListener} click
	 */

	CreateLineGraph(event) {
		let linecanvas = document.createElement("canvas");
		let linediv = document.createElement("div");

		if (this.infinitediv) this.infinitediv.append(linediv);
		linediv.append(linecanvas);

		// setPorperties(graphdiv, graphcanvas);
		linediv.style.position = 'absolute';
		linediv.style.display = 'block';
		linediv.style.width = '480px';
		linediv.style.height = '288px';
		linediv.style.top = '100px';
		linediv.style.left = '600px';
		linediv.style.background = 'white';
		linediv.style.zIndex = '100';

		new Chart(linecanvas, {
			type: 'line',
			data: {
				labels: ['Bob', 'Charlie', 'danielle', 'edward', 'fiona', 'george'],
				datasets: [{
					label: '# of Votes',
					data: [80.000, 90.000, 110.000, 120.000, 150.000, 20.000],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		this.MakeDragable(linediv);

	}
}


/**
 * Load excel sheet on Document Load
 */
document.addEventListener("DOMContentLoaded", function () {
	new ExcelSheet();
});