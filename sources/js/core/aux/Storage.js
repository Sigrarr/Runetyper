
/* global App */

App.Storage = {

    topicBlackList: ['_', "view", "command"],

    passesTopic: function (topicName) {
        return this.topicBlackList.indexOf(topicName) < 0;
    },

    get: function (key) {
        return localStorage.getItem(key);
    },

    set: function (key, value) {
        localStorage.setItem(key, value);
    },

    clear: function (key) {
        localStorage.removeItem(key);
    },

    _Handler: function (record) {
        if (record.upId === record.topic.upId && this.passesTopic(record.topic.name)) {
            this.set(record.topic.name, record.value);
        }
    }

};
