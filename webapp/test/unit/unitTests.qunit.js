/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ypf/z_param_free_gd0/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
