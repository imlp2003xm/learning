
/*global RC */
RC.ns("RC.UI", "RC.UI.Rules", "RC.UI.Rules.CallForwardingGrid");
RC.ComponentMgr.load('rules/sections/callForwardingGrid.css');

const MAX_OTHER_PHONE_COUNT = 7;

RC.UI.Rules.CallForwardingGrid = RC.extend(RC.utils.Observable, {
    constructor: function(mailboxId, ruleInfo, pageName, isOtherUserPhoneExist, tabId, model) {
        var self = this;
        function updateIOBtn() {
            var ruleInfo = this.data;
            var ioBtn = RC.getCmp('ioButton' + ruleInfo.ruleType);
            if (ioBtn) {
                ioBtn.setValue(ruleInfo.internetOutageInfo.enabled ? RC.Lang.Common.ON : RC.Lang.Common.OFF);
            }
        }
        
        if (model && model.addListener) {
            model.addListener('onLoad', updateIOBtn);
        }
        model = model || {};

        
        RC.UI.Rules.CallForwardingGrid.superclass.constructor.apply(this, [
            {}
        ]);

        var output = RC.UI.Rules.CallForwardingGrid.Collection.createCollectionFromRuleInfo(ruleInfo.phones);
        var simplifiedUI = RC.Config.simplifiedUI;

        var collection = output.collection;
        var disabledGroup = output.disabledGroup;

        var idPrefix = 'rules-callForwardingGrid-';

        var selectedItems = new RC.UI.Rules.CallForwardingGrid.SelectedItems();

        var createRingGroupButtonId = 'create_ring_group_' + ruleInfo.ruleType;

        var statusCount = 0; // it is to store No.for on status
        var otherUserPhones = [];

        var langLocal = RC.Lang.Rules.CallForwardingGrid;

        function openOtherUserPhoneChooser() {
            var $do = new RC.data.AsyncContext();
            var data = [];
            var selectedPhones = {};

            $do(prepareSelectedPhones);
            $do(loadOtherUserPhones);
            $do(openPopup);

            function prepareSelectedPhones(cb) {
                RCL._.each(ruleInfo.phones, function(phone) {
                    var number = new RC.UI.Rules.CallForwardingGrid.Number(phone);
                    var forwardedPhoneId;

                    if (number.isDL() && !number.isOwnDL() && number.isDisplayed()) {
                        forwardedPhoneId = number.getForwardPhoneId();
                        selectedPhones[forwardedPhoneId] = {
                            forwardedPhoneId: forwardedPhoneId,
                            isSelected: true
                        };
                    }
                });

                cb();
            }

            function loadOtherUserPhones(cb) {
                Wrapper.Rules.listOtherUserPhones(mailboxId, function (res) {
                    data = RCL._.map(res.phones, function(phone) {
                        var number = new RC.UI.Rules.CallForwardingGrid.Number(phone);
                        var forwardedPhoneId = number.getForwardPhoneId();

                        if (!(RC.Config.isUserBasedTier && number.isSoftPhone())) {
                            otherUserPhones[forwardedPhoneId] = number;

                            return {
                                forwardedPhoneId: forwardedPhoneId,
                                userName: number.getExtName(),
                                phoneName: number.getName(),
                                phoneNumber: number.getNumber(),
                                pin: number.getRawPin()
                            };
                        }
                    });
                    data = RCL._.compact(data);

                    cb();
                });
            }

            function openPopup(cb) {
                RCL.loadPackage(['core/all', 'components/callForwarding'], function(UI, callForwarding) {
                    UI.showPopup(callForwarding.ChooseForwardedPhonePopup, {
                        isMultipleSelection: true,
                        title: langLocal.ADDITIONAL_PHONES,
                        prompts: langLocal.FORWARD_TO_OTHERS_TIP,
                        data: data,
                        selectedPhones: selectedPhones,
                        saveAlwaysEnabled: true,
                        handleButtonSaveClick: save,
                        isUnSaveButton: true,
                        showPhoneNumber: !RC.Config.isUserBasedTier
                    });

                    cb();
                });
            }

            function save(selectedPhones) {
                var selectedPhoneIds = RCL._.map(selectedPhones, 'forwardedPhoneId');

                collection.syncEnabledOtherUserPhones(otherUserPhones, selectedPhoneIds);

                updateRuleInfo();

                RCL.Popup.close();
            }
        }

        function stateListener(number) {
            number.addListener("enabled", function(n, isEnabled, isNumberStateChanged) {
                if (isNumberStateChanged) {
                    statusCount += (isEnabled ? 1 : -1);
                    self.fireListener('stateChange', statusCount <= 0);
                }
            });
        }

        function isGroupsExist() {
            var result = false;
            collection.each(function(group){
                if (group.getCount() > 1 && group.isEnabled()) {
                    result = true;
                }
            });
            return result;
        }

        function getRingGroupButtonLabel() {
            return isGroupsExist() ? langLocal.EDIT_RING_GROUPS : langLocal.CREATE_RING_GROUPS;
        }

        function updateRuleInfo() {
            model.dirty = true;
            ruleInfo.phones = collection.serialize();
            RC.getCmp(createRingGroupButtonId).set(getRingGroupButtonLabel());
        }

        function resetNumberStatus(collection) {
            statusCount = 0;
            collection.each(function(group, groupIndex) {
                group.each(function(number, numberIndex) {

                    if (number.isEnabled()) {
                        statusCount++;
                    }
                    stateListener(number);
                });
            });
        }

        resetNumberStatus(collection);

        Object.each(disabledGroup, function(number) {
            stateListener(number);
        });

        var container = new Element('div');
        var containerForRingGroup = new Element('div');
        var formId = RC.genId() + '-' + idPrefix + 'form';

        var ringGroupForm = new RC.form.FormPanel({
            id: formId,
            extraStyles: {
                'margin-top': '-1px'
            },
            items: (function() {
                var arr = [];
                arr.push({
                    xtype: 'div',
                    html: containerForRingGroup
                });

                arr.push({
                    xtype: 'fieldgroup',
                    items: [
                        {
                            xtype: 'button',
                            id: 'ring_group_group',
                            text: langLocal.GROUP,
                            handler: function() {
                                var items = selectedItems.get();

                                if (items.length < 2) {
                                    RC.Msg.alert(RC.Lang.Common.ALERT, langLocal.SEL_MORE_THAN_ONE_PHONE, null, true);
                                    return;
                                }

                                selectedItems.clean();
                                collection.group(items);
                            }
                        },
                        {
                            xtype: 'button',
                            id: 'ring_group_ungroup',
                            text: langLocal.UNGROUP,
                            handler: function() {
                                var items = selectedItems.get();

                                if(items.length <= 0 ){
                                    RC.Msg.alert(RC.Lang.Common.ALERT, langLocal.SEL_NO_ONE_FOR_UNGROUP, null, true);
                                    return;
                                }
                                selectedItems.clean();
                                collection.ungroup(items);
                            }
                        }

                    ]
                });
                return arr;
            })(),
            listeners: {
                render: function() {
                    collection.updatePositions();
                }
            }
        });


        var form = new RC.form.FormPanel({
            id: formId,
            extraStyles: {
                'margin-bottom': '12px'
            },
            items: (function() {
                var arr = [];
                arr.push({
                    xtype: 'div',
                    html: container
                });

                var addPhoneButton = {
                    xtype: 'button',
                    id: 'add_phone',
                    width: 80,
                    text: langLocal.ADD_PHONE,
                    extraStyles : {
                        'padding-top' : '5px'
                    },
                    handler: function() {
                        var success = self.addCustomPhoneNumber();
                        self.fireListener('addCustomPhoneNumber',success);
                    }
                };

                var ringGroupButton = {
                    xtype: 'button',
                    id: createRingGroupButtonId,
                    width: 130,
                    testId: 'rules-sections-callForwardingGrid-createRingGroup',
                    text: getRingGroupButtonLabel(),
                    handler: function() {
                        var config = {};
                        var self = this;
                        collection.clearTransientData();
                        updateRuleInfo();
                        config.isGroupsExist = isGroupsExist();
                        config.mailboxId = mailboxId;
                        config.ruleInfo = ruleInfo;
                        config.pageName = pageName;

                        var values = collection.serialize(),
                            phone_error = '';

                        RC.ComponentMgr.batchLoad(['validationStrategy.js', 'rules/validationPhones.js'], function() {
                            self.getValidatorPhoneGroups = new RC.UI.Rules.ValidationPhoneGroups();
                            function hasPhonesError() {
                                var hasErrorPhone = false;
                                for (var idx = 0; idx < values.length; idx++) {
                                    var phone = values[idx];
                                    if (phone.phoneNumberInfo.formattedNumber && phone.enabled) {
                                        self.getValidatorPhoneGroups.validate({phoneGroups: phone.phoneNumberInfo.formattedNumber});
                                        var error = !self.getValidatorPhoneGroups.hasErrors();
                                        if (error) {
                                            phone_error = phone.phoneNumberInfo.formattedNumber;
                                            hasErrorPhone = true;
                                            break;
                                        }
                                    }
                                }
                                return hasErrorPhone;
                            }
                            if (hasPhonesError()) {
                                RC.Msg.alert(RC.Lang.Common.ALERT, langLocal.INVALID_NUMBER_FOR_GROUP + ' ' + phone_error, null, true);
                            } else {
                                RC.ComponentMgr.load('rules/sections/ringGroups.js', function () {
                                    var ringGroups = new RC.UI.Rules.RingGroups(config);
                                    ringGroups.addListener("cancel", function () {
                                        collection.updatePositions();
                                    });

                                    ringGroups.addListener("done", function(changedCollection) {
                                        updateRingGroups(changedCollection);
                                        ringGroups.close();
                                    });
                                    ringGroups.show();
                                });
                            }
                        });
                    }
                };

                var updateRingGroups = function (changedCollection) {
                    collection.records = changedCollection.records;
                    collection.data = changedCollection.data;
                    collection.recordsFiltered = changedCollection.recordsFiltered;

                    collection.each(function(group) {
                        group._detachListeners(changedCollection);
                        group._attachListeners(collection);
                    });

                    resetNumberStatus(collection);

                    collection.updatePositions();
                    updateRuleInfo();

                };

                (function () {
                    var items = [];
                    if (!RC.Config.simplifiedUI) {
                        items.push(addPhoneButton);
                    }
                    items.push(ringGroupButton);
                    arr.push({
                        xtype: 'div',
                        extraClass: 'rules-callForwarding-buttonsGroup-container',
                        items: items
                    });
                } ());
                return arr;
            })(),
            listeners: {
                render: function() {
                    collection.updatePositions();
                }
            }
        });

        collection.addListener('positionsUpdated', function() {

            container.empty();
            containerForRingGroup.empty();

            cleanFormItems(form);
            cleanFormItems(ringGroupForm);

            function cleanFormItems(form) {
                var idsForDestruction = [];
                form._items.each(function(element) {
                    var callForwardingGroupItemId = element.callForwardingGroupItemId;
                    !RC.isEmpty(callForwardingGroupItemId) && idsForDestruction.push(callForwardingGroupItemId);
                });

                idsForDestruction.each(function(id) {
                    form.removeItem(id);
                });
                form._items = form._items.clean();
            }

            var table = new Element('table', {
                'class': 'rules-callForwarding'
            });

            var tableForRingGroup = new Element('table', {
                'class': 'rules-callForwarding'
            });

            var ringForHeadElem = new RC.Div({
                html: RC.Lang.Rules.CallForwardingGrid.RING_FOR,
                hintText: RC.Lang.Rules.CallForwardingGrid.RING_FOR_HINT_TEXT,
                extraClass: 'rules-sections-callForwardingGrid-ringForHead'
            }).render();

            var theadContent = [
                '&nbsp;',
                RC.Lang.Rules.CallForwardingGrid.PHONE,
                RC.Lang.Rules.CallForwardingGrid.ACTIVE,
                ringForHeadElem,
                RC.Lang.Rules.CallForwardingGrid.MOVE
            ];

            var trElem = new Element('tr');
            theadContent.forEach(function(content) {
                var tdElem = new Element('td');
                if(RC.isMooElement(content)) {
                    tdElem.adopt(content);
                } else {
                    tdElem.setProperty('html', content);
                }
                tdElem.inject(trElem);
            });

            new Element('thead').adopt(trElem).inject(table);

            var tbody = new Element('tbody').inject(table);
            var tbodyForRingGroup = new Element('tbody').inject(tableForRingGroup);

            var fieldId = 0;

            var rows = [];
            var rowsForRingGroup = [];

            collection.each(function(group, groupIndex) {

                var numberCount = group.getCount();
                var nextGroup = collection.getAt(groupIndex + 1);
                var isNextEnabled = (nextGroup && nextGroup.isEnabled());

                // Create a combo one for each group
                fieldId++;
                var groupComboItemId = idPrefix + fieldId + '-' + RC.genId();
                var groupCombo = form.addItem({
                    xtype: 'combo',
                    id: groupComboItemId,
                    callForwardingGroupItemId: groupComboItemId,
                    width: 80,
                    disabled: !group.isEnabled(),
                    store: function() {
                        var items = [],
                            MIN_RING = 1,
                            MAX_RING = 15;
                        for (var i = MIN_RING; i <= MAX_RING; i++) {
                            items.push(buildOption(i));
                        }
                        return items;

                        function buildOption(value) {
                            var SECONDS_PER_RING = 5,
                                text = (value * SECONDS_PER_RING) + ' ' + RC.Lang.Rules.CallForwardingGrid.SECS,
                                selectedFlag = (value == group.getRingCycle()) ? 'selected' : '';

                            return [value.toString(), text, selectedFlag];
                        }
                    }(),
                    listeners: {
                        selected: function(r) {
                            group.setRingCycle(r.value);
                        }
                    }
                });

                fieldId++;
                var ringGroupCheckboxItemId = idPrefix + fieldId + '-' + RC.genId();
                var groupCheckbox = ringGroupForm.addItem({
                    xtype: 'checkbox',
                    id: ringGroupCheckboxItemId,
                    callForwardingGroupItemId: ringGroupCheckboxItemId,
                    checked: (selectedItems.isExisting(group)),
                    listeners: {
                        change: function(checked) {
                            selectedItems[checked ? 'add' : 'remove'](group);
                        }
                    }
                });

                group.each(function(number, numberIndex) {

                    var row = new Element('tr', {
                        'class': group.isEnabled() ? 'rules-callForwarding-group-enabled' : 'rules-callForwarding-group-disabled'
                    });
                    var rowForRingGroup;

                    var cells = [];
                    var cellsForRingGroup = [];

                    var isGroupEnabled = group.isEnabled();
                    if (isGroupEnabled) {
                        rowForRingGroup = new Element('tr', {
                            'class': 'rules-callForwarding-group-enabled'
                        });
                    }

                    var rowClasses;
                    if (numberCount > 1) {
                        rowClasses = ['rules-callForwarding-group'];
                        if (numberIndex == 0) rowClasses.push('rules-callForwarding-group-first');
                        if (numberIndex == numberCount - 1) rowClasses.push('rules-callForwarding-group-last');

                        row.addClass(rowClasses.join(' '));

                        if (isGroupEnabled) {
                            rowForRingGroup.addClass(rowClasses.join(' '));
                        }
                    }

                    var displayTDs = function(number) {
                        if (numberCount == 1 && !number.isDL()) {
                            /*
                             UIA-7714 with mask * we hide all elements inside td, but not td itself, if we hide td tags - that causes bugs in Chrome - td borders are hidden
                             */
                            var isEmptyName =  RC.isEmpty(number.getName()),
                                isEmptyNumber = RC.isEmpty(number.getNumber()),
                                hiddenClass = 'x-visibility-hidden',
                                isHidden = number.isEditable() ?  (isEmptyName || isEmptyNumber) : isEmptyNumber;

                            var elements = ['.rules-callForwarding-group-cell-select *', '.rules-callForwarding-group-cell-active *',
                                '.rules-callForwarding-group-cell-ringFor *', '.rules-callForwarding-group-cell-move *'];
                            row.getElements(elements.join(', ')).toggleClass(hiddenClass, isHidden);
                            if (isGroupEnabled) {
                                rowForRingGroup.getElements(elements.join(', ')).toggleClass(hiddenClass, isHidden);
                            }
                        }
                    };

                    function getGroupLabel (label) {
                        return RC.Lang.Common.CUSTOM_PHONE_TYPES[label.toUpperCase()] || label;
                    };

                    var numberTitle = new Element('div', {
                        'class': 'rules-callForwarding-group-number-name',
                        'html': RC.utils.Text.encodeHtml(getGroupLabel(number.getNameShort())),
                        'title': getGroupLabel(number.getName()) + (!RC.isEmpty(number.getNumber()) && number.isDL() ? ' - ' + number.getNumber() : '')
                    });

                    var firstColumn =[];
                    if(number.isDL()){
                        firstColumn.push(numberTitle);
                    }else{

                        /*
                         new number should be enabled on blur
                         UIA-10786
                         */
                        var enableOnBlur = false;
                        function numberChanged(value, isChangeName) {
                            //number was empty and now is set to some value
                            var isEmptyName = RC.isEmpty(number.getName()),
                                isEmptyNumber = RC.isEmpty(number.getNumber());
                            if(number.isEditable()){
                                enableOnBlur = (!isEmptyName && !isEmptyNumber && enableOnBlur) || (isChangeName && !isEmptyNumber && value) || (!isChangeName && !isEmptyName && value);
                            }else{
                                enableOnBlur = !isEmptyNumber && enableOnBlur || isEmptyNumber && value;
                            }
                            if(isChangeName){
                                number.setOtherPhoneName(value.trim());
                            }else{
                                number.setNumber(value.trim());
                            }
                            displayTDs(number);
                        }

                        function numberChangedBlur(){
                            if (enableOnBlur) {
                                number.setEnabled(true);
                                enableOnBlur = false;
                                updateRuleInfo();
                                collection.updatePositions();
                            }
                            self.fireListener('customNumberChanged', number);
                        }

                        fieldId++;
                        var numberFieldCmpName = idPrefix + fieldId;
                        var groupNumberFieldId = idPrefix + fieldId + '-' + RC.genId();
                        var testId = number.getName().replace(" ", "") + "PhoneNumber";

                        var numberField = form.addItem({
                            xtype: 'textfield',
                            testId: testId,
                            id: groupNumberFieldId,
                            name: numberFieldCmpName,
                            callForwardingGroupItemId: groupNumberFieldId,
                            fieldWidth: 120,
                            emptyText: RC.Lang.Common.PHONE_NUMBER,
                            value: number.getNumber(),
                            onInputChange: function(e, value) {
                                numberChanged(value, false);
                            },
                            listeners: {
                                keypress: function(value){
                                    numberChanged(value, false);
                                },
                                blur: numberChangedBlur
                            }
                        });

                        if(number.isOther() && !RC.Config.simplifiedUI){

                            var groupTitleFieldId = idPrefix + fieldId + '-title-' + RC.genId();
                            var titleEdit =  form.addItem({
                                xtype: 'textfield',
                                id: groupTitleFieldId,
                                name: idPrefix + 'editTitle-' +  fieldId,
                                testId: 'editTitle',
                                callForwardingGroupItemId: groupTitleFieldId,
                                extraClass: !number.isEditable() ? 'x-hidden' : '',
                                emptyText: RC.Lang.Rules.CallForwardingGrid.PHONE_NAME,
                                maxlength: 64,
                                fieldWidth: 120,
                                onInputChange: function(e, value) {
                                    numberChanged(value,true);
                                },
                                value: number.getName(),
                                listeners: {
                                    keypress: function(value){
                                        numberChanged(value, true);
                                    },
                                    blur: numberChangedBlur
                                }
                            });
                            var titleLink = new Element('div', {
                                'class': number.isEditable() ? 'x-hidden' : 'rules-callForwarding-group-number-name-link',
                                'html': RC.utils.Text.encodeHtml(getGroupLabel(number.getNameShort())),
                                'title': number.getName(),
                                'events': {
                                    click: function(e) {
                                        number.enableEdited();
                                        titleEdit.toggleClass('x-hidden');
                                        self.fireListener('customNumberChanged', number);
                                        this.destroy();
                                    }
                                }
                            });

                            firstColumn.push(titleLink, titleEdit, numberField);
                        }else{
                            firstColumn.push(numberTitle, numberField);
                        }
                    }

                    if (numberIndex == 0) {

                        rowClasses = [];
                        if (groupIndex == 0) rowClasses.push('rules-callForwarding-group-start');
                        if (!isNextEnabled) rowClasses.push('rules-callForwarding-group-end');
                        row.addClass(rowClasses.join(' '));

                        if (isGroupEnabled) {
                            var checkTdForRingGroup = new Element('td', {
                                'rowspan': numberCount,
                                'class': 'rules-callForwarding-group-cell-select rules-callForwarding-group-rowspan'
                            });
                            cellsForRingGroup.push(checkTdForRingGroup);
                            checkTdForRingGroup.adopt(groupCheckbox);
                        }

                    }

                    cells.push(new Element('td', {
                        'class': 'rules-callForwarding-group-cell-label rules-callForwarding-group-number rules-callForwarding-group-cell-label-empty-div'
                    }).adopt(new Element('div', {})));

                    cells.push(new Element('td', {
                        'class': 'rules-callForwarding-group-cell-label rules-callForwarding-group-number' + (number.isDL() ? ' rules-callForwarding-group-cell-label-dl' : ' rules-callForwarding-group-cell-label-other')
                    }).adopt(firstColumn));

                    if (isGroupEnabled) {
                        cellsForRingGroup.push(new Element('td', {
                            'class': 'rules-callForwarding-group-cell-label rules-callForwarding-group-number' + (number.isDL() ? ' rules-callForwarding-group-cell-label-dl' : ' rules-callForwarding-group-cell-label-other')
                        }).adopt(new Element('div', {
                            'class': 'rules-callForwarding-ring-groups-group-number-name',
                            'html': RC.utils.Text.encodeHtml(getGroupLabel(number.getNameShort())),
                            'title': getGroupLabel(number.getName())
                        })));

                        cellsForRingGroup.push(new Element('td', {
                            'class': 'rules-callForwarding-group-cell-label rules-callForwarding-group-number' + (number.isDL() ? ' rules-callForwarding-group-cell-label-dl' : ' rules-callForwarding-group-cell-label-other')
                        }).adopt(new Element('div', {
                            'class': 'rules-callForwarding-ring-groups-group-number',
                            'html': number.getNumber(),
                            'title': number.getNumber()
                        })));
                    }

                    if (numberIndex == 0) {
                        cells.push(new Element('td', {
                            'rowspan': numberCount,
                            'class': 'rules-callForwarding-group-cell-active rules-callForwarding-group-rowspan'
                        }).adopt(new RC.form.SwitchButton({
                                value: group.isEnabled(),
                                listeners: {
                                    statusChanged: function() {
                                        RC.Loader.show({
                                            handler: function() {
                                                var groupEnabled = group.isEnabled();

                                                group.setEnabled(!groupEnabled);
                                                if (groupEnabled) {
                                                    collection.ungroup([group], true);
                                                }

                                                collection.updatePositions();
                                                updateRuleInfo();
                                                RC.Loader.hide();
                                            }
                                        });
                                    }
                                }
                            }).render()));

                        var comboTd = new Element('td', {
                            'rowspan': numberCount,
                            'class': 'rules-callForwarding-group-cell-ringFor rules-callForwarding-group-rowspan'
                        });
                        cells.push(comboTd);

                        var ringForItem = isGroupEnabled ? groupCombo : new Element('div',{
                            'class' : 'rules-callForwarding-group-cell-ringFor-placeholder'
                        });
                        comboTd.adopt(ringForItem);

                        cells.push(new Element('td', {
                            'rowspan': numberCount,
                            'class': 'rules-callForwarding-group-cell-move rules-callForwarding-group-rowspan'
                        }).adopt(
                            new Element('div', {
                                'class': 'rules-callForwarding-group-move'
                            }).adopt(new Element('a', {
                                'href': '#',
                                'html': RC.Lang.Rules.CallForwardingGrid.UP,
                                'class': groupIndex != 0 && number.isEnabled() ? 'rules-callForwarding-group-move-up' : number.isEnabled() ? 'rules-callForwarding-group-move-up-disabled' : 'rules-callForwarding-group-move-up-hidden',
                                'style':  '',
                                'events': {
                                    click: function(e) {
                                        e.stop();
                                        RC.Loader.show({
                                            handler: function() {
                                                group.moveUp();
                                                collection.updatePositions();
                                                RC.Loader.hide();
                                            }
                                        });
                                    }
                                }
                            }),
                            new Element('a', {
                                'href': '#',
                                'html': RC.Lang.Rules.CallForwardingGrid.DOWN,
                                'class': !RC.isEmpty(nextGroup) && number.isEnabled() && nextGroup.isEnabled() ? 'rules-callForwarding-group-move-down' : number.isEnabled() ? 'rules-callForwarding-group-move-down-disabled' : 'rules-callForwarding-group-move-down-hidden',
                                'events': {
                                    click: function(e) {
                                        e.stop();
                                        RC.Loader.show({
                                            handler: function() {
                                                group.moveDown();
                                                collection.updatePositions();
                                                RC.Loader.hide();
                                            }
                                        });
                                    }
                                }
                            }))
                        ));

                    }

                    row.adopt(cells);
                    rows.push(row);

                    if (isGroupEnabled) {
                        rowForRingGroup.adopt(cellsForRingGroup);
                        rowsForRingGroup.push(rowForRingGroup);
                        rowForRingGroup.getElements('.rules-callForwarding-group-cell-select *').setStyle('visibility', 'visible');
                    }

                    displayTDs(number);
                });

            });
            
            if (isOtherUserPhoneExist) {
                var row = new Element('tr', {});

                new Element('td', {
                    'colspan': 5,
                    'align' : 'left',
                    'styles':{
                        'border-bottom':'0px',
                        'padding-top':'10px'
                    }
                }).adopt(new Element('a', {
                        'href': '#',
                        'class': 'x-link-arrow',
                        'html': langLocal.FORWARD_TO_OTHERS,
                        'events': {
                            click: function (e) {
                                e.stop();
                                if (pageName) {
                                    var ruleName = ruleInfo.ruleName;
                                    if (ruleName.indexOf("Business") > -1) {
                                        var curPageName = pageName + '.BizHrs.Forward';
                                        RC.getOmniLog().logPageView(curPageName);
                                    }
                                    if (ruleName.indexOf("After") > -1) {
                                        var curPageName = pageName + '.AfterHrs.Forward';
                                        RC.getOmniLog().logPageView(curPageName);
                                    }
                                }
                                RC.Loader.show({
                                    handler: function () {
                                        openOtherUserPhoneChooser();
                                        RC.Loader.hide();
                                    }
                                });
                            }
                        },
                        'data-test-automation-id': 'rules-sections-callForwardingGrid-forwardToOthers'
                    })).inject(row);

                rows.push(row);
            }
                
            tbodyForRingGroup.adopt(rowsForRingGroup);
            tbody.adopt(rows);

            containerForRingGroup.adopt(tableForRingGroup);
            container.adopt(table);

        });

        this.getCanvas = function() {
            return form;
        };

        this.getCanvasForRingGroup = function() {
            return ringGroupForm;
        };

        this.getCollection = function() {
            return collection;
        };

        this.getDisabledGroup = function() {
            return disabledGroup;
        };

        this.formId = function() {
            return formId;
        };

        this.getStatusCount = function() {
            return statusCount;
        };

        /**
         * @throws RC.Error
         */
        this.getValues = function(collectionOnly) {
                var values = collection.serialize(),
                    phones = [],
                    errors = new RC.Error(),
                    phoneNames = [];

            var order = 1;
            for(var idx = 0; idx < values.length; idx ++) {

                var phone = values[idx];

                if (phone.phoneNumberInfo.formattedNumber && phone.enabled) {
                    phone.phoneNumberInfo.number = phone.phoneNumberInfo.formattedNumber;
                    phones.push(phone.phoneNumberInfo.formattedNumber);
                }
                var number = new RC.UI.Rules.CallForwardingGrid.Number(phone);

                if(!number.isDL()){
                    var phoneName = number.getName(),
                        phoneNumber = number.getNumber(),
                        isEmptyName = RC.isEmpty(phoneName);

                    if(number.isOther() && number.isEmptyOnlyName() && !simplifiedUI) {
                        errors.add(langLocal.ENTER_PHONE_NAME_AND_NUMBER);
                        return errors;
                    }
                    !isEmptyName && phoneNames.push(phoneName.toUpperCase());

                    if(number.isEnabled() && !number.isValid()){
                        var errorMessage = RC.utils.Lang.isLuxembourg(RC.Config.countryId)
                                            ? langLocal.INVALID_NUMBER_LUXEMBOURG
                                            : langLocal.INVALID_NUMBER;
                        errors.add(RC.UI.Message(errorMessage, RC.utils.Text.encodeHtml(phoneNumber)));
                        return errors;
                    }
                    if (phoneName.indexOf('"') > -1 || phoneName.indexOf('/') > -1 || phoneName.indexOf('>') > -1 || phoneName.indexOf('<') > -1) {
                        errors.add(RC.UI.Message(langLocal.INVALID_NAME, RC.utils.Text.encodeHtml(phoneName)));
                        return errors;
                    }
                }
                order++;
            }

            //restore unused phones
            if (!collectionOnly) {
                var dGroup = this.getDisabledGroup();
                for(var phId in dGroup){
                    values.push(dGroup[phId].getDisabledPhone(order));
                    order++;
                }
            }

            return values;

        };

        this.onChangeState = function(fn) {
            this.addListener("stateChange", fn);
        };

        this.onCustomNumberChanged = function(callback) {
            this.addListener('customNumberChanged', callback);
        };

        this.onAddCustomPhoneNumber = function(callback) {
            this.addListener('addCustomPhoneNumber', callback);
        };

        this.setCustomNumber = function(groupNumber) {
            var type = groupNumber.getType();
            var oldGroupNumber = this.findCustomGroupNumber(type);
            oldGroupNumber.setNumber(groupNumber.getNumber());
            oldGroupNumber.setOtherPhoneName(groupNumber.getName());
            groupNumber.isEditable() && oldGroupNumber.enableEdited();
            if (!groupNumber.getNumber() && oldGroupNumber.isEnabled()) {
                oldGroupNumber.setEnabled(false);
            }
            collection.updatePositions();
            updateRuleInfo();
        };

        this.addCustomPhoneNumber = function(){
            var existedOtherPhoneTypes = [];
            ruleInfo.phones.forEach(function(phone) {
                var number = new RC.UI.Rules.CallForwardingGrid.Number(phone);
                if (!number.isDL() && number.isOther()){
                    existedOtherPhoneTypes.push(number.getType());
                }
            });

            var formComponent = RC.getCmp(tabId + 'ReadPhoneOrderForm');
            var orderComponent = formComponent && formComponent.findField('readPhoneOrder');
            var readPhoneOrder = (orderComponent && orderComponent.getValue() || ruleInfo.readPhoneOrder).toLowerCase();

            switch (readPhoneOrder) {
                case 'simultaneously':
                    var maxSimultaneousForwarding = RC.Config.maxSimultaneousForwarding;
                    if (maxSimultaneousForwarding > 0 && ruleInfo.phones.length >= maxSimultaneousForwarding) {
                        const message = RC.UI.Message(langLocal.EXCEED_MAX_PHONE_COUNT_ALERT, maxSimultaneousForwarding);
                        RC.Msg.alert(RC.Lang.Common.ALERT, message, null, true);
                        return false;
                    }
                    break;
                default:
                    // TODO Clarify requirements, is required a limit for sequentially phone order
                    // TODO Do not use magic const MAX_OTHER_PHONE_COUNT
                    if (existedOtherPhoneTypes.length >= MAX_OTHER_PHONE_COUNT) {
                        RC.Msg.alert(RC.Lang.Common.ALERT, langLocal.EXCEED_MAX_PHONE_ALERT, null, true);
                        return false;
                    }
                    break;
            }

            var newOtherPhone = new RC.UI.Rules.CallForwardingGrid.Number({
                "phoneNumberInfo": {
                    "alternate": false,
                    "formattedNumber": "",
                    "name": "",
                    "number": ""
                },
                editable: true
            });
            var type = newOtherPhone.findUnUsedOtherPhoneType(existedOtherPhoneTypes);
            if (!type) {
                return false;
            }

            stateListener(newOtherPhone);
            newOtherPhone.setOtherPhoneType(type);
            var newGroup = new RC.UI.Rules.CallForwardingGrid.Group(9999, newOtherPhone.getRingCycle());
            newGroup.addNumber(newOtherPhone);
            self.getCollection().addGroup(newGroup);
            self.getCollection().updatePositions();
            updateRuleInfo();
            return true;
        };

        this.findCustomGroupNumber = function(numberType) {
            var groupNumber;
            collection.each(function(group, groupIndex) {
                group.each(function(number, numberIndex) {
                    if (number._type == numberType) {
                        groupNumber = number;
                    }
                });
            });
            return groupNumber;
        };
    }
});

