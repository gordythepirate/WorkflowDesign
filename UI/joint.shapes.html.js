joint.shapes.html = {};

// Function to limit labels to one line
var keynum, lines = 1;

function limitLines(obj, e) {
	if(window.event) {
		keynum = e.keyCode;
	}
	else if(e.which) {
		keynum = e.which;
	}

	if(keynum == 13) {
		if(lines == obj.rows) {
			return false;
	}
		else {
			lines++;
		}
	}
}










// Custom Square
joint.shapes.html.Square = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
	markup: '<g class="rotatable"><g class="scalable"><rect/></g><g class="inPorts"/><g class="outPorts"/></g>',
	portMarkup: '<g class="port<%= id %>"><circle/></g>',
	defaults: joint.util.deepSupplement({
		type: 'html.Square',
		size: { width: 40, height: 40 },
		inPorts: [],
		outPorts: [],
		attrs: {
			'.': { magnet: false },
			rect: {
				stroke: 'black', 'fill-opacity': 1, width: 1, height: 1,
			},
			circle: {
				r: 6, //circle radius
				magnet: true,
				stroke: 'black'
			},

			'.inPorts circle': { fill: 'green', type: 'input'},
			'.outPorts circle': { fill: 'green', type: 'output'}
		}
	}, joint.shapes.basic.Generic.prototype.defaults),
	getPortAttrs: function (portName, index, total, selector, type) {
		var attrs = {};
		var portClass = 'port' + index;
		var portSelector = selector + '>.' + portClass;
		var portCircleSelector = portSelector + '>circle';
		attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
		attrs[portSelector] = { ref: 'rect', 'ref-x': (index + 0.5) * (1 / total) };
		if (selector === '.inPorts') { attrs[portSelector]['ref-y'] = -6; }
		if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 6; }
		return attrs;
	}
}));

joint.shapes.html.SquareView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element-close">',
            '<button class="delete" style="float: left;">X</button>',
	    '</div>',
	    '<div class="html-element-square" align="center" style="text-align: center;">',
            '<span id="lbl"></span>', 
            '<textarea id="txt" wrap="off" type="text" placeholder="Label" maxlength="7" rows="1" onkeydown="return limitLines(this, event)"></textarea>',
            '</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });


        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('textarea').on('change', _.bind(function(evt) {
            this.model.set('textarea', $(evt.target).val());
        }, this));
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    },


     render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
        this.updateBox();
        return this;
    },

    renderPorts: function () {
        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
    }, 

    update: function () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    },

    updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        // paper.on('blank:pointerdown', function(evt, x, y) { this.$box.find('textarea').toBack(); });
        this.$box.find('span').text(this.model.get('textarea'));
        this.model.on('cell:pointerclick', function(evt, x, y) { this.$box.find('textarea').toFront(); });
        this.$box.css({ width: bbox.width - 10, height: bbox.height - 145, left: bbox.x + 5, top: bbox.y + 135, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }
});









// Custom Diamond
joint.shapes.html.Diamond = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
	markup: '<g class="rotatable"><g class="scalable"><path/></g><g class="inPorts"/><g class="outPorts"/></g>',
	portMarkup: '<g class="port<%= id %>"><circle/></g>',
	defaults: joint.util.deepSupplement({
		type: 'html.Diamond',
		size: { width: 40, height: 40 },
		inPorts: [],
		outPorts: [],
		attrs: {
			'.': { magnet: false },
			path: { d: 'M 10 0 L 20 10 10 20 0 10 z', stroke: 'black' },
			circle: {
				r: 6, //circle radius
				magnet: true,
				stroke: 'black'
			},

			'.inPorts circle': { fill: 'green', type: 'input'},
			'.outPorts circle': { fill: 'green', type: 'output'}
		}
	}, joint.shapes.basic.Generic.prototype.defaults),
	getPortAttrs: function (portName, index, total, selector, type) {
		var attrs = {};
		var portClass = 'port' + index;
		var portSelector = selector + '>.' + portClass;
		var portCircleSelector = portSelector + '>circle';
		attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
		attrs[portSelector] = { ref: 'rect', 'ref-x': (index + 0.5) * (1 / total) };
		if (selector === '.inPorts') { attrs[portSelector]['ref-y'] = -6; }
		if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 6; }
		return attrs;
	}
}));

joint.shapes.html.DiamondView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element-close">',
            '<button class="delete" style="float: left;">X</button>',
	    '</div>',
	    '<div class="html-element-diamond" align="center" style="text-align: center;">',
            '<span id="lbl"></span>', 
            '<textarea id="txt" wrap="off" type="text" placeholder="Label" maxlength="7" rows="1" onkeydown="return limitLines(this, event)"></textarea>',
            '</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });


        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('textarea').on('change', _.bind(function(evt) {
            this.model.set('textarea', $(evt.target).val());
        }, this));
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    },


     render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
        this.updateBox();
        return this;
    },

    renderPorts: function () {
        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
    }, 

    update: function () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    },

    updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        // paper.on('blank:pointerdown', function(evt, x, y) { this.$box.find('textarea').toBack(); });
        this.$box.find('span').text(this.model.get('textarea'));
        this.model.on('cell:pointerclick', function(evt, x, y) { this.$box.find('textarea').toFront(); });
        this.$box.css({ width: bbox.width - 10, height: bbox.height - 145, left: bbox.x + 5, top: bbox.y + 135, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }
});









