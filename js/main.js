var calculator = (function() {
	"use strict";

	var DEBUG_ON = 1;

	function CalculatorModel() {
		consoleLog('MODEL: initialized'); // Debug

		this.numberStack = [];
		this.calculateStack = [];
		this.resultStack = [];

		this.numberValuePushed = new Event(this);
		this.operatorValuePushed = new Event(this);
		this.calculateValuePushed = new Event(this);
		this.resultCalculated = new Event(this);

		var _self = this;

		this.addOperation = function(a, b) {
			return parseFloat(a) + parseFloat(b);
		}
		this.subtractOperation = function(a, b) {
			return parseFloat(a) - parseFloat(b);
		}
		this.multiplyOperation = function(a, b) {
			return parseFloat(a) * parseFloat(b);
		}
		this.divideOperation = function(a, b) {
			return parseFloat(a) / parseFloat(b);
		}
	}
	CalculatorModel.prototype = {
		// Number
		pushNumber: function(number) {
			this.numberStack.push(number);
			this.numberValuePushed.notify({ 'number' : this.getNumber() });
		},
		getNumber: function() {
			return this.numberStack.join('');
		},
		clearNumber: function() {
			this.numberStack = [];
		},
		// Calculate
		pushCalculate: function(value) {
			this.calculateStack.push(value);
			this.calculateValuePushed.notify({ 'calculate' : this.getCalculateString() });
			this.operatorValuePushed.notify({ 'operator' : this.popCalculate() });
		},
		popCalculate: function(bool /* true or false */ ) {
			if (bool === true)
				return this.calculateStack.pop();
			if (this.calculateStack.length > 0)
				return this.calculateStack[this.calculateStack.length - 1];
		},
		clearCalculate: function() {
			this.calculateStack = [];
		},
		getCalculateString: function() {
			return this.calculateStack.join('');
		},
		calculateResult: function() {
			consoleLog(this.calculateStack);
			var result = 0;
			var arg1 = this.calculateStack.splice(0,1);
			var operator = this.calculateStack.splice(0,1);
			var arg2 = this.calculateStack.splice(0,1);
			// for (var i = 0; i < this.calculateStack.length; i++) {
			//
			// }
			if (operator == '+') {
		 		result = this.addOperation(arg1, arg2);
			} else if (operator == '-') {
		 		result = this.subtractOperation(arg1, arg2);
			} else if (operator == '*') {
		 		result = this.multiplyOperation(arg1, arg2);
			} else if (operator == '/') {
		 		result = this.divideOperation(arg1, arg2);
			}
			this.calculateStack[0] = result.toString();
			this.pushResult(this.calculateStack[0]);
			this.resultCalculated.notify({ 'result' : this.getResult() });
		},
		pushResult: function(result) {
			this.resultStack.push(result);
		},
		getResult: function() {
			if (this.getResultStackLength() > 0) {
				return this.resultStack[this.getResultStackLength() - 1];
			}
			return null;
		},
		getResultStackLength: function() {
			return this.resultStack.length;
		},
		isResultEmpty: function() {
			if (this.getResultStackLength() > 0) {
				return false;
			}
			return true;
		}
	};

	/**
    * The View. View presents the model and provides
    * the UI events. The controller is attached to these
    * events to handle the user interaction.
    */
	function CalculatorView(model, elements) {
		consoleLog('VIEW: initialized'); // Debug

		this._model = model;
		this._elements = elements;
		this._numberButtonElements = elements.number;
		this._operatorButtonElements = elements.operator;
		this._mainDisplayElement = elements.display;
		this._historyDisplayElement = elements.history;

		this.numberButtonClicked = new Event(this);
		this.operatorButtonClicked = new Event(this);

		var _self = this;

		// attach listeners to HTML controls
		this._numberButtonElements.click(function() {
			_self.numberButtonClicked.notify({ 'number' : $(this).html() });
		});

		this._operatorButtonElements.click(function() {
			_self.operatorButtonClicked.notify({ 'operator' : $(this).attr('data-value') });
		});
	}
	CalculatorView.prototype = {
		renderMainDisplay: function(output) {
			this._mainDisplayElement.html(output);
		},
		renderHistoryDisplay: function(output) {
			this._historyDisplayElement.html(output);
		},
		clearDisplay: function() {
			this.renderMainDisplay('0');
			this.renderHistoryDisplay('0');
		}
	};

	/**
    * The Controller. Controller responds to user actions and
    * invokes changes on the model.
    */
	function CalculatorController(model, view) {
		consoleLog('CONTROLLER: initialized'); // debug

		this._model = model;
		this._view = view;

		var _self = this;

		// attach model listeners
		this._model.numberValuePushed.attach(function(sender, args) {
			_self._view.renderMainDisplay(args.number);
		});

		this._model.operatorValuePushed.attach(function(sender, args) {
			//_self._view.renderMainDisplay(args.operator);
		});

		this._model.resultCalculated.attach(function(sender, args) {
			_self._view.renderMainDisplay(args.result);
		});

		this._model.calculateValuePushed.attach(function(sender, args) {
			_self._view.renderHistoryDisplay(args.calculate);
		});

		// attach view listeners
		this._view.numberButtonClicked.attach(function(sender, args) {
			_self.numberPressed(args.number);
		});

		this._view.operatorButtonClicked.attach(function(sender, args) {
			_self.operatorPressed(args.operator);
		});
	}
	CalculatorController.prototype = {
		numberPressed: function(number) {
			this._model.pushNumber(number);
		},
		operatorPressed: function(operator) {
			// If not empty, add the number to calculate stack and then clear the number stack
			if (this._model.getNumber().length > 0 ) {
				this._model.pushCalculate(this._model.getNumber());
				this._model.clearNumber();
			}
			// If there is a result stored, add to calculate stack
			// if (!this._model.isResultEmpty()) {
			// 	this._model.pushCalculate(this._model.getResult());
			// 	this._model.clearCalculate();
			// }
			// If operator has not yet been added, add the operator to the calculate stack
			if (!isNaN(this._model.popCalculate())) {
				this._model.pushCalculate(operator);
			} else {
				this._model.popCalculate(true);
				this._model.pushCalculate(operator);
			}
			if (operator === '=') {
				this._model.calculateResult();
				this._model.clearCalculate();
				this._model.clearNumber();
			} else if (operator === 'C') {
				this.clearCalculator();
			}
		},
		clearCalculator: function() {
			this._model.clearNumber();
			this._model.clearCalculate();
			this._view.clearDisplay();
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
			'history' : $('.js-calculator .history'),
			'number' : $('.js-calculator .btn.number'),
			'operator' : $('.js-calculator .btn.operator')
		});
		var controller = new CalculatorController(model, view);
	});

	/**
	* consoleLog. Wrapper for console.log that is flag driven for debugging purposes.
	*/
	function consoleLog(output) {
		if (DEBUG_ON != 1) return;
		console.log(output);
	}
})();