RC.UI.Rules.CallForwardingGrid.SelectedItems = function() {

    var array = [];

    return {
        get: function() {
            // Always return sorted by position
            return array.sort(function(group1, group2) {
                if (group1.getPosition() > group2.getPosition()) return 1;
                if (group1.getPosition() < group2.getPosition()) return -1;
                return 0;

            });
        },
        add: function(group) {
            array.push(group);
        },
        remove: function(group) {
            array.erase(group);
        },
        isExisting: function(group) {
            return array.indexOf(group) != -1;
        },
        clean: function() {
            array = [];
        }
    };

};

RC.UI.Rules.CallForwardingGrid.Collection = RC.extend(RC.data.JsonStore, {
    constructor: function() {

        // Apply default Store constructor with special parameters
        RC.UI.Rules.CallForwardingGrid.Collection.superclass.constructor.apply(this, [
            {
                data: [],
                sort: function(itemA, itemB) {
                    var PRIORITY_STATUS_OFF = 99999;
                    var itemAPosition = itemA.getPosition();
                    var itemBPosition = itemB.getPosition();

                    var itemAPriority = itemA.isEnabled() ? itemAPosition : PRIORITY_STATUS_OFF;
                    var itemBPriority = itemB.isEnabled() ? itemBPosition : PRIORITY_STATUS_OFF;

                    return (itemAPriority - itemBPriority) || compareByPropertiesWhenStatusOff();

                    function compareByPropertiesWhenStatusOff() {
                        var itemANumber = itemA.getAt(0);
                        var itemAName = itemANumber.getName();
                        var itemAPhoneNumber = itemANumber.getNumber();

                        var itemBNumber = itemB.getAt(0);
                        var itemBName = itemBNumber.getName();
                        var itemBPhoneNumber = itemBNumber.getNumber();

                        return compareByLineType() || compareByNumber() || compareByPosition();

                        function compareByLineType() {
                            var itemAPriority = itemA.isDL() ? 0 : 1;
                            var itemBPriority = itemB.isDL() ? 0 : 1;
                            var priority = itemAPriority - itemBPriority;

                            return  isAllItemDL() ? compareByName() : priority;

                            function isAllItemDL() {
                                return priority === 0 && itemA.isDL();
                            }
                        }

                        function compareByNumber() {
                            return compareStringIfEmpty(itemAPhoneNumber, itemBPhoneNumber) || compareByName();
                        }

                        function compareByName() {
                            return compareStringIfEmpty(itemAName, itemBName) ||
                                itemAName.localeCompare(itemBName);
                        }

                        function compareStringIfEmpty(value1, value2) {
                            var itemAPriority = RC.isEmpty(value1) ? 1 : 0;
                            var itemBPriority = RC.isEmpty(value2) ? 1 : 0;
                            return itemAPriority - itemBPriority;
                        }

                        function compareByPosition() {
                            return itemAPosition - itemBPosition;
                        }
                    }

                },
                autoLoad: true
            }
        ]);

        this.load();

    },
    _onGroupEnableCallback: function(group, number) {

        this.updatePositions();

    },
    _onGroupDestroyCallback: function(group) {
        this.removeGroup(group);
    },
    _onGroupChangePositionCallback: function(sourceGroup, to) {

        var oldPos = sourceGroup.getPosition();
        var newPos = oldPos + to;
        var collection = this;

        var targetGroup = collection.getAt(newPos);

        if (targetGroup) {

            sourceGroup.setPosition(newPos);
            targetGroup.setPosition(oldPos);

            replaceAt(oldPos, targetGroup);
            replaceAt(newPos, sourceGroup);

        }

        collection.updatePositions();

        function replaceAt(index, record) {
            var rawIndex = collection.getOriginalIndex(collection.getAt(index));
            collection.records[rawIndex] = record;
        }

    },
    addGroup: function(group) {
        group._attachListeners(this);
        // for performance issue, we don't want to trigger 'sort' for adding every group
        this.records.push(group);
    },
    removeGroup: function(group) {
        group._detachListeners(this);
        this.remove(group);
    },
    updatePositions: function() {

        var self = this;

        this.sort(); // Initial sort before positions update
        var i = 0;
        var emptyOffGroups = [];

        this.each(function(group) {
            /**
             * @type RC.UI.Rules.CallForwardingGrid.Group
             **/
            var isEmptyOffGroup = !group.isEnabled() && (group.getCount() > 1);
            isEmptyOffGroup && emptyOffGroups.push(group);
            group.setPosition(i);
            group.sort();
            i++;
        });

        self.ungroup(emptyOffGroups, true);

        this.sort(); // Final sort

        this.fireListener('positionsUpdated');

    },
    clearTransientData: function(){
        var transientData = [];
        this.each(function(group){
            group.data.each(function(number){
                if(!number.isDL() && (RC.isEmpty(number.getName()) || RC.isEmpty(number.getNumber()))){
                    transientData.push(number);
                }
            });
        });
        // Changing group number's status will cause the group to update its sort.
        // So we need to collect data first to avoid messing up the group when iterating the group.
        transientData.forEach(function(number) {
            number.setEnabled(false);
        });
    },
    group: function(groups) {

        if (groups.length < 1) return;

        var collection = this;
        var initGroup = groups[0];
        var initRingCycle = initGroup.getRingCycle();
        //RC.Console.log('Initial ring cycle: %o', initRingCycle);

        groups.each(function(group, i) {

            if (i == 0) return; // Skip first group, because all other numbers will be added into this one

            while (group.getCount() > 0) { // Do not use each() because numbers are being deleted inside a cycle

                var number = group.getAt(0);
                //RC.Console.log('Regroup number: %o', number.getName());

                group.removeNumber(number);
                initGroup.addNumber(number);

            }

            // Delete empty group
            collection.remove(group);

        });

        initGroup.sortNumbers();
        initGroup.setRingCycle(initRingCycle);

        this.updatePositions();

    },
    /**
     * Ungroups given numbers producing new groups one for each number
     * @param {Array} groups
     */
    ungroup: function(groups, skipUpdatingPositions) {
        if (groups.length < 1) return;

        var collection = this;

        groups.each(function(group) {

            var position = group.getPosition();

            while (group.getCount() > 1) { // Do not use each() because numbers are being deleted inside a cycle

                // Select a number at the start of the group + 1
                var number = group.getAt(1);

                position += 0.01;

                group.removeNumber(number);

                var newGroup = new RC.UI.Rules.CallForwardingGrid.Group(position, number.getRingCycle());
                newGroup.addNumber(number);

                collection.addGroup(newGroup);

            }

        });

        !skipUpdatingPositions && collection.updatePositions();
    },
    serialize: function() {

        var result = [];
        var currentDelay = 0;
        var currentOrderBy = 1;

        this.each(function(group) {

            group.each(function(phone) {

                var phoneParsed = {
                    ringDelay: currentDelay,
                    ringCycle: group.getRingCycle(),
                    addDigitsToCallerId: phone._addDigitsToCallerId,
                    askPIN: phone._askPIN,
                    dNIS: phone._dNIS,
                    deviceExists: phone._deviceExists,
                    deviceType: phone._deviceType,
                    digitsForCallerId: phone._digitsForCallerId,
                    enabled: phone._enabled,
                    forwardPhoneId: phone._forwardPhoneId,
                    forwarding: phone._forwarding,
                    mailboxId: phone._mailboxId,
                    orderBy: currentOrderBy,
                    ownedByThisMailbox: phone._ownedByThisMailbox,
                    phoneId: phone._phoneId,
                    phoneNumberInfo: phone._phoneNumberInfo,
                    playMailboxName: phone._playMailboxName,
                    skipFindMeMenu: phone._skipFindMeMenu,
                    editable: phone._editable,
                    type: phone._type
                };

                result.push(phoneParsed);

            });

            currentOrderBy++;
            currentDelay += group.getRingCycle();

        });

        return result;

    },
    syncEnabledOtherUserPhones: function(otherUserPhones, selectedPhoneIds) {
        var self = this;
        var visibleOtherUserPhoneIds = [];
        var disabledOtherUserPhones = [];

        self.each(function(group) {
            group.each(function(number) {
                var forwardedPhoneId = number.getForwardPhoneId();

                if (isOtherUserPhone(number)) {
                    if (selectedPhoneIds.indexOf(forwardedPhoneId) != -1) {
                        visibleOtherUserPhoneIds.push(forwardedPhoneId);
                        number.setEnabled(true, true);
                    } else {
                        disabledOtherUserPhones.push({
                            group: group,
                            number: number
                        });
                    }
                }
            });
        });

        disabledOtherUserPhones.each(function(disabledOtherUserPhone) {
            var group = disabledOtherUserPhone.group;
            var number = disabledOtherUserPhone.number;

            group.removeNumber(number);
        });

        var pos = 1000;
        selectedPhoneIds.each(function(selectedPhoneId) {
            var number;
            var group;
            if (visibleOtherUserPhoneIds.indexOf(selectedPhoneId) == -1) {
                number = otherUserPhones[selectedPhoneId];
                number.setEnabled(true, true);
                number.setForwarding(true);

                group = new RC.UI.Rules.CallForwardingGrid.Group(++pos, number.getRingCycle());
                group.addNumber(number);
                self.addGroup(group);
            }
        });

        self.updatePositions();
            
        function isOtherUserPhone(number) {
            return number.isDL() && !number.isOwnDL();
        }
    }
});

