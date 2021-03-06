<template>
    <nav v-bind:class="['pagination', {withLimitOptions: showLimitOptions}]">

        <div v-if="showLimitOptions" class="limitOptions">
            <p>{{ translations.resultsCaption }}:</p>
            <button
                v-for="limitOption in limitOptions"
                v-bind:key="limitOption"
                type="button"
                v-bind:class="['nBtn limitOption', {selected: limit === limitOption}]"
                v-on:click.prevent="selectLimit(limitOption)"
            >{{ limitOption }}</button>
        </div>

        <p class="totalItems">
            <span class="caption">{{ translations.totalItemsCaption }}</span>
            <span class="count">{{ totalItems }}</span>
        </p>

        <ul v-if="totalPages > 1" class="pages">

            <li class="prev">
                <a
                    v-if="currentPage !== 1"
                    class="iconArrowLeft icon page icr"
                    v-bind:href="getUrlForPage(currentPage - 1)"
                    v-on:click.prevent="selectPage(currentPage - 1)"
                >
                    {{ currentPage - 1 }}
                </a>
                <button v-else class="iconArrowLeft disabled icon icr"></button>
            </li>

            <template v-if="currentPage - 2 > 1">
                <li>
                    <a
                        class="page"
                        v-bind:href="getUrlForPage(1)"
                        v-on:click.prevent="selectPage(1)"
                    >1</a>
                </li>
                <li v-if="currentPage > middlePages.length - 1">
                    <span class="separator">...</span>
                </li>
            </template>

            <li v-for="page in middlePages" v-bind:key="page">
                <a
                    v-bind:class="['page', {selected: page == currentPage}]"
                    v-bind:href="getUrlForPage(page)"
                    v-on:click.prevent="selectPage(page)"
                >{{ page }}</a>
            </li>

            <template v-if="middlePages[middlePages.length - 1] + 1 <= totalPages">
                <li v-if="currentPage < totalPages - middlePages.length + 2">
                    <span class="separator">...</span>
                </li>
                <li>
                    <a
                        v-bind:class="['page', {selected: totalPages === currentPage}]"
                        v-bind:href="getUrlForPage(totalPages)"
                        v-on:click.prevent="selectPage(totalPages)"
                    >{{ totalPages }}</a>
                </li>
            </template>

            <li class="next">
                <a
                    v-if="currentPage < totalPages"
                    class="iconArrowRight page icon icr"
                    v-bind:href="getUrlForPage(currentPage + 1)"
                    v-on:click.prevent="selectPage(currentPage + 1)"
                >{{ currentPage + 1 }}
                </a>
                <button v-else class="iconArrowRight disabled icon icr"></button>
            </li>

        </ul>

    </nav>
</template>

<script>

import userPreferences from '../library/userPreferences';
import translate from '../library/translate';
import {range} from '../library/toolkit';
import bootData from '../library/bootData';

const Pagination = {

    props: {
        currentPage: {type: Number, default: 1},
        getUrlForPage: {type: Function, required: true},
        totalItems: {type: Number, required: true},
        limit: {type: Number, required: true},
        limitOptions: {type: Array, default: () => [10, 15, 30, 60]},
        showLimitOptions: {type: Boolean, default: false}
    },

    data: () => ({
        translations: {
            resultsCaption: translate('pagination.resultsCaption'),
            totalItemsCaption: translate('pagination.totalItemsCaption')
        }
    }),

    computed: {

        totalPages() {

            return Math.ceil(this.totalItems / this.limit);

        },

        middlePages() {

            let start = this.currentPage - 2;
            let end = this.currentPage + 2;

            if (start <= 0) {
                end -= (start - 1);
                start = 1;
            }

            if (end > this.totalPages) {
                end = this.totalPages;
            }

            return range(start, end);

        }

    },

    methods: {

        selectLimit(limit) {

            this.$emit('limitRequest', limit);

        },

        selectPage(page) {

            this.$emit('pageRequest', page);

        }

    },

    setLimit(resourceName, limit) {

        userPreferences.set('pagination.' + resourceName + '.itemsPerPage', limit);
        return this;

    },

    getLimit(resourceName = 'default') {

        return userPreferences.get(
            'pagination.' + resourceName + '.itemsPerPage',
            bootData('itemsPerPage', 15)
        );

    },

    getOffsetAndLimit(resourceName, page = 1) {

        page = parseInt(page, 10);
        page = page <= 0 ? 1 : page;

        let limit = Pagination.getLimit(resourceName);
        let offset = (page - 1) * limit;

        return {offset, limit};

    }

};

export default Pagination;

</script>

<style lang="scss" scoped>

    .pagination {

        .pages {

            display: block; position: relative; padding: 0 3.6em; overflow: hidden;

            > li {
                display: inline-block;
            }

        }

        .limitOptions {

            > p, > .limitOption {

                font-size: em(13,10); display: inline-block; line-height: (30/13); vertical-align: middle;
                color: $colorGrayDark2; letter-spacing: 0.03em;

            }

            > p {

                margin-right: em(3,13);

            }

            > .limitOption {

                padding: 0 em(10,13);

                &.selected {

                    @include fontSansCondensedBold;
                    background: rgba(#000, 0.05); border-radius: em(4,13);

                }

            }

        }

        .next, .prev {

            position: absolute; top: 50%; margin-top: -2em;

        }

        .next {

            right: 0;

        }

        .prev {

            left: 0;

        }

        .page {

            @include normalizeButton;

            font-size: 1.4em; display:inline-block; padding: em(8,14) em(10,14); margin: 0 -1px;
            color: $colorGrayDark2;

            @include hover {

                color: $colorMain1;

            }

            &.selected {

                color: $colorMain1;

            }

        }

        .icon {

            @include normalizeButton;

            font-size: 1.4em; width: em(40,14); height: em(40,14); padding: 0;

            &:before { font-size: 0.9em; }

            &.disabled {

                cursor: default; opacity: 0.2;

            }

        }

        .separator {

            font-size: 1.3em;

        }

        .totalItems {

            float: right; font-size: 1.4em; padding: em(8,14) em(15,14);
            color: $colorGrayDark2;

            > .caption {

                opacity: 0.5;
                &:after { content: ": "; }

            }

            > .count {}

        }

        @include mediaMaxWidth($breakpointMedium) {

            .totalItems { display: none; }

            .icon:before { font-size: 1.2em; }

            .limitOptions {

                padding: 0 1.5em 1em; box-sizing: border-box;
                border-bottom: 1px solid $colorGrayLight1;

            }

            .pages {

                display: block; padding: 1em 0.3em; text-align: center;

            }

        }

        @include mediaMinWidth($breakpointMedium) {

            .totalItems { display: block; }

            &.withLimitOptions {

                @include clearfix;

                > .pages {

                    float: right;

                }

                > .limitOptions {

                    float: left;

                }

            }

        }

    }

</style>
