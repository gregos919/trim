<template>
    <element-wrapper v-bind="elementWrapperProps">
        <button type="button" v-html="buttonCaption"></button>
        <select
            v-if="optionElements"
            v-bind="inputAttributes"
            v-bind:value="stringValue"
            v-on:change="processInputEvent"
        >
            <option
                v-for="(option, index) in optionElements"
                v-bind:key="index"
                v-bind:value="option.value"
                v-bind:disabled="option.disabled"
            >{{ option.caption }}</option>
        </select>
    </element-wrapper>
</template>

<script>
import base from './base';
import {assign, find, ensureArray} from '../library/toolkit';
import translate from '../library/translate';
import {Collection} from '../library/resource';
import ElementWrapper from './elementWrapper';

export default {

    elementType: 'select',

    components: {ElementWrapper},

    mixins: [base],

    props: {
        value: {type: [String, Boolean, Number], default: ''},
        selectOptions: {type: [Array, Object], required: true},
        buttonTextPrefix: {type: String, default: ''}
    },

    data: () => ({
        optionElements: undefined
    }),

    getInitialValue(options = {selectOptions: {}}) {

        if (typeof options.value !== 'undefined') {
            return options.value;
        } else if (Array.isArray(options.selectOptions)) {
            return options.selectOptions[0].value;
        } else if (options.selectOptions && options.selectOptions.prepend) {
            return ensureArray(options.selectOptions.prepend)[0].value;
        } else {
            return '';
        }

    },

    computed: {

        stringValue() {

            return this.value.toString();

        },

        selectedOption() {

            return this.getSelectedOption();

        },

        buttonCaption() {

            return this.selectedOption
                ? this.buttonTextPrefix + this.selectedOption.caption
                : translate('formElements.select.loadingCaption')
            ;

        }

    },

    created() {

        this.getOptionElements(this.selectOptions).then(optionElements => {

            this.optionElements = optionElements;

            if (!this.getSelectedOption()) {
                this.$emit('input', this.optionElements[0].value);
            }

        });

    },

    methods: {

        processInputEvent(e) {

            const stringValue = e.target.value;
            const optionValue = find(this.optionElements, option => option.stringValue === stringValue).value;

            this.$emit('input', optionValue);

        },

        mapModel(mapper, model) {

            return typeof mapper === 'function'
                ? mapper(model)
                : model.get(mapper)
            ;

        },

        getSelectedOption() {

            const currentValue = this.value;

            return this.optionElements
                ? find(this.optionElements, o => o.value === currentValue)
                : undefined
            ;

        },

        getOptionElements(selectOptions) {

            if (Array.isArray(selectOptions)) {

                return Promise.resolve(selectOptions.map(item => assign({
                    stringValue: item.value.toString()
                }, item)));

            } else {

                selectOptions = assign({
                    mapCaptionTo: 'name',
                    mapValueTo: 'id'
                }, selectOptions);

                const query = selectOptions.url
                    ? {url: selectOptions.url}
                    : {type: selectOptions.resource, query: selectOptions.query}
                ;

                return Collection.getFromApi(query).then(modelCollection => {

                    return modelCollection.map(model => ({
                        caption: this.mapModel(selectOptions.mapCaptionTo, model),
                        value: this.mapModel(selectOptions.mapValueTo, model)
                    }));

                }).then(modelOptions => {

                    return selectOptions.prepend
                        ? ensureArray(selectOptions.prepend).concat(modelOptions)
                        : modelOptions
                    ;

                }).then(options => {

                    return options.map(option => assign({
                        stringValue: option.value.toString()
                    }, option));

                });

            }

        }

    }

};
</script>

<style lang="scss">

    .selectType1 {

        display: inline-block; position: relative;
        background-color: #fff; border: 1px solid $colorGrayLight2; border-radius: em(4,14);

        &:before {

            @include iconFont($iconFontName);
            @include iconElementGraphic(30, 30);

            content: map-get($icons, 'chevronDown'); left: auto; right: 0; font-size: 1.2em;
            color: $colorMain1;

        }

        > button {

            @include normalizeButton;

            font-size: 1.6em; padding: em(8,16) em(30,16) em(8,16) em(10,16);
            color: $colorGrayDark1;

            @include mediaMinWidth($breakpointMedium) {
                font-size: 1.4em; padding: em(8,14) em(30,14) em(8,14) em(10,14);
            }

        }

        > select {

            position: absolute; left: 0; top: 0; width: 100%; height: 100%;
            cursor: pointer; opacity: 0; font-size: 1.6em;

        }

        &.fullWidth {

            display: block;

        }

        &.disabled {

            opacity: 0.5;

        }

    }

</style>
