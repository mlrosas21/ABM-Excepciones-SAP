sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Fragment) {
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
                this.getView().getModel().resetChanges();
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
            },
            onAdd: function(){
                let oDeferredGroups = this.getView().getModel().getDeferredGroups();
                if (this._oDialogCreacion) {
                    this._oDialogCreacion.destroy();
                }
                this._onOpenDialog()
            },
            _onOpenDialog: function(){
                Fragment.load({
                    name: "ypf.zparamfreegd0.view.fragments.DialogCreation",
                    controller: this,
                    id: this.getView().getId()
                }).then(function(oPopUp) {
                    this._oDialog = oPopUp;
                    this.getView().addDependent(oPopUp);
                    this._oDialog.open()
                }.bind(this))
            },
            onCrearExcepcion: function(){
                MessageBox.confirm("Los cambios se asentarán en la base de datos. ¿Desea continuar?", {
                    actions: ["Confirmar", MessageBox.Action.CANCEL],
                    emphasizedAction: "Confirmar",
                    onClose: function (sAction) {
                        if (sAction === "Confirmar") {
                            that.getView().getModel().submitChanges({
                                success: function () {
                                    that._oDialogCreacion.setBusy(false);
                                    sap.m.MessageToast.show("Se han guardado los cambios");
                                    that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                },
                                error: function () {
                                    that._oDialogCreacion.setBusy(false);
                                    sap.m.MessageToast.show("Se producido un error, intente nuevamente");
                                    that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                }
                            });
                            that._oDialogCreacion.close();
                            that._oDialogCreacion.destroy();
                        } else {
                            that.getView().getModel().deleteCreatedEntry(oContext); // borrar entrada temporal
                            that.getView().getModel().resetChanges();
                            that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                            that._oDialogCreacion.close();
                            that._oDialogCreacion.destroy();
                        }
                    }
                });
            },
            onDialogClose: function(){
                this._oDialog.close();
                this._oDialog.destroy();
            }
        });
    });
