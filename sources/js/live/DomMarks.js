/* global App, setProperties */

App.DomMarks = {

    kBoards: [],

    get activeKBoard() {
        return this.kBoards[App.Storage.get("alphabet")];
    },

    get textArea() {
        return App.Writer.textArea.div || App.Writer.textArea;
    },

    workspace: null,
    kBoardSpace: null,
    editorSpace: null,
    xCharsSelectLi: null,
    captionsCycleLi: null,
    saveTextButton: null,
    goTopButton: null,

    init: function () {
        setProperties(this, {
            workspace: getById("workspace"),
            kBoardSpace: getById("kboard-space"),
            editorSpace: getById("editor-space"),
            xCharsSelectLi: getById("selector-xchars"),
            captionsCycleLi: getById("cycle-captions"),
            saveTextButton: getById("save-text-button"),
            goTopButton: getById("go-top")
        });
    }

};
