<template>
    <div class="overlay">
        <form class="modal" v-on:submit.prevent="accept">
            <p class="message">{{ message }}</p>
            <div class="controls">
                <button
                    class="cancelBtn nBtn"
                    type="button"
                    v-if="!acceptOnly"
                    v-on:click.prevent="cancel"
                >{{ cancelText }}</button>
                <button
                    ref="acceptBtn"
                    v-bind:class="['acceptBtn nBtn', {fullSize: acceptOnly}]"
                    type="submit"
                    v-on:click.prevent="accept"
                >{{ acceptText }}</button>
            </div>
        </form>
    </div>
</template>

<script>

import Vue from 'vue';
import translate from '../library/translate';
import {assign, isPlainObject} from '../library/toolkit';
import app from '../app';

const Component = Vue.extend({

    props: {
        message: {type: String, default: () => translate('prompt.defaultMessage')},
        acceptText: {type: String, default: () => translate('prompt.acceptText')},
        cancelText: {type: String, default: () => translate('prompt.cancelText')},
        acceptOnly: {type: Boolean, default: false},
        onAccept: {type: Function, default: () => {}},
        onCancel: {type: Function, default: () => {}},
        parent: {type: Object}
    },

    mounted() {

        this.$refs.acceptBtn.focus();

    },

    methods: {

        accept() {

            this.onAccept();
            this.remove();

        },

        cancel() {

            this.onCancel();
            this.remove();

        },

        open() {

            this.$mount();
            document.body.appendChild(this.$el);
            return this;

        },

        remove() {

            document.body.removeChild(this.$el);
            this.$destroy();
            return this;

        }

    }

});

export default Component;

export function confirm(message, onAccept, config) {

    let params, component;

    if (isPlainObject(message)) {
        params = message;
    } else if (typeof message === 'function') {
        params = {onAccept: message};
    } else {
        params = assign({}, config, {message, onAccept});
    }

    component = new Component({
        propsData: params,
        parent: params.parent || app.rootView
    });

    return component.open();

}

</script>

<style lang="scss" scoped>

    .overlay {

        position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 1000;
        background-color: rgba(#000, 0.5); animation: fadeIn 0.5s;

    }

    .modal {

        position: absolute; width: 30em; left: 50%; top: 40%; margin: -4em 0 0 -15em;
        background-color: #fff; text-align: center;
        box-shadow: 0 0.2em 0.5em rgba(#000, 0.2); border-radius: 0.3em;
        animation: slideDownFadeIn 0.5s;

    }

    .message {

        font-size: 1.6em; padding: em(30,16) em(30,16) em(20,16); margin: 0;
        text-align: center; color: #4B4B4B;

    }

    .controls {

        position: relative; overflow: hidden;
        border-top: 1px solid #e9e9e9;

    }

    .cancelBtn, .acceptBtn {

        font-size: 1.4em; font-weight: bold; float: left;
        width: 50%; padding: em(15,14) 0; box-sizing: border-box;
        color: #a6a6a6; text-decoration: none; text-transform: uppercase;  text-align: center;

        &:hover, &:focus { color: darken(#a6a6a6,10%); }

    }

    .acceptBtn {

        color: #5D5B5B; border-left: 1px solid #e9e9e9; margin-left: -1px;

        &:hover, &:focus { color: darken(#5D5B5B,10%); }

        &.fullSize {

            float: none; width: 100%; border: 0; display: block;

        }

    }

</style>