// Custom Rectangle
joint.shapes.html.Rectangle = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
	markup: '<g class="rotatable"><g class="scalable"><rect/></g><g class="inPorts"/><g class="outPorts"/></g>',
	portMarkup: '<g class="port<%= id %>"><circle/></g>',
	defaults: joint.util.deepSupplement({
		type: 'html.Rectangle',
		size: { width: 80, height: 40 },
		inPorts: [],
		outPorts: [],
		attrs: {
			'.': { magnet: false },
			rect: {
				stroke: 'black', 'fill-opacity': 1, width: 1, height: 1,
			},
			circle: {
				r: 6, //circle radius
				magnet: true,
				stroke: 'black'
			},

			'.inPorts circle': { fill: 'green', type: 'input'},
			'.outPorts circle': { fill: 'green', type: 'output'}
		}
	}, joint.shapes.basic.Generic.prototype.defaults),
	getPortAttrs: function (portName, index, total, selector, type) {
		var attrs = {};
		var portClass = 'port' + index;
		var portSelector = selector + '>.' + portClass;
		var portCircleSelector = portSelector + '>circle';
		attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
		attrs[portSelector] = { ref: 'rect', 'ref-x': (index + 0.5) * (1 / total) };
		if (selector === '.inPorts') { attrs[portSelector]['ref-y'] = -6; }
		if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 6; }
		return attrs;
	}
}));

joint.shapes.html.RectangleView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element-close">',
            '<button class="delete" style="float: left;">X</button>',
	    '</div>',
	    '<div class="html-element-rectangle" align="center" style="text-align: center;">',
            '<span id="lbl"></span>', 
            '<textarea id="txt" wrap="off" type="text" placeholder="Label" maxlength="14" rows="1" onkeydown="return limitLines(this, event)"></textarea>',
            '</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });


        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('textarea').on('change', _.bind(function(evt) {
            this.model.set('textarea', $(evt.target).val());
        }, this));
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    },


     render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
        this.updateBox();
        return this;
    },

    renderPorts: function () {
        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
    }, 

    update: function () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    },

    updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        // paper.on('blank:pointerdown', function(evt, x, y) { this.$box.find('textarea').toBack(); });
        this.$box.find('span').text(this.model.get('textarea'));
        this.model.on('cell:pointerclick', function(evt, x, y) { this.$box.find('textarea').toFront(); });
        this.$box.css({ width: bbox.width - 10, height: bbox.height - 145, left: bbox.x + 5, top: bbox.y + 135, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }
});









// Custom Circle
joint.shapes.html.Circle = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
	markup: '<g class="rotatable"><g class="scalable"><circle class="circle"/></g><g class="inPorts"/><g class="outPorts"/></g>',
	portMarkup: '<g class="port<%= id %>"><circle class="ports"/></g>',
	defaults: joint.util.deepSupplement({
		type: 'html.Circle',
		size: { width: 40, height: 40 },
		inPorts: [],
		outPorts: [],
		attrs: {
			'.': { magnet: false },
			".circle": {
                		fill: 'white',
				stroke: 'black',
		                r: 20,
				transform: 'translate(20, 20)'
			},
			".ports": {
				r: 6, //circle radius
				magnet: true,
				stroke: 'black'
			},

			'.inPorts circle': { fill: 'green', type: 'input'},
			'.outPorts circle': { fill: 'green', type: 'output'}
		}
	}, joint.shapes.basic.Generic.prototype.defaults),
	getPortAttrs: function (portName, index, total, selector, type) {
		var attrs = {};
		var portClass = 'port' + index;
		var portSelector = selector + '>.' + portClass;
		var portCircleSelector = portSelector + '>circle';
		attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
		attrs[portSelector] = { ref: 'rect', 'ref-x': (index + 0.5) * (1 / total) };
		if (selector === '.inPorts') { attrs[portSelector]['ref-y'] = -6; }
		if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 6; }
		return attrs;
	}
}));

joint.shapes.html.CircleView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element-close">',
            '<button class="delete" style="float: left;">X</button>',
	    '</div>',
	    '<div class="html-element-circle" align="center" style="text-align: center;">',
            '<span id="lbl"></span>', 
            '<textarea id="txt" wrap="off" type="text" placeholder="Label" maxlength="7" rows="1" onkeydown="return limitLines(this, event)"></textarea>',
            '</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });


        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('textarea').on('change', _.bind(function(evt) {
            this.model.set('textarea', $(evt.target).val());
        }, this));
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    },


     render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
        this.updateBox();
        return this;
    },

    renderPorts: function () {
        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
    }, 

    update: function () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    },

    updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        // paper.on('blank:pointerdown', function(evt, x, y) { this.$box.find('textarea').toBack(); });
        this.$box.find('span').text(this.model.get('textarea'));
        this.model.on('cell:pointerclick', function(evt, x, y) { this.$box.find('textarea').toFront(); });
        this.$box.css({ width: bbox.width - 10, height: bbox.height - 145, left: bbox.x + 5, top: bbox.y + 135, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }
});