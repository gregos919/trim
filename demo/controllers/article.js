export default {

    resourceName: 'article',
    resourceCaption: 'title',

    setupList({list}) {

        this.addCreateControl('Create new article');

        // --------------------------------------------------------------
        // Filters
        // --------------------------------------------------------------
        list.addFilter([
            ['TextFormElement', {
                name: 'title',
                label: 'Title'
            }],
            ['DateFormElement', {
                name: 'publishDate',
                label: 'Date'
            }],
            ['SelectFormElement', {
                name: 'published',
                label: 'Status',
                selectOptions: [
                    {caption: 'All pages', value: ''},
                    {caption: 'Published', value: 'true'},
                    {caption: 'Unpublished', value: 'false'}
                ]
            }],
            ['SelectFormElement', {
                name: 'author',
                label: 'Author',
                selectOptions: {
                    resource: 'user',
                    mapCaptionTo: 'email',
                    prepend: [{caption: 'All', value: ''}]
                }
            }],
            ['MultipleSelectFormElement', {
                name: 'tags',
                label: 'Tags',
                selectOptions: {
                    resource: 'tag',
                    mapCaptionTo: 'title'
                }
            }]
        ]);

        // --------------------------------------------------------------
        // Mass actions
        // --------------------------------------------------------------
        list.addMassAction([{
            caption: 'Publish',
            updateAttributes: {published: true}
        }, {
            caption: 'Unpublish',
            updateAttributes: {published: false}
        }]);

        // --------------------------------------------------------------
        // List elements
        // --------------------------------------------------------------
        list.addItem([
            ['TextListItem', {
                caption: 'ID',
                mapTo: 'id',
                addIf: this.screenIsLarge
            }],
            ['LinkListItem', {
                caption: 'Title',
                mapTo: 'title',
                action: 'editItem',
                limitWords: 7
            }],
            ['TextListItem', {
                caption: 'Intro text',
                mapTo: 'intro',
                limitWords: 20,
                attributes: {style: {marginBottom: '5px'}},
                addIf: this.screenIsSmall
            }],
            ['DateListItem', {
                caption: 'Date',
                mapTo: 'publishDate'
            }],
            ['TextListItem', {
                caption: 'Author',
                mapTo: 'author.email'
            }],
            ['TextListItem', {
                caption: 'Tags',
                mapTo: 'tags.title',
                ifEmpty: '<span style="opacity: 0.5">No tags</span>'
            }],
            ['BlipListItem', {
                caption: 'Published',
                mapTo: 'published'
            }],
            ['ContextMenuListItem', {
                caption: 'Actions',
                items: [
                    {caption: 'Edit', action: 'editItem'},
                    {caption: 'Delete', action: 'deleteItem', confirm: true}
                ]
            }]
        ]);

    },

    setupEdit({edit}) {

        this.addToIndexControl().addSaveControl();

        edit.observe('formData.title', value => {
            edit.toggleField('leadTitle', value !== 'hideLeadTitle');
        }).listen('definitionsResolved', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('definitionsResolved');
            }
        }).configureLayout({
            'mainTab.caption': 'Content and settings',
            'seoTab.caption': 'SEO and meta data'
        });

        edit.addField([
            ['TextFormElement', {
                name: 'leadTitle',
                attributes: {
                    input: {
                        placeholder: 'Lead title',
                        title: 'Lead title',
                        style: {border: 0, textTransform: 'uppercase', color: '#999999', letterSpacing: '0.02em'}
                    },
                    wrapper: {style: {margin: this.screenIsLarge ? '1.5em 0 0 0' : '0 0 0 0'}}
                },
                layoutReference: 'mainTab.mainRegion'
            }],
            ['TextareaFormElement', {
                name: 'title',
                attributes: {
                    input: {
                        class: 'inputType2 size2 fontBold',
                        placeholder: 'Article title',
                        title: 'Title',
                        style: {border: '0'}
                    },
                    wrapper: {style: {margin: '0 0 -0.5em 0'}}
                },
                layoutReference: 'mainTab.mainRegion'
            }],
            ['TextareaFormElement', {
                name: 'intro',
                attributes: {
                    input: {
                        placeholder: 'Enter article intro text',
                        title: 'Intro',
                        style: {border: 0, lineHeight: '1.5', fontSize: this.screenIsLarge ? '2em' : undefined}
                    }
                },
                layoutReference: 'mainTab.mainRegion'
            }],
            ['MediaFormElement', {
                label: 'Main media',
                name: 'media',
                relation: {resourceName: 'media'},
                layoutReference: 'mainTab.mainRegion'
            }],
            ['HtmlFormElement', {
                label: 'Content',
                name: 'contentRaw',
                layoutReference: 'mainTab.mainRegion'
            }],
            ['ExternalAdminFormElement', {
                name: 'author',
                label: 'Author',
                mapCaptionTo: 'email',
                relation: {type: 'hasOne', resourceName: 'user'},
                layoutReference: 'mainTab.sideRegion.group1'
            }],
            ['DateFormElement', {
                name: 'publishDate',
                label: 'Date',
                layoutReference: 'mainTab.sideRegion.group2'
            }],
            ['StateSelectFormElement', {
                label: 'Proof read',
                name: 'proofreadStatus',
                updateEntityOnChange: true,
                readOnly: true,
                states: [{
                    value: '0',
                    name: 'notProofread',
                    caption: 'Not proofread',
                    actionCaption: 'Proofread not needed',
                    transitions: ['proofreadNeeded']
                }, {
                    value: '1',
                    name: 'proofreadNeeded',
                    caption: 'Proofread needed',
                    transitions: ['proofreadDone', 'notProofread']
                }, {
                    value: '2',
                    name: 'proofreadDone',
                    caption: 'Proofread done',
                    transitions: null
                }],
                addOnCreate: false,
                layoutReference: 'mainTab.sideRegion.group4'
            }],
            ['StateSelectFormElement', {
                label: 'Graphics status',
                name: 'graphicsStatus',
                states: [{
                    value: '0',
                    name: 'notApproved',
                    caption: 'Not approved',
                    actionCaption: 'Approve not needed',
                    transitions: ['approveNeeded']
                }, {
                    value: '1',
                    name: 'approveNeeded',
                    caption: 'Approve Needed',
                    transitions: ['approved', 'notApproved']
                }, {
                    value: '2',
                    name: 'approved',
                    caption: 'Approved',
                    transitions: null
                }],
                layoutReference: 'mainTab.sideRegion.group4'
            }],
            ['CheckboxFormElement', {
                label: 'Article is published',
                name: 'published',
                layoutReference: 'mainTab.sideRegion.group3'
            }],
            ['TextFormElement', {
                name: 'metaTitle',
                label: 'Article meta title',
                layoutReference: 'seoTab'
            }],
            ['TextareaFormElement', {
                name: 'metaDiscription',
                label: 'Article meta description',
                layoutReference: 'seoTab'
            }],
            ['MapFormElement', {
                label: 'Location on map',
                name: 'location',
                layoutReference: 'seoTab'
            }]
        ]);

    }

};
