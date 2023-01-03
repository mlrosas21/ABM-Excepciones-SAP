/*global QUnit*/

sap.ui.define([
	"ypf/z_param_free_gd0/controller/Exceptions.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Exceptions Controller");

	QUnit.test("I should test the Exceptions controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