RC.UI.Rules.CallForwardingGrid.Collection.createCollectionFromRuleInfo = function(phones) {

    var groups = [];
    var disabledGroup = {};
    var disabledDelay = 10000;

    //RC.Console.dir(phones);
    phones = phones || [];
    phones.forEach(function(phone) {
        var number = new RC.UI.Rules.CallForwardingGrid.Number(phone);

        if (number.isDL() && !number.isOwnDL() && !number.isDisplayed() && !phone.isCommonPhone) {

            disabledGroup[number.getForwardPhoneId()] = number;

        } else {

            // skip common phones which are not belonging to this mailbox
            if (phone.isCommonPhone && !phone.ownedByThisMailbox)
                return;

            // If number is not enabled, it should not be presented in groups, so it should receive a monstrous delay
            var ringDelay = (number.isEnabled()) ? number.getRingDelay() : ++disabledDelay;

            if (!(ringDelay in groups)) groups[ringDelay] = new RC.UI.Rules.CallForwardingGrid.Group(ringDelay, number.getRingCycle());
            groups[ringDelay].addNumber(number);

        }

    });

    var collection = new RC.UI.Rules.CallForwardingGrid.Collection();
    var pos = 0;
    groups.each(function(group) {
        group.sortNumbers();
        group.setPosition(pos);
        collection.addGroup(group);
        pos++;
    });

    collection.updatePositions();

    return {
        collection: collection,
        disabledGroup: disabledGroup
    };

};

