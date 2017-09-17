var calculator = (function() {
	"use strict";

	var DEBUG_ON = true; // Boolean, toggles consoleLog output for debugging

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
		popNumber: function() {
			return this.numberStack.pop();
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
		isCalculateEmpty: function() {
			if (this.calculateStack.length > 0) {
				return false;
			}
			return true;
		},
		calculateResult: function() {
			var index, indexAdd, indexSubtract, indexDivide, indexMultiply;
			var result, arg1, arg2, operator;

			while (this.calculateStack.length > 2) {
				consoleLog(this.calculateStack);

				result = 0;

				indexAdd = this.calculateStack.indexOf('+');
				indexSubtract = this.calculateStack.indexOf('-');
				indexMultiply = this.calculateStack.indexOf('*');
				indexDivide = this.calculateStack.indexOf('/');

				// PEMDAS, order of operations
				if (indexMultiply != -1 || indexDivide != -1) {
					if (indexMultiply != -1 && indexDivide != -1) {
						if (indexMultiply < indexDivide) {
							index = indexMultiply;
						} else {
							index = indexDivide;
						}
					} else if (indexMultiply != -1) {
						index = indexMultiply;
					} else if (indexDivide != -1) {
						index = indexDivide;
					}
				} else {
					if (indexAdd != -1 && indexSubtract != -1) {
						if (indexAdd < indexSubtract) {
							index = indexAdd;
						} else {
							index = indexSubtract;
						}
					} else if (indexAdd != -1) {
						index = indexAdd;
					} else if (indexSubtract != -1) {
						index = indexSubtract;
					}
				}

				index -= 1; // Sets starting index to pull in values, one before the operator's index
				consoleLog('index = ' + index);
				arg1 = this.calculateStack.splice(index, 1);
				consoleLog('arg1 = ' + arg1);
				operator = this.calculateStack.splice(index, 1);
				consoleLog('operator = ' + operator);
				arg2 = this.calculateStack.splice(index, 1);
				consoleLog('arg2 = ' + arg2);

				// Check if all values are defined
				if (arg1 !== undefined && arg2 !== undefined && operator !== undefined) {
					if (operator == '+') {
				 		result = this.addOperation(arg1, arg2);
					} else if (operator == '-') {
				 		result = this.subtractOperation(arg1, arg2);
					} else if (operator == '*') {
				 		result = this.multiplyOperation(arg1, arg2);
					} else if (operator == '/') {
				 		result = this.divideOperation(arg1, arg2);
					}
				}
				consoleLog('Operator: ' + operator);
				consoleLog('Result: ' + result);
				this.calculateStack.splice(index, 0, result);
				consoleLog('Stack: ' + this.calculateStack);
			}
			// this.calculateStack[0] = result.toString();
			this.pushResult(result);

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
		popResult: function(bool /* true or false */ ) {
			if (bool === true)
				return this.resultStack.pop();
			if (this.resultStack.length > 0)
				return this.resultStack[this.resultStack.length - 1];
		},
		getResultStackLength: function() {
			return this.resultStack.length;
		},
		isResultEmpty: function() {
			if (this.getResultStackLength() > 0) {
				return false;
			}
			return true;
		},
		clearResult: function() {
			this.resultStack = [];
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
		this._calculatorElement = elements.calculator;
		this._numberButtonElements = elements.number;
		this._operatorButtonElements = elements.operator;
		this._mainDisplayElement = elements.mainDisplay;
		this._historyDisplayElement = elements.historyDisplay;

		this.numberButtonClicked = new Event(this);
		this.operatorButtonClicked = new Event(this);

		var _self = this;

		// attach listeners to HTML controls
		this._numberButtonElements.click(function() {
			_self.numberButtonClicked.notify({ 'number' : $(this).attr('data-value') });
		});

		this._operatorButtonElements.click(function() {
			_self.operatorButtonClicked.notify({ 'operator' : $(this).attr('data-value') });
		});
	}
	CalculatorView.prototype = {
		renderMainDisplay: function(output) {
			var _output = output.toString();
			this._mainDisplayElement.html(_output); // Addresses floating point issues
			if (
				_output === '07734' ||
				_output === '0.7734' ||
				_output === '5318008' ||
				_output === '14' ||
				_output === '379009' ||
				_output === '319009' ||
				_output === '37818' ||
				_output === '663' ||
				_output === '5663'
			) {
				if (!this._calculatorElement.hasClass('rotate'))
					this.rotateCalculator();
			} else if (_output === '8675309') {
				var win = window.open('https://www.youtube.com/watch?v=6WTdTwcmxyo', '_blank');
				if (win)
					win.focus();
			}
		},
		renderHistoryDisplay: function(output) {
			this._historyDisplayElement.html(output);
		},
		clearDisplay: function() {
			this.renderMainDisplay('0');
			this.renderHistoryDisplay('0');
		},
		rotateCalculator: function() {
			this._calculatorElement.toggleClass('rotate');
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
			if (number === '.') {
				if (this._model.getNumber().indexOf('.') == -1) {
					this._model.pushNumber(number);
				}
			} else {
				this._model.pushNumber(number);
			}
		},
		operatorPressed: function(operator) {
			var _self = this;

			if (operator === '=') {
				if (!_self._model.isCalculateEmpty()) {
					addNumberToCalcStack();
					_self._model.calculateResult();
					_self._model.clearCalculate();
					_self._model.clearNumber();
				}
			} else if (operator === 'C') {
				clearCalculator();
			} else if (operator === 'R') {
				_self._view.rotateCalculator();
			} else if (operator == 'delete') {
				if (_self._model.getResultStackLength() < 1) {
					if (_self._model.getNumber().length > 0) {
						_self._model.popNumber();
						if (_self._model.getNumber().length === 0) {
							_self._view.renderMainDisplay('0');
						} else {
							_self._view.renderMainDisplay(_self._model.getNumber());
						}
					}
				}
			} else {
				addNumberToCalcStack();
				addResultToCalcStack();
				addOperatorToCalcStack();
			}

			// If not empty, add the number to calculate stack and then clear the number stack
			function addNumberToCalcStack() {
				if (_self._model.getNumber().length > 0 ) {
					_self._model.pushCalculate(_self._model.getNumber());
					_self._model.clearNumber();
				}
			}

			// If there is a result stored, add the result to calculate stack
			function addResultToCalcStack() {
				if (!_self._model.isResultEmpty()) {
					_self._model.clearCalculate();
					_self._model.pushCalculate(_self._model.popResult(true));
				}
			}

			// If operator has not yet been added, add the operator to the calculate stack
			function addOperatorToCalcStack() {
				if (!isNaN(_self._model.popCalculate())) {
					_self._model.pushCalculate(operator);
				} else {
					// If the calculate stack is not empty, then push the operator on to the stack
					if (!_self._model.isCalculateEmpty()) {
						_self._model.popCalculate(true);
						_self._model.pushCalculate(operator);
					}
				}
			}

			// Clear out all memory stacks
			function clearCalculator() {
				_self._model.clearNumber();
				_self._model.clearCalculate();
				_self._model.clearResult();
				_self._view.clearDisplay();
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
				this._listeners[index](this._sender, args);
			}
		}
	};

	$(function () {
		console.clear();
		consoleLog("PROGRAM START"); // debug
		var model = new CalculatorModel();
		var view = new CalculatorView(model, {
			'calculator' : $('.js-calculator'),
			'mainDisplay' : $('.js-calculator .display .main'),
			'historyDisplay' : $('.js-calculator .display .history'),
			'number' : $('.js-calculator .btn.number'),
			'operator' : $('.js-calculator .btn.operator')
		});
		var controller = new CalculatorController(model, view);
	});

	/**
	* consoleLog. Wrapper for console.log that is flag driven for debugging purposes.
	*/
	function consoleLog(output) {
		if (DEBUG_ON !== true) return;
		console.log(output);
	}
})();
