dojo.provide("dojox.rpc.tests.Service");
dojo.require("dojo.io.script");
dojo.require("dojox.rpc.Service");
dojo.require("dojox.rpc.JsonRPC");

//this is a copy of our smd in js form, so we can just share it easily
//dojo.require("dojox.rpc.tests.resources.testSmd");


dojox.rpc.tests.service = new dojox.rpc.Service(dojo.moduleUrl("dojox.rpc.tests.resources", "test.smd"));

doh.register("dojox.rpc.tests.echo", 
	[ 
		{
			name: "#1 POST,URL,Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postEcho({message: this.name});
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#2 POST,URL,Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;

			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postEcho(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#3 GET,URL,Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.getEcho({message: this.name});
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},

		{
			name: "#4 GET,URL,Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.getEcho(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},

		{
			name: "#5 POST,URL,Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonEcho({message: this.name});
				td.addCallback(this, function(res){
					var result = dojo.fromJson(res);
					if (result && result.message && result.message==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},

		{
			name: "#6 POST,JSON,Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonEcho(this.name);
				td.addCallback(this, function(res){
					var result = dojo.fromJson(res);
					if (result && result.message && result.message==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#7 JSONP,URL,Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.jsonpEcho({message: this.name});
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#8 JSONP,URL, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.jsonpEcho(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#9 POST,JSON-RPC-1.0,Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc10Echo(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#10 POST,JSON-RPC-1.0,Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc10EchoNamed(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#11 POST,JSON-RPC 1.1, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc12Echo(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#12 POST,JSON-RPC 1.1, Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc12Echo({message: this.name});
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#13 GET,JSON-RPC 1.2, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.getJsonRpc12Echo(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		{
			name: "#13 GET,JSON-RPC 1.2, Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.getJsonRpc12EchoNamed({message: this.name});
				td.addCallback(this, function(result){
					console.log("RESULT2: ", result);
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},
		,{
			name: "#14 JSONP,JSON-RPC 1.2, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.jsonpJsonRpc12Echo(this.name);
				td.addCallback(this, function(result){
					if (result==this.name){
						d.callback(true);
					}else{
						d.errback(new Error("Unexpected Return Value: ", result));
					}
				});

				return d;
			}
		},

	]
);

doh.register("dojox.rpc.tests.jsonRpcForcedError", [
		{
			name: "POST,JSON-RPC 1.0, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc10ForcedError(this.name);

				td.addErrback(this, function(error){
					d.callback(true);
				});

				return d;
			}
		},
		{
			name: "POST,JSON-RPC 1.2, Ordered Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc12ForcedError(this.name);

				td.addErrback(this, function(error){
					d.callback(true);
				});

				return d;
			}
		},
		{
			name: "POST,JSON-RPC 1.2, Named Parameters",
			timeout: 4000,
			setUp: function(){
				//this.svc = new dojox.rpc.Service(dojox.rpc.tests.resources.testSmd);
				this.svc = dojox.rpc.tests.service;
			},
			runTest: function(){
				var d = new doh.Deferred();

				if (window.location.protocol=="file:") {
					var err= new Error("This Test requires a webserver and will fail intentionally if loaded from file://");
					d.errback(err);
					return d;
				}

				//test when given named params
				var td = this.svc.postJsonRpc12ForcedError({message: this.name});

				td.addErrback(this, function(error){
					d.callback(true);
				});

				return d;
			}
		}
]);