RC.UI.Rules.CallForwardingGrid.Group = RC.extend(RC.data.JsonStore, {
    _pos: 0,
    _ringCycle: 0,
    constructor: function(position, ringCycle) {

        RC.UI.Rules.CallForwardingGrid.Group.superclass.constructor.apply(this, [
            {
                data: [],
                autoLoad: true
            }
        ]);

        this.load();
        this.setPosition(position);
        this.setRingCycle(ringCycle);

    },
    _onNumberEnableCallback: function(number) {

        this.fireListener('enabled', this, number);

    },
    addNumber: function(number) {
        number.addListener('enabled', this._onNumberEnableCallback, this);
        // in order to fix performance issue UIA-35011
        this.records.push(number);
    },
    removeNumber: function(number) {

        var isLast = this.getCount() == 1;

        number.removeListener('enabled', this._onNumberEnableCallback);

        this.remove(number);

        if (isLast) {

            this.fireListener('destroy', this);
            //TODO Destroy redundant object

        }

    },
    moveUp: function() {
        this.fireListener('changePosition', this, -1);
    },
    moveDown: function() {
        this.fireListener('changePosition', this, 1);
    },
    getPosition: function() {
        return this._pos;
    },
    setPosition: function(pos) {
        this._pos = pos;
    },
    getRingCycle: function() {
        return this._ringCycle;
    },
    setRingCycle: function(ringCycle) {
        ringCycle = parseInt(ringCycle);
        this._ringCycle = ringCycle;
        this.each(function(number) {
            number.setRingCycle(ringCycle);
        });
    },
    isEnabled: function() {
        var isEnabled = false;
        this.each(function(number) {
            if (number.isEnabled()) isEnabled = true;
        });
        return isEnabled;
    },
    setEnabled: function(isEnabled, isSilent) {
        this.each(function(number) {
            number && number.setEnabled(isEnabled, isSilent);
        });
    },
    isDL: function() {
        var isDL = false;
        this.each(function(number) {
            if (number.isDL()) isDL = true;
        });
        return isDL;
    },
    sortNumbers: function() {
        this.data.sort(function(number1, number2) {
            var number1pos = 0;
            var number2pos = 0;

            if (number1.isEnabled()) number1pos += 1000;
            if (number2.isEnabled()) number2pos += 1000;

            if (number1.isDL()) number1pos += 100;
            if (number2.isDL()) number2pos += 100;

            if (number1.getName() < number2.getName()) number1pos += 10; else number2pos += 10;

            if (number1pos < number2pos) return 1;
            if (number1pos > number2pos) return -1;

            return 0;
        });
    },
    _attachListeners: function(collection) {
        this.addListener('destroy', collection._onGroupDestroyCallback, collection);
        this.addListener('enabled', collection._onGroupEnableCallback, collection);
        this.addListener('changePosition', collection._onGroupChangePositionCallback, collection);
    },
    _detachListeners: function(collection) {
        this.removeListener('destroy', collection._onGroupDestroyCallback);
        this.removeListener('enabled', collection._onGroupEnableCallback);
        this.removeListener('changePosition', collection._onGroupChangePositionCallback);
    }
});

