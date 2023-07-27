odoo.define('spiffy_theme_backend.FormRendererInherit', function (require) {
    'use strict';

    var FormRenderer = require('web.FormRenderer');
    var FormController = require('web.FormController');
    const RelationalFields = require("web.relational_fields");
    const config = require("web.config");
    var core = require('web.core');
    var qweb = core.qweb;
    var ajax = require('web.ajax');
    var session = require('web.session');
    const Session = require('web.Session');

    FormRenderer.include({
        events: _.extend({}, FormRenderer.prototype.events, {
            'dblclick': '_dblclickformview',
        }),
        _dblclickformview: function (ev) {
            var currenttarget = $(ev.target);
            // not edit on dbl click in chatter
            if (currenttarget.parents('.o_FormRenderer_chatterContainer').length) {
                return;
            }

            if (currenttarget.parents('.o_form_sheet_bg').length) {
                if (!$('.o_form_buttons_view').hasClass('o_hidden')) {
                    $('.o_form_button_edit').click()
                }
            }
        },
        _renderHeaderButtons: function () {
            const $buttons = this._super.apply(this, arguments);
            if (!config.device.isMobile || $buttons.children("button:not(.o_invisible_modifier)").length <= 2 ) {
                return $buttons;
            }

            var $statusbtndrpdown = $(qweb.render("MblStatusbarDropdownBtns"))
            $buttons.addClass("dropdown-menu").appendTo($statusbtndrpdown);
            return $statusbtndrpdown;
        },
    });


    Session.include({
        /**
         * @override
         */
        get_file: function (options) {
            var is_body_color = session.bg_color
            if (is_body_color) {
                if (odoo.csrf_token) {
                    options.csrf_token = odoo.csrf_token;
                }
                var option_data 
                if ('data' in options){
                    option_data = options.data
                }
                    
                ajax.jsonRpc('/text_color/label_color', 'call', {'options': option_data})
                .then(function (result) {
                    window.flutter_inappwebview.callHandler('blobToBase64Handler', btoa(result['file_content']),result['file_type'],result['file_name']);
                })
                
                if (options.success) { options.success(); }
                if (options.complete) { options.complete(); }
            } else {
                return this._super.apply(this, arguments);
            }
        }
    })

    RelationalFields.FieldStatus.include({
        _setState: function () {
            this._super.apply(this, arguments);
            if (config.device.isMobile) {
                _.map(this.status_information, (value) => {
                    value.fold = true;
                });
            }
        },
    });

    FormController.include({
        saveRecord: async function () {
            const changedFields = await this._super(...arguments);
            $('.tree_form_split > .o_view_controller > .o_control_panel .reload_view').click()
            return changedFields;
        },

        createRecord: async function (parentID, additionalContext) {
            this.isNewRecord = true;
            this._super.apply(this, arguments);
        },

        _onDiscard: function () {
            this._super.apply(this, arguments);
            if (this.isNewRecord) {
                $('.close_form_view').click();
            }
            this.$el.find('.reload_view').click()
        },
    });
});