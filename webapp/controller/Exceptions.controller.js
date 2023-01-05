sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/m/MessageStrip'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Fragment, MessageStrip) {
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
            onAfterRendering: function(){
                this.getView().getModel().setUseBatch(true)                                
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
            onEdit: function(){
                this.toggleEditMode(true)
            },           
            onCancel: function(){
                this.toggleEditMode(false)
                this.getView().getModel().resetChanges();
            },
            onAdd: function(){
                if (this._oDialog) {
                    this._oDialog.destroy();
                }
                let oContext = this.getView().getModel().createEntry("/ExceptionsSet", {
                    refreshAfterChange: true
                });
                this._onOpenDialog(oContext)
            },
            _onOpenDialog: function(context){
                Fragment.load({
                    name: "ypf.zparamfreegd0.view.fragments.DialogCreation",
                    controller: this,
                    id: this.getView().getId()
                }).then(function(oPopUp) {
                    this._oDialog = oPopUp;
                    let oFormCreacion = this.getView().byId("idFormCreacion")
                    oFormCreacion.setModel(this.getView().getModel())
                    oFormCreacion.setBindingContext(context);
                    this.getView().addDependent(oPopUp);
                    this._oDialog.open()
                    this.setInputValue("idDialogProgram", "CHECK_CONDITION")
                    this.setInputValue("idDialogObject", "USUARIO")
                }.bind(this))
            },
            setInputValue: function(inputId, value){
                let input = this.getView().byId(inputId)
                input.setValue(value)
                input.setEnabled(false)
            },
            onCreateException: function(oEvent){
                let that = this
                let oContext = that.getView().byId("idFormCreacion").getBindingContext()
                if(this.validateNumber(oContext)){
                    let ogetDeferredGroups = this.getView().getModel().getDeferredGroups()
                    MessageBox.confirm("Los cambios se asentarán en la base de datos. ¿Desea continuar?", {
                        actions: ["Confirmar", MessageBox.Action.CANCEL],
                        emphasizedAction: "Confirmar",
                        onClose: function (sAction) {
                            if (sAction === "Confirmar") {
                                that.getView().getModel().submitChanges({
                                    success: function () {
                                        that._oDialog.setBusy(false);
                                        sap.m.MessageToast.show("Se han guardado los cambios");
                                        that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                    },
                                    error: function () {
                                        that._oDialog.setBusy(false);
                                        sap.m.MessageToast.show("Se ha producido un error, intente nuevamente");
                                        that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                    }
                                });
                                that._oDialog.close();
                                that._oDialog.destroy();
                            } else {
                                that.getView().getModel().deleteCreatedEntry(oContext); // borrar entrada temporal
                                that.getView().getModel().resetChanges();
                                that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                that._oDialog.close();
                                that._oDialog.destroy();
                            }
                        }
                    });
                }
            },
            validateNumber: function(context){
                let contextNumber = context.getObject().Number,
                    oNumberInput = this.getView().byId("idDialogNumber").getValue(),
                    oMsgStrip = this.getView().byId("idDialogMsgStrip")
                if(oNumberInput == false){
                    oMsgStrip.setVisible(true)
                    oMsgStrip.setText(this.getView().getModel("i18n").getResourceBundle().getText("dialog.errors.noNumber"))
                    return false
                }
                let aEntriesNumber = this.getView().byId("idExceptionsTable").getItems().map(e => e.getBindingContext().getObject().Number)
                if(aEntriesNumber.includes(contextNumber)){        
                    oMsgStrip.setVisible(true)
                    oMsgStrip.setText(this.getView().getModel("i18n").getResourceBundle().getText("dialog.errors.repeatedNumber"))
                    return false
                }
                oMsgStrip.setVisible(false)
                return true
            },
            onSave: function(){
                let that = this;
				MessageBox.confirm("Los cambios se asentarán en la base de datos. ¿Desea continuar?", {
					actions: ["Confirmar", MessageBox.Action.CANCEL],
					emphasizedAction: "Confirmar",
					onClose: function (sAction) {
						if (sAction === "Confirmar") {
							that.getView().getModel().submitChanges({
								success: function (oResponse) {
									if(oResponse.__batchResponses){
										if(oResponse.__batchResponses[0].response){
											if(oResponse.__batchResponses[0].response.statusCode === '404'){
												that.getView().getModel().resetChanges();
											}
										} else{
                                            sap.m.MessageToast.show("Se han guardado los cambios");
                                        }
									}
                                    that.toggleEditMode(false);
								},
								error: function (oResponse) {
									sap.m.MessageToast.show("Se ha producido un error, intente nuevamente");
									that.getView().getModel().resetChanges();
									that.toggleEditMode(false);
								}
							});
						} else {
							that.getView().getModel().resetChanges(); // borrar entradas temporales
						}
					}
				});
            },
            onDelete: function () {
                let that = this
                let ogetDeferredGroups = this.getView().getModel().getDeferredGroups()
                let oTable = this.getView().byId("idExceptionsTable")
                let aSelContextPaths = oTable.getSelectedContextPaths();
    
                if (!aSelContextPaths.length) {
                    sap.m.MessageToast.show("Seleccione al menos un registro");
                    return;
                }
                MessageBox.confirm("Los cambios se asentarán en la base de datos. ¿Desea continuar?", {
                    actions: ["Confirmar", MessageBox.Action.CANCEL],
                    emphasizedAction: "Confirmar",
                    onClose: function (sAction) {
                        if (sAction === "Confirmar") {
                            that.getView().getModel().setDeferredGroups(["deleted"]);
                            that.getView().setBusy(true);
                            aSelContextPaths.forEach(function (sPath) {
                                    this.getView().getModel().remove(sPath, {
                                        groupId: "deleted",
                                        refreshAfterChange: true
                                    });
                                }.bind(that))
                            that.getView().getModel().submitChanges({
                                success: function (oResponse) {
                                    that.getView().setBusy(false);
                                    sap.m.MessageToast.show("Se han borrado los registros");
                                    oTable.removeSelections();
                                    oTable.setSelectedContextPaths([]);
                                    that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                },
                                error: function (oResponse) {
                                    that.getView().setBusy(false);
                                    sap.m.MessageToast.show("Se producido un error, intente nuevamente");
                                    oTable.removeSelections();
                                    oTable.setSelectedContextPaths([]);
                                    that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                                },
                                groupId: "deleted"
                            });
                        }else{
                            that.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                        }
                    }
                });
            },
            onDialogClose: function(){
                let oContext = this.getView().byId("idFormCreacion").getBindingContext()
                let ogetDeferredGroups = this.getView().getModel().getDeferredGroups()
                this.getView().getModel().deleteCreatedEntry(oContext); // borrar entrada temporal
                this.getView().getModel().resetChanges();
                this.getView().getModel().setDeferredGroups(ogetDeferredGroups);
                this._oDialog.close();
                this._oDialog.destroy();
            }
        });
    });