RC.UI.Rules.CallForwardingGrid.Number = RC.extend(RC.utils.Component, {
    "_DNIS": null,
    "_addDigitsToCallerId": null,
    "_askPIN": false,
    "_dNIS": null,
    "_deviceExists": false,
    "_deviceType": 0,
    "_digitsForCallerId": "",
    "_enabled": false,
    "_forwardPhoneId": 0,
    "_forwarding": true,
    "_mailboxId": 0,
    "_firstName": '',
    "_lastName": '',
    "_pin": '',
    "_orderBy": 0,
    "_ownedByThisMailbox": false,
    "_phoneId": 0,
    "_phoneNumberInfo": {
        "alternate": false,
        "formattedNumber": "",
        "internationalCanonical": "",
        "name": "Work",
        "number": ""
    },
    "_playMailboxName": false,
    "_ringCycle": 4,
    "_ringDelay": 0,
    "_skipFindMeMenu": true,
    "_type": "Work",
    "_shortNameLength": "33",
    "_editable": false,
    OTHER_PHONE_TYPE: "Other",

    constructor: function(data) {

        var self = this;
        RC.UI.Rules.CallForwardingGrid.Number.superclass.constructor.apply(self, []);

        self._parseData(data);
        self._phoneNumberInfo.name = RC.utils.Text.decodeHtml(self._phoneNumberInfo.name);
    },
    getForwardPhoneId: function() {
        return this._forwardPhoneId;
    },
    isDL: function() {
        return this._type == 'PhoneLine';
    },
    isSoftPhone: function() {
        return this._deviceType == -1;
    },
    isOther: function() {
        return (this._type && this._type.substr(0, 5) == this.OTHER_PHONE_TYPE);
    },
    isEmptyOnlyName: function(){
        var isEmptyName = !this.getName(),
            isEmptyNumber = !this.getNumber();
        return isEmptyName  && !isEmptyNumber;
    },
    getDisabledPhone: function(order){
        return {
            ringDelay: this._ringDelay,
            ringCycle: this._ringCycle,
            addDigitsToCallerId: this._addDigitsToCallerId,
            askPIN: this._askPIN,
            dNIS: this._dNIS,
            deviceExists: this._deviceExists,
            deviceType: this._deviceType,
            digitsForCallerId: this._digitsForCallerId,
            enabled: this._enabled,
            forwardPhoneId: this._forwardPhoneId,
            forwarding: this._forwarding,
            mailboxId: this._mailboxId,
            orderBy: order,
            ownedByThisMailbox: this._ownedByThisMailbox,
            phoneId: this._phoneId,
            phoneNumberInfo: this._phoneNumberInfo,
            playMailboxName: this._playMailboxName,
            skipFindMeMenu: this._skipFindMeMenu,
            editable: this._editable,
            type: this._type,
            firstName: this._firstName,
            lastName: this._lastName
        };
    },

    findUnUsedOtherPhoneType: function(existedPhoneTypes) {
        for (var i = 1; i <= MAX_OTHER_PHONE_COUNT ; i++){
            var phoneType = this.OTHER_PHONE_TYPE + (i > 1 ? i : '');
            if (existedPhoneTypes.indexOf(phoneType) == -1) {
                return phoneType;
            }
        }
    },
    setOtherPhoneType: function(otherPhoneType) {
        this._type = otherPhoneType;
    },

    isOwnDL: function() {
        return this.isDL() && this._ownedByThisMailbox;
    },

    isDisplayed: function() {
        //(this._type == 'Work' || this._type == 'Home' || this._type == 'Mobile' || this._type == 'Other') ||
        return (!this.isDL() || this.isOwnDL() || this.isEnabled());
    },
    getType: function(){
        return this._type;
    },
    getName: function() {
        return this._phoneNumberInfo.name;
    },
    setOtherPhoneName: function(phoneName){
       if(this.isOther()){
           this._phoneNumberInfo.name = phoneName
       }
    },
    getExtName: function() {
        return this._firstName + ' ' + this._lastName;
    },
    getPin: function() {
        return this._pin ? RC.Lang.Common.EXT_DOT + ' ' + this._pin : '';
    },
    getRawPin: function() {
        return this._pin;
    },
    getNameShort: function() {
        var name = this.getName();
        if (name.length > this._shortNameLength) name = name.substr(0, this._shortNameLength - 1) + '...';
        return name;
    },

    getNumber: function() {
        return this._isValidNumber(this._phoneNumberInfo.formattedNumber)
            ? this._phoneNumberInfo.formattedNumber
            : this._phoneNumberInfo.internationalCanonical;
    },

    setNumber: function(number) {
        this._phoneNumberInfo.formattedNumber = number;
        this._phoneNumberInfo.internationalCanonical = number;
        this._phoneNumberInfo.number = number;
    },
    getRingCycle: function() {
        return this._ringCycle;
    },
    setRingCycle: function(ringCycle) {
        ringCycle = parseInt(ringCycle);
        this._ringCycle = ringCycle;
    },
    getRingDelay: function() {
        return this._ringDelay;
    },
    setRingDelay: function(ringDelay) {
        this._ringDelay = ringDelay;
    },
    isEnabled: function() {
        return !!this._enabled;
    },
    isEditable:function(){
        return this._editable;
    },
    enableEdited:function(){
        this._editable = true;
    },
    setEnabled: function(enabled, isSilent) {
        var isNumberStateChanged = (this._enabled != enabled);
        this._enabled = !!enabled;
        !isSilent && this.fireListener('enabled', this, this._enabled, isNumberStateChanged);
    },
    setForwarding: function(forwarding) {
        this._forwarding = forwarding;
    },
    isForwarding: function() {
        return !!this._forwarding;
    },
    isValid: function() {
        return this._isValidNumber(this._phoneNumberInfo.number);
    },
    _isValidNumber: function (phoneNumber) {
        var rules = RC.UI.Rules.CallForwardingGrid.phoneNumberValidateRules;
        var countryId = RC.Config.countryId;

        return rules[countryId] ? rules[countryId](phoneNumber) : rules.defaults(phoneNumber);

    }
});

