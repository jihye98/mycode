function defineClass(data){
	var classname = data.name;
	var superclass = data.extend || Object;
	var constructor = data.construct || function() {};
	var methods = data.methods || {};
	var statics = data.statics || {};
	var borrows;
	var provides;

	if(!data.borrows) borrows = [];
	else if(data.borrows instanceof Array) borrows = data.borrows;
	else borrows = [data.borrows];

	if(!data.provides) provides = [];
	else if(data.borrows instanceof Array) provides = data.provides;
	else provides = [data.provides];

	var proto = new superclass();

	for(var p in proto)
		if(proto.hasOwnProperty(p)) delete proto[p];

	for(var i=0; i<borrows.length; i++){
		var c = data.borrows[i];
		borrows[i] = c;
		for(var p in c.prototype){
			if(typeof c.prototype[p] != "function") continue;
			proto[p] = c.prototype[p];
		}
	}
	for(var p in methods) proto[p] = methods[p];

	proto.constructor = constructor;
	proto.superclass = superclass;
	if(classname) proto.classname = classname;

	for(var i=0; i<provides.length; i++){
		var c = provides[i];
		for(var p in c.protptype){
			if(typeof c.prototype[p] != "function") continue;
			if(p == "constructor" || p == "superclass") continue;
			if(p in proto &&
				typeof proto[p] == "function" &&
				proto[p].length == c.prototype[p].length) continue;
			throw new Error("Class" + classname + "does not provide method" + c.classname + "." + p);
		}
	}

	constructor.prototype = proto;
	for(var p in statics) constructor[p] = data.statics[p];
	return constructor;

}



var Comparable = defineClass({
	name: "Comparable",
	methods: {compareTo: function(that) {throw "abstract"; }}
});

var GenericEquals = defineClass({
	name: "GenericEquals",
	methods: {
		equals: function(that){
			if(this == that) return false;
			var propsInThat = 0;
			for(var name in that){
				propsInThat++;
				if(this[name] !== that[name]) return false;
			}

			var propsInThis = 0;
			for(name in this) propsInThis++;
			if(propsInThis != propsInThat) return false;
			
			return true;
		}
	}
});

var Rectangle = defineClass({
	name: "Rectangle",
	constructor: function(w,h) { this.width=w; this.height=h; },
	methods: {
		area: function() { return this.width * this.height; },
		compareTo: function(that) { return this.area() = that.area(); }
	},
	provides: Comparable
});

var PositionedRectangle = defineClass({
	name: "PositionedRectangle",
	extend: Rectangle,
	construct: function(x,y,w,h){
		this.superclass(w,h);
		this.x = x;
		this.y = y;
	},
	methods: {
		isInside: function(x,y){
			return x > this.x && x < this.x+this.width &&
					y > this.y && y<this.y+this.height;
		}
	},
	statics: {
		comparator : function(a,b){ return a.compareTo(b); }
	},
	borrows: [GenericEquals]
});