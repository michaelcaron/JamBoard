(function ($) {
//    $.fn.sfBoard = function (options) {
//        var $this = $(this);
//        var settings = $.extend({
//            'width':'100px',
//            'height':'100px',
//            'background-color':'#ffffff'
//        }, options);
//
//    };

    var boardTabHolder = "<div id='jamBoardTabs'><ul>" +
        "<li><a href='#tabs-1'>My Boards</a></li>" +
        "<li><a href='#tabs-2'>Pins</a></li>" +
        "<li><a href='#tabs-3'>Top Pins</a></li>" +
        "</ul>" +
        "<div id='tabs-1'>" +
        "<ul id='myBoards'></ul>" +
        "<div id='boardView' class='ui-state-default'><span id='myBoardsLink' class='ui-icon ui-icon-arrowreturnthick-1-w'>Back to My Boards</span>" +
        "<h2 class='board-title'></h2>" +
        "<h3 class='pin-count'><span class='count'>?</span> pins</h3><div id='boardPinContainer'" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div id='tabs-2'><div id='myPins'></div></div>" +
        "<div id='tabs-3'><div id='topPins'></div></div></div>";


    var pinnedItemStructure = "<div class='PinnedItem'>" +
           "<a href='' class='PinImage ImgLink'>" +
            "<div class='pin-title'></div>"+
            "</a>" +
        "</div>";

    var boardTemplate = "<li id='defaultBoard' class='ui-state-default board'>" +
        "<span class='ui-icon ui-icon-trash delete-board'>Delete Board</span>" +
        "<h2 class='board-title'>Home Board</h2>" +
        "<h3 class='pin-count'><span class='count'>?</span> pins</h3>" +
        "<div class='pins'>" +
            "<span class='board-cover empty thumb0'>&nbsp;</span>" +
            "<span class='thumbs'>" +
                "<span class='thumb1 empty'></span>" +
                "<span class='thumb2 empty'></span>" +
                "<span class='thumb3 empty'></span>" +
                "<span class='thumb4 empty'></span>" +
            "</span>" +
        "</div>" +
        "</li>";

    var dialogNewBoard = "<div id='dialog' title='Create a board'><form>" +
        "<fieldset class='ui-helper-reset'>" +
        "<label for='board_title'>Board Name</label>" +
        "<input type='text' name='board_title' id='board_title' value='' class='ui-widget-content ui-corner-all'/>" +
        "<label for='tab_content'>Description</label>" +
        "<textarea name='tab_content' id='tab_content' class='ui-widget-content ui-corner-all'></textarea>" +
        "</fieldset>" +
        "</form></div>";

    var dialogPinMe = "<div id='dialogPinMe' title='Pin to a board'><form>" +
        "<fieldset class='ui-helper-reset'>" +
        "<label for='board_title'>Board Name</label>" +
        "<select name='board_selector' id='board_selector' value='' class='ui-widget-content ui-corner-all'/>" +
        "</fieldset>" +
        "</form></div>"

    var btnNewBoard = "<div>" +
        "<button id='config-board-btn'>Add board</button>" +
//        "<ul id='configBoard-menu'><li id='add_board'>New Board</li></ul>" +
        "</div>";

//    var $board_content_input;
    var board_counter = 2;

    $(document).ready(function () {
        $('body').append(boardTabHolder);
        $('body').prepend(dialogNewBoard);
//        $('body').prepend(dialogPinMe);
        $('#myBoards').append(boardTemplate);
        $('#myBoards').append(btnNewBoard);

        var $dialog = $('#dialog').dialog({
            autoOpen:false,
            modal:true,
            buttons:{
                Add:function () {
                    addBoard();
                    $(this).dialog("close");
                },
                Cancel:function () {
                    $(this).dialog("close");
                }
            },
            open:function () {
                var $board_title_input = $("#board_title");
                if ($board_title_input) {
                    var mgr = jam.board.BoardManager.getInstance();
                    $board_title_input.val(jam.board.BoardManager.getLastBoardName());
                    $board_title_input.focus();
                }
            },
            close:function () {
                $form[ 0 ].reset();
            }
        });

        var $form = $('form', $dialog).submit(function () {
            addBoard();
            $dialog.dialog("close");
            return false;
        });

        $('#config-board-btn').click(function () {
            //show menu
//            $('#configBoard-menu').show('slow');
            $dialog.dialog("open");
        });

        $('#jamBoardTabs').tabs();

        $('#myBoards').sortable({
            placeholder:"ui-state-highlight"
        });

        $('#myBoards').disableSelection();

        function addBoard(board) {
            var $board_title_input = $("#board_title");
            var board_title;
//            var $board_content_input = $("#board_content");
            var $boardTemplate = $('#defaultBoard').clone();
            if(!board) {
                board_title = $board_title_input.val() || 'New Board ' + board_counter;
                board = new jam.board.Board(board_title);
                var mgr = jam.board.BoardManager.getInstance();
                mgr.addBoard(board);
                mgr.save();
                jam.board.BoardManager.setLastBoardName(board_title);
            } else {
                board_title = board.name;
            }
            $boardTemplate.attr('id', board.name);
            $boardTemplate.find('.delete-board').live("click", function (event) {
//                event.preventDefault();
                $(this).parent().remove();
                var mgr = jam.board.BoardManager.getInstance();
                mgr.removeBoard(board.name);
                jam.board.BoardManager.saveInstance(mgr);
                return false;
            });
            $boardTemplate.appendTo('#myBoards');
            $boardTemplate.find('.board-title').text(board_title);
            $boardTemplate.find('.count').text(board.items.length);
            for (var i = 0; i < Math.min(board.items.length, 5); i++) {
                var item = board.items[i];
                switch (i) {
                    case 0:
                        if (!item.hasGenericThumbnail()) {
                            $boardTemplate.find(".thumb" + i).append("<img src='' alt='' class='thumbImage thumbImg' />");
                        } else {
                            $boardTemplate.find(".thumb" + i).append("<iframe src='' class='thumbImage thumbIFrame' style='width:230px; height:59px' />");
                        }
                        $boardTemplate.find(".thumb" + i + " .thumbImage").attr('src', item.getThumbnailURI('230'));
                        break;
                    default:
                        if (!item.hasGenericThumbnail()) {
                            $boardTemplate.find(".thumb" + i).append("<img src='' alt='' class='thumbImage thumbImg' />");
                        } else {
                            $boardTemplate.find(".thumb" + i).append("<iframe src='' class='thumbImage thumbIFrame' style='width:55px; height:55px' />");
                        }
                        $boardTemplate.find(".thumb" + i + " .thumbImage").attr('src', item.getThumbnailURI('55'));
                        break;

                }
            }
            board_counter++;
        }

        function addItem(item) {
            var $item = $(pinnedItemStructure);
            $item.find(".ImgLink").attr('href', item.linkURI);
            if (!item.hasGenericThumbnail()) {
                $item.find(".ImgLink").prepend("<img src='' alt='' class='Pin PinImageImg' />");
            } else {
                $item.find(".ImgLink").prepend("<iframe src='' class='Pin PinIFrame' />");
            }
            $item.find(".Pin").attr('src', item.getThumbnailURI('192'));
            $item.find(".pin-title").text(item.title);
            $('#boardPinContainer').append($item);

//            $('#boardView .pin-holder')
        }

        var mgr = jam.board.BoardManager.getInstance();

        $('#bookmarks .nav_name').text("My Boards");
        $('#bookmarks .count').text(mgr.boards.length);
        for (var i = 0; i < mgr.boards.length; i++) {
            addBoard(mgr.boards[i]);
        }

        $('#bookmarks').mouseover(function () {
            var offset = $('#bookmarks').offset();
            $('#jamBoardTabs').css({ top: offset.top - 81, left: offset.left + 187});
            $('#jamBoardTabs').show('slow');
        });

        $(".board").live('click', function () {
            var title = $(this).find('.board-title').text();
            var mgr = jam.board.BoardManager.getInstance();
            var board = mgr.getBoard(title);
            var $boardView = $("#boardView");
            $boardView.find('.board-title').text(title);
            $boardView.find('.count').text(board.items.length);
            $("#boardPinContainer").empty();
            for (var index = 0; index < board.items.length; index++) {
                addItem(board.items[index]);
            }
            $("#myBoards").hide('slow');
            $boardView.show('slow');

        });


        $("#config-board-btn").button({
            icons: {
                primary: "ui-icon-plusthick"
            },
            text: false
        });

        $("#myBoardsLink").button({
            text: false
        }).click(function () {
                $("#myBoards").show('slow');
                $("#boardView").hide('slow');
            });

        $('#jamBoardTabs').click(function(event) {
            //$(this).hide();
//            event.preventDefault();
//            return false;

        });
        $("body").keypress(function (event) {
//            event.preventDefault();
            if(event.keyCode == 27)     {
                $("#jamBoardTabs").hide();
            }
//            return false;
        });

    });
})(window.jQuery);