RC.UI.Rules.CallForwardingGrid.phoneNumberValidateRules = {
    defaults: function(phoneNumber){
        var isValid = true;
        if (!RC.isEmpty(phoneNumber)) {
            //isValid = isPhoneNumber(onlyDigits(phoneNumber), 7);
            isValid = isPhoneNumber(phoneNumber, 6);
        }

        return isValid;

        function isPhoneNumber (expression, minLength) {
            var result = false;
            var MIN_PHONE_LENGTH = 6;
            minLength = minLength || MIN_PHONE_LENGTH;
            if (typeof expression !== 'undefined') {
                var isValidSymbols = /^(([+0]?\d+)?(\s*\(\s*\d+\s*\)\s*)?(\s*[0-9a-wyz][\s-]*)+)((x|ext\.?|\*)\s*[0-9a-wyz]{1,5}\s*)?$/i.test(expression);
                var digitsSymbolsOnly = String(expression).replace(/(x|ext\.?|\*).*$/i, "").match(/[0-9]/g);
                var isValidLength = digitsSymbolsOnly !== null &&
                    digitsSymbolsOnly.length >= minLength;
                result =  isValidLength && isValidSymbols;
            }
            return result;
        }

        function onlyDigits(expression) {
            return String(expression).replace(/[^0-9]/g,"");
        }
    },

    //Slovakia
    189: function (phoneNumber) {
        return this.defaults( phoneNumber.replace('/','') );
    }
};