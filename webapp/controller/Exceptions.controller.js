sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("ypf.zparamfreegd0.controller.Exceptions", {
            onInit: function () {
                const oViewModel = new JSONModel({
					tableNoDataText : "No DATA",
					busy: true,
					delay: 0,
					totalItems: 0,
					editMode: false
				})
                this.getView().setModel(oViewModel, "viewModel");

            },
            onEdit: function(){
                console.log("EDIT")
                this.toggleEditMode(true)
            },
            onCancel: function(){
                console.log("CANCEL")
                this.toggleEditMode(false)
            },
            toggleEditMode: function(bool){
                switch(bool){
                    case true:
                        this.byId("idExceptionsTable").setMode(sap.m.ListMode.MultiSelect)
                        this.getView().getModel("viewModel").setProperty("/editMode", true) 
                        break;
                    case false:
                        this.byId("idExceptionsTable").setMode(sap.m.ListMode.None)
                        this.getView().getModel("viewModel").setProperty("/editMode", false)
                        break;
                }
            }
        });
    });
