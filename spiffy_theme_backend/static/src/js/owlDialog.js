odoo.define('spiffy_theme_backend.owlDialogJS', function (require) {
    'use strict';

    const WebDialog = require("web.Dialog");
    var core = require('web.core');
    const OwlDialog = require('web.OwlDialog');
    var QWeb = core.qweb;
    var _t = core._t;

    WebDialog.include({
        open: function (options) {
            $('.tooltip').remove(); // remove open tooltip if any to prevent them staying when modal is opened
    
            var self = this;
            this.appendTo($('<div/>')).then(function () {
                if (self.isDestroyed()) {
                    return;
                }
                self.$modal.find(".modal-body").replaceWith(self.$el);
                self.$modal.attr('open', true);
                if (self.$parentNode) {
                    self.$modal.appendTo(self.$parentNode);
                }
                self.$modal.modal({
                    show: true,
                    backdrop: self.backdrop,
                    keyboard: false,
                });

                // modal draggable and resizable
                $(self.$modal).find('.modal-dialog').draggable({
                    handle: ".modal-header",
                });
                var width = self.$modal.find('.modal-content').width();
                var height = self.$modal.find('.modal-content').height();
                var backdrop = self.$modal.attr('data-backdrop');
                if (backdrop){
                    $('body.modal-open').attr('data-backdrop', backdrop);
                }
                self.$modal.find('.modal-content').resizable({
                    minWidth: width,
                    minHeight: height,
                });

                self._openedResolver();
                if (options && options.shouldFocusButtons) {
                    self._onFocusControlButton();
                }
    
                // Notifies OwlDialog to adjust focus/active properties on owl dialogs
                OwlDialog.display(self);
    
                // Notifies new webclient to adjust UI active element
                core.bus.trigger("legacy_dialog_opened", self);
            });
            return self;
        },
    });


});
