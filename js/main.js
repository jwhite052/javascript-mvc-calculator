var calculator = (function() {
	"use strict";

	var DEBUG_ON = 1;

	function CalculatorModel() {
		consoleLog('Model: initialized'); // debug

		this.numberStack = [];
		this.operatorStack = [];
		this.calculateStack = [];
		this.resultStack = [];

		this.numberAdded = new Event(this); // sender model
		this.operatorAdded = new Event(this);
		this.resultCalculated = new Event(this);

		var _self = this;

		this.add = function(a, b) {
			var result = a + b;
			return result;
		}
	}

	CalculatorModel.prototype = {
		// number
		storeNumber: function(value) {
			consoleLog('Model: model.storeNumber(' + value + ') > numberStack.push(' + value + ')');
			consoleLog('Model: model.storeNumber(' + value + ') > numberAdded.notify()');
			this.numberStack.push(value);
			if (this.operatorStack[0] !== '' && this.operatorStack[0]) {
				consoleLog('Push calc stack');
				this.calculateStack.push(this.getOperator());
			}
			this.operatorStack = [];
			this.numberAdded.notify({ 'number' : value });
		},
		getNumber: function() {
			return this.numberStack.join('');
		},
		// operator
		storeOperator: function(value) {
			if (this.getOperator() === value) return;

			consoleLog('Model: model.storeOperator(' + value + ')');
			this.setOperator(0, value);
			consoleLog('Array length: ' + this.calculateStack.length);
			consoleLog('Array[0]: ' + this.calculateStack[0]);
			if (this.calculateStack.length < 1) {
				consoleLog('Added to calculafte stack[0]: ' + this.getNumber());
				this.calculateStack[0] = this.getNumber();
			} else {
				consoleLog('Pushed to calculate stack: ' + this.getNumber());
				this.calculateStack.push(this.getNumber());
			}
			this.numberStack = [];
			this.operatorAdded.notify({ 'operator' : value });

		},
		getOperator: function() {
			return this.operatorStack[0];
		},
		setOperator: function(index, value) {
			this.operatorStack[index] = value;
		},
		// result
		getResult: function() {
			return this.resultStack[this.resultStack.length - 1];
		},
		pushResult: function(value) {
			this.resultStack.push(value);
		},
		// calculate
		calculateResult: function() {

		},
		getCalculateResult: function() {
			return this.calculateStack[2];
		},
		addCalculateResult: function() {
			if (this.calculateStack.length < 3) return;

			consoleLog('calculateResult()');
			consoleLog(this.calculateStack[0]);
			consoleLog(this.calculateStack[1]);
			consoleLog(this.calculateStack[2]);
			var result = 0; // number

			switch (this.calculateStack[1]) {
				case '+':
					consoleLog('Calculate: ' + parseInt(this.calculateStack[0]));
					result = parseInt(this.calculateStack[0]) + parseInt(this.calculateStack[2]);
					consoleLog('Calculate result = ' + result);
					break;
			}
			this.calculateStack.push(result);
			this.resultCalculated.notify({ 'result' : this.getCalculatedResult() });
		}
	};

	/**
    * The View. View presents the model and provides
    * the UI events. The controller is attached to these
    * events to handle the user interaction.
    */
	function CalculatorView(model, elements) {
		consoleLog('View: initialized'); // debug

		this._model = model;
		this._$elements = elements;

		this.numberButtonClicked = new Event(this); // sender view
		this.operatorButtonClicked = new Event(this); // sender view

		var _self = this;

		// attach model listeners
		this._model.numberAdded.attach(function(sender, args) {
			console.log('Model Listener: model.numberAdded() > view.renderDisplay()')
			_self.renderDisplay(args);
		});
		this._model.operatorAdded.attach(function(sender, args) {
			_self.renderDisplay(args);
		});
		this._model.resultCalculated.attach(function(sender, args) {
			consoleLog("Result calc");
			_self.renderDisplay(args);
		});

		// attach listeners to HTML controls
		//this._elements.display.change(function() {
		//	_self.displayChanged.notify();
		//});
		this._$elements.number.click(function() {
			consoleLog('View: _$elements.number.click() > view.numberButtonClicked.notify(' + $(this).html() + ')');
			_self.numberButtonClicked.notify({ 'number' : $(this).html() });
		});
		this._$elements.operator.click(function() {
			consoleLog('View: _$elements.operator.click() > view.operatorButtonClicked.notify(' + $(this).html() + ')');
			_self.operatorButtonClicked.notify({ 'operator' : $(this).html() });
		});
	}
	CalculatorView.prototype = {
		renderDisplay: function(args) {
			if (args.hasOwnProperty('number')) {
				consoleLog('View: view.renderDisplay() > display rendered'); // debug
				this._$elements.display.html(this._model.getNumber());
			}
			if (args.hasOwnProperty('operator')) {
				consoleLog('View: view.renderDisplay() > display rendered'); // debug
				this._$elements.display.html(this._model.getOperator());
			}
			if (args.hasOwnProperty('result')) {
				consoleLog('View: view.renderDisplay() > display rendered'); // debug
				this._$elements.display.html(this._model.getResult());
			}
		}
	};

	/**
    * The Controller. Controller responds to user actions and
    * invokes changes on the model.
    */
	function CalculatorController(model, view) {
		consoleLog('Controller: initialized'); // debug

		this._model = model;
		this._view = view;

		var _self = this;

		this._view.numberButtonClicked.attach(function(sender, args) {
			console.log('View Listener: view.numberButtonClicked() > controller.storeNumber(' + args.number + ')');
			_self.numberPressed(args.number);
		});
		this._view.operatorButtonClicked.attach(function(sender, args) {
			console.log('View Listener: view.operatorButtonClicked() > controller.storeOperator(' + args.operator+ ')');
			_self.operatorPressed(args.operator);
		});
	}
	CalculatorController.prototype = {
		numberPressed: function(number) {
			consoleLog('Controller: model.storeNumber(' + number + ') > number added to model');
			this._model.storeNumber(number);
		},
		operatorPressed: function(operator) {
			if (this._model.getOperator() === operator) return;

			switch (operator) {
				case '=':
					consoleLog('equals button ' + this._model.getCalculatedResult());
					this._model.addCalculatedResult();
					break;
				default:
					consoleLog('Controller: model.operatorPressed > model.storeOperator');
					this._model.storeOperator(operator);
					break;
			}
		}
	};

	/**
	* Event. A simple class for implementing the Observer pattern.
	*/
	function Event(sender) {
		this._sender = sender;
		this._listeners = [];
	}

	Event.prototype = {
		attach : function (listener) {
			this._listeners.push(listener);
		},
		notify : function (args) {
			var index;

			for (index = 0; index < this._listeners.length; index += 1) {
				//consoleLog('Event.notify() sender:');
				//consoleLog(this._sender);
				//consoleLog('Event.notify() listener: ');
				//consoleLog(this._listeners[index]);
				//consoleLog(args);
				this._listeners[index](this._sender, args);
			}
		}
	};

	$(function () {
		console.clear();
		consoleLog("PROGRAM START"); // debug
		var model = new CalculatorModel();
		var view = new CalculatorView(model, {
			'display' : $('.js-calculator .display'),
			'number' : $('.js-calculator .btn.number'),
			'operator' : $('.js-calculator .btn.operator')
		});
		var controller = new CalculatorController(model, view);
		//view.show();
	});

	/**
	* consoleLog. Wrapper for console.log that is flag driven for debugging purposes.
	*/
	function consoleLog(output) {
		if (DEBUG_ON != 1) return;
		console.log(output);
	}
})();
