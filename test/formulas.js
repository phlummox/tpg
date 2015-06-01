/** This script is (c) Wolfgang Schwarz 2002, wolfgang@umsu.de. **/

/**
 * CONSTRUCTORS FOR OBJECTS REPRESENTING FORMULAS:
 *
 * AtomicFormula()
 *   .predicate        - int, represents the predicate letter
 *   .terms            - int[], represents the terms
 * ComplexFormula()
 *   .operator         - tc.NEGATION, tc.CONJUNCTION, tc.DISJUNCTION, tc.IMPLICATION, or tc.BIIMPLICATION
 *   .subFormulas      - Formula[]
 * QuantifiedFormula()
 *   .quantifier       - tc.UNIVERSAL or tc.EXISTENTIAL
 *   .boundVariable    - int, represents the bound variable
 *   .subFormula       - Formula, the scope of the quantifier
 *
 * properties of all formula objects are:
 *   .type             - tc.ATOMIC, tc.COMPLEX, or tc.QUANTIFIED
 *   .negate()         - returns a negated copy of the formula
 *   .substitute(v,c)  - returns a copy of the formula with all free occurrences of term v replaceb by c
 *   .equals(Formula)  - checks whether two formulas are duplicates
 *
 **/

if (!self.tc) {
	tc = new Object(); // namespace for constants
	tc.counter = 0;
	tc.register = function(constName) {
		this[constName] = this.counter++;
	}
	tc.getName = function(num) {
		for (var n in this) {
			if (this[n] == num) return n;
		}
	}
}

tc.register("ATOMIC");
tc.register("COMPLEX");
tc.register("NEGATION");
tc.register("CONJUNCTION");
tc.register("DISJUNCTION");
tc.register("IMPLICATION");
tc.register("BIIMPLICATION");
tc.register("UNIVERSAL");
tc.register("EXISTENTIAL");

// abstract prototype of all formula objects:
protoFormula = {

	// negate():
	// returns a negated copy of this formula.
	negate : function() {
		var res = new ComplexFormula();
		res.operator = tc.NEGATION;
		res.subFormulas[0] = this;
		return res;
	},
	
	// substitute(origTerm, newTerm):
	// returns a copy of the formula with all free occurrences of origTerm
	// replaced by newTerm.
	substitute : function(origTerm, newTerm) {
		if (this.type == tc.ATOMIC) {
			// return a copy of this formula, with all occurrences of origTerm
			// replaced by newTerm:
			var newFormula = new AtomicFormula();
			newFormula.predicate = this.predicate;
			for (var i=0; i<this.terms.length; i++) {
				newFormula.terms[i] = (this.terms[i] == origTerm) ? newTerm : this.terms[i];
			}
			return newFormula;
		}
		else if (this.type == tc.COMPLEX) {
			// return a copy of this formula, with substitute called for the subformulas:
			var newFormula = new ComplexFormula();
			newFormula.operator = this.operator;
			for (var i=0; i<this.subFormulas.length; i++) {
				newFormula.subFormulas[i] = this.subFormulas[i].substitute(origTerm, newTerm);
			}
			return newFormula;
		}
		else if (this.type == tc.QUANTIFIED) {
			// return an exact copy of this formula if origTerm is bound, otherwise 
			// a copy with substitute called for the subformulas:
			var newFormula = new QuantifiedFormula();
			newFormula.quantifier = this.quantifier;
			newFormula.boundVariable = this.boundVariable;
			newFormula.subFormula = (this.boundVariable == origTerm) ?
				this.subFormula : this.subFormula.substitute(origTerm, newTerm);
			return newFormula;
		}
	},
	
	equals : function(formula) {
		if (this.type != formula.type) return false;
		if (this.type == tc.ATOMIC) {
			if (this.predicate != formula.predicate) return false;
			if (this.terms.length != formula.terms.length) return false;
			for (var i=0; i<this.terms.length; i++) {
				if (this.terms[i] != formula.terms[i]) return false;
			}
			return true;
		}
		else if (this.type == tc.QUANTIFIED) {
			if (this.quantifier != formula.quantifier) return false;
			if (this.boundVariable != formula.boundVariable) return false;
			return this.subFormula.equals(formula.subFormula);
		}
		else if (this.type == tc.COMPLEX) {
			if (this.operator != formula.operator) return false;
			if (!this.subFormulas[0].equals(formula.subFormulas[0])) return false;
			if (!this.subFormulas[1]) return true;
			return this.subFormulas[1].equals(formula.subFormulas[1]);
		}
	}

}

function AtomicFormula() {
	this.type = tc.ATOMIC;
	this.predicate = null;
	this.terms = new Array();
}
AtomicFormula.prototype = protoFormula;

function ComplexFormula() {
	this.type = tc.COMPLEX;
	this.operator = null;
	this.subFormulas = new Array();
}
ComplexFormula.prototype = protoFormula;

function QuantifiedFormula() {
	this.type = tc.QUANTIFIED;
	this.quantifier = null;
	this.boundVariable = null;
	this.subFormula = null;
}
QuantifiedFormula.prototype = protoFormula;
