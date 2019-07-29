
/* global App, newElement, newText */

if (App.Dev.std) {

    App.Writer = {

        textArea: null,
        buffChar: '',
        xText: "",

        initialize: function (element) {
            this.textArea = element;
        },

        catchKeyDown: function (event) {
            var writer = App.Writer;
            var key = event.key;

            if (!event.ctrlKey && key.length === 1 && key !== ' ') {
                var newSequence = true;
                if (writer.buffChar) {
                    var previousChar = writer.popBuffChar();
                    if (writer.tryAdd(previousChar + key)) {
                        newSequence = false;
                    } else {
                        writer.tryAdd(previousChar);
                    }
                }

                if (newSequence) {
                    if (App.Literator.keyHeadSet[key]) {
                        writer.buffChar = key;
                    } else {
                        writer.tryAdd(key);
                    }
                }

                event.preventDefault();
                event.stopPropagation();
            }

            if (event.key === ' ' || event.key === "Enter") {
                writer.tryAdd(writer.popBuffChar());
                event.stopPropagation();
            }

            writer.writeResult();
        },

        catchKeyUp: function (event) {
            var writer = App.Writer;
            if (writer.buffChar === event.key) {
                writer.tryAdd(writer.popBuffChar());
                writer.writeResult();
            }
        },

        popBuffChar: function () {
            var takenBuffChar = this.buffChar;
            this.buffChar = '';
            return takenBuffChar;
        },

        tryAdd: function (input) {
            var addition = App.Literator.tryTrans(input);
            this.xText += addition;
            return addition;
        },

        writeResult: function () {
            var result = this.xText;
            if (result) {
                this.write(result);
                this.xText = "";
                setTimeout(App.DomSignaler.signalByXString, 0, result);
            }
        },

        write: function (insertionText) {
            this.textArea.setRangeText(
                    insertionText,
                    this.textArea.selectionStart,
                    this.textArea.selectionEnd,
                    "end"
            );
        }

    };

}

if (App.Dev.touch) {

    App.Writer = {

        textArea: {
            div: null,
            head: null,
            tail: null,

            sStart: 0,
            sEnd: 0,
            sRoot: null,
            unselectMethod: "",

            get value() {
                return this.div.innerText;
            },

            set value(newValue) {
                this.set(this.tail, "");
                this.set(this.head, "");
                this.updateSelection(0);
                this.insert(newValue);
            },

            insert: function (text) {
                var selectionStart = this.sStart;
                var selectionEnd = this.sEnd;

                if (selectionStart === selectionEnd) {
                    this.add(this.head, text);
                } else {
                    this.unselect();
                    var oldText = this.value;
                    this.set(this.tail, oldText.substr(selectionEnd));
                    this.set(this.head, oldText.substr(0, selectionStart) + text);
                }

                this.updateSelection(selectionStart + text.length);
                this.updateCaret();
            },

            add: function (element, text) {
                this.set(element, element.innerText + text);
            },

            set: function (element, text) {
                removeNode(element.firstChild);
                element.appendChild(newText(text));
            },

            focus: function () {
                this.div.focus();
            },

            select: function () {
                var selection = this.sRoot.getSelection();
                this.unselect(selection);
                var range = document.createRange();
                range.selectNode(this.div);
                selection.addRange(range);
                this.updateSelection(0, this.value.length);
                this.updateCaret();
            },

            unselect: function (selectionOpt) {
                (selectionOpt || this.sRoot.getSelection())[this.unselectMethod]();
            },

            updateSelection: function (selectionStart, selectionEnd) {
                this.sStart = selectionStart;
                this.sEnd = selectionEnd || selectionStart;
            },

            updateCaret: function () {
                if (this.sStart === this.sEnd) {
                    this.head.classList.add("caret");
                } else {
                    this.head.classList.remove("caret");
                }
            },

            catchTouch: function () {
                var textArea = App.Writer.textArea;
                var selection = textArea.sRoot.getSelection();
                var oldHeadText = textArea.head.innerText;
                var oldHeadLength = oldHeadText.length;

                if (selection.isCollapsed) {
                    var oldTailText = textArea.tail.innerText;
                    var offset = selection.anchorOffset;

                    if (textArea.isHead(selection.anchorNode)) {
                        textArea.set(textArea.head, oldHeadText.substr(0, offset));
                        textArea.set(textArea.tail, oldHeadText.substr(offset) + oldTailText);
                        textArea.updateSelection(offset);
                    } else {
                        textArea.set(textArea.tail, oldTailText.substr(offset));
                        textArea.add(textArea.head, oldTailText.substr(0, offset));
                        textArea.updateSelection(oldHeadLength + offset);
                    }

                } else {
                    var anchorPoint = selection.anchorOffset
                            + (textArea.isHead(selection.anchorNode) ? 0 : oldHeadLength);
                    var focusPoint = selection.focusOffset
                            + (textArea.isHead(selection.focusNode) ? 0 : oldHeadLength);
                    textArea.updateSelection(Math.min(anchorPoint, focusPoint), Math.max(anchorPoint, focusPoint));
                }

                textArea.updateCaret();
            },

            isHead: function (node) {
                return node && (node === this.head || node.parentElement === this.head);
            }
        },

        initialize: function (element) {
            var textArea = this.textArea;
            textArea.sRoot = window.getSelection ? window : document;
            textArea.unselectMethod = textArea.sRoot.getSelection().empty ? "empty" : "removeAllRanges";

            textArea.div = element;
            textArea.head = newElement("span", ["caret"], null, [newText("")]);
            textArea.tail = newElement("span", null, null, [newText("")]);
            element.appendChild(textArea.head);
            element.appendChild(textArea.tail);
        },

        write: function (xChar) {
            switch (xChar) {
                case "@n":
                    xChar = "\n";
                    break;
                case "@b":
                    var textArea = this.textArea;
                    var selectionStart = textArea.sStart;
                    if (selectionStart === textArea.sEnd && selectionStart > 0) {
                        var value = textArea.value;
                        var map = App.DomMarks.activeKBoard.backMap;
                        var back = 1;
                        for (var bytes = 1; bytes <= 4 && selectionStart - bytes >= 0; bytes++) {
                            if (value.substring(selectionStart - bytes, selectionStart) in map) {
                                back = bytes;
                                break;
                            }
                        }
                        textArea.sStart -= back;
                    }
                    xChar = '';
            }
            this.textArea.insert(xChar);
        }

    };

}

App.Writer.clickWrite = function (xChar) {
    this.textArea.focus();
    this.write(xChar);
    setTimeout(App.DomSignaler.signalByXString, 0, xChar);
};