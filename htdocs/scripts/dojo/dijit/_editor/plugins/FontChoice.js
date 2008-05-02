dojo.provide("dijit._editor.plugins.FontChoice");
dojo.experimental("dijit._editor.plugins.FontChoice");

dojo.require("dijit._editor._Plugin");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.i18n");

dojo.requireLocalization("dijit._editor", "FontChoice");

dojo.declare("dijit._editor.plugins.FontChoice",
	dijit._editor._Plugin,
	{
		_uniqueId: 0,

		buttonClass: dijit.form.FilteringSelect,

		_initButton: function(){
			//TODO: do we need nls for font names?  provide css font lists? or otherwise make this more configurable?
			var names = {
				fontName: ["serif", "sans-serif", "monospaced", "cursive", "fantasy"],
				fontSize: [1,2,3,4,5,6,7],
				formatBlock: ["p", "h1", "h2", "h3", "pre"] }[this.command];
			var strings = dojo.i18n.getLocalization("dijit._editor", "FontChoice");
			var items = dojo.map(names, function(x){ return { name: strings[x], value: x }; });
			items.push({name:"", value:""}); // FilteringSelect doesn't like unmatched blank strings

			dijit._editor.plugins.FontChoice.superclass._initButton.apply(this, [{ store: new dojo.data.ItemFileReadStore(
				{ data: { identifier: "value", items: items } })}]);

			this.button.setValue("");

			this.connect(this.button, "onChange", function(choice){
				this.editor.execCommand(this.command, choice);
				dijit.focus(this._focusHandle);
			});
		},

		updateState: function(){
			this.inherited(arguments);
			var _e = this.editor;
			var _c = this.command;
			if(!_e || !_e.isLoaded || !_c.length){ return; }
			if(this.button){
				var value = _e.queryCommandValue(_c);
				this.button.setValue(value);
			}

			this._focusHandle = dijit.getFocus(this.editor.iframe);
console.log("focushandle: "+this._focusHandle);
		},

		setToolbar: function(){
			this.inherited(arguments);

			var forRef = this.button;
			if(!forRef.id){ forRef.id = "dijitEditorButton-"+this.command+(this._uniqueId++); } //TODO: is this necessary?  FilteringSelects always seem to have an id?
			var label = dojo.doc.createElement("label");
			label.setAttribute("for", forRef.id);
			var strings = dojo.i18n.getLocalization("dijit._editor", "FontChoice");
			label.appendChild(dojo.doc.createTextNode(strings[this.command]));
			dojo.place(label, this.button.domNode, "before");
		}
	}
);