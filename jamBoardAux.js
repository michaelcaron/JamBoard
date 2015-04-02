// Make sure there is a "jam" namespace...
var jam;
if (!jam) {
	jam = {};
}

(function ($) {

	// If no jQuery, then leave
	if (!$) {
		return;
	}

	// Make sure there is a "jam.board" namespace
	if (!jam.board) {
		jam.board = {};
	}

	/**
	 * Returns the REST API parameter value for the parameter name specified in
	 * the given URI
	 * 
	 * @param {string} uri the URI
	 * @param {string} name the name
	 * @return {?string} the REST API parameter value for the parameter name
	 *         specified in the given URI
	 */
	function getRestApiParam (uri, name) {
		/** @type {?string} */
		var result = null;
		/** @type {Array.<string>} */
		var elements;
		/** @type {number} */
		var index;

		if (uri) {
			elements = uri.split('/');
			for (index = 0; index < elements.length; index++) {
				if (elements[index] == name) {
					index++;
					if (index < elements.length) {
						result = elements[index];
					}
					break;
				}
			}
		}

		return result;
	}

	/**
	 * Item class
	 * 
	 * @param {string} type the type
	 * @param {string} id the ID
	 * @param {string} title the title
	 * @param {string} linkURI the link URI
	 * @param {string} thumbnailURI the thumbnail URI
	 * @constructor
	 */
	jam.board.Item = function (type, id, title, linkURI, thumbnailURI) {
		/** @type {string} */
		this.type = type;

		/** @type {string} */
		this.id = id;

		/** @type {string} */
		this.title = title;

		/** @type {string} */
		this.linkURI = linkURI;

		/** @type {string} */
		this.thumbnailURI = thumbnailURI;
	};

	/**
	 * Constant for document type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_DOCUMENT = 'document';

	/**
	 * COnstant for image type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_IMAGE = 'image';

	/**
	 * COnstant for group type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_GROUP = 'group';

	/**
	 * COnstant for link type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_LINK = 'link';

	/**
	 * COnstant for linked document type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_LINKED_DOCUMENT = 'linkedDocument';

	/**
	 * COnstant for wiki type
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.Item.TYPE_WIKI = 'wiki';

	/**
	 * Returns the thumbnail URI
	 * 
	 * @param {string=} maxX the maximum X
	 * @param {string=} maxY the maximum Y
	 * @return {string} the thumbnail URI
	 */
	jam.board.Item.prototype.getThumbnailURI = function (maxX, maxY) {
		/** @type {string} */
		var uri = this.thumbnailURI;
		if ((!maxX) && (!this.hasGenericThumbnail())) {
			maxX = '192';
		}
		if (maxX) {
			uri += (((uri.indexOf('?') >= 0) ? '&' : '?') + 'max_x=' + maxX);
		}
		if (maxY) {
			uri += (((uri.indexOf('?') >= 0) ? '&' : '?') + 'max_y=' + maxY);
		}
		return uri;
	};

	/**
	 * Returns whether the instance has a generic thumbnail or not
	 * 
	 * @return {boolean} whether the instance has a generic thumbnail or not
	 */
	jam.board.Item.prototype.hasGenericThumbnail = function () {
		return (this.type != jam.board.Item.TYPE_DOCUMENT) && (this.type != jam.board.Item.TYPE_IMAGE) && (this.type != jam.board.Item.TYPE_GROUP);
	};

	/**
	 * Returns the string representation of this instance
	 * 
	 * @return {string} the string representation of this instance
	 */
	jam.board.Item.prototype.toString = function () {
		/** @type {string} */
		var s = 'Item {\r\n';
		s += ('\t"type": "' + this.type);
		s += ('",\r\n\t"id": "' + this.id);
		s += ('",\r\n\t"title": "' + this.title);
		s += ('",\r\n\t"linkURI": "' + this.linkURI);
		s += ('",\r\n\t"thumbnailURI": "' + this.getThumbnailURI());
		s += '"\r\n}\r\n';
		return s;
	};

	/**
	 * Creates a document item if available on the given page
	 * 
	 * @return {jam.board.Item} the created document item
	 */
	jam.board.Item.createDocumentItem = function () {
		var $tmp;
		/** @type {string} */
		var title;
		/** @type {string} */
		var uri;
		/** @type {?string} */
		var documentID;
		/** @type {?string} */
		var versionID;
		/** @type {string} */
		var linkURI;
		/** @type {string} */
		var thumbnailURI;

		// Find the document title
		$tmp = $('.document_title');
		if ($tmp.length <= 0) {
			return null;
		}
		title = $.trim($tmp.text());

		// Find the document ID and version ID
		$tmp = $('.filename_nav a');
		if ($tmp.length <= 0) {
			return null;
		}
		uri = $tmp.attr('href');
		if (!uri) {
			return null;
		}
		documentID = getRestApiParam(uri, 'documents');
		if (!documentID) {
			return null;
		}
		versionID = getRestApiParam(uri, 'versions');
		if (!versionID) {
			return null;
		}

		// Formulate the link URI
		$tmp = $('.group_label a');
		if ($tmp.length <= 0) {
			return null;
		}
		linkURI = $tmp.attr('href');
		if (!linkURI) {
			return null;
		}
		linkURI = linkURI.replace('/group/', '/');
		thumbnailURI = linkURI;
		linkURI += ('/documents/' + documentID);

		// Formulate the thumbnail URI
		thumbnailURI += '/../../documents/slide_image?document_id=' + documentID + '&version_id=' + versionID;

		return new jam.board.Item(jam.board.Item.TYPE_DOCUMENT, documentID, title, linkURI, thumbnailURI);
	};

	/**
	 * Creates a image item if available on the given page
	 * 
	 * @return {jam.board.Item} the created image item
	 */
	jam.board.Item.createImageItem = function () {
		var $tmp;
		/** @type {string} */
		var title;
		/** @type {string} */
		var uri;
		/** @type {number} */
		var index;
		/** @type {?string} */
		var documentID;
		/** @type {string} */
		var linkURI;
		/** @type {string} */
		var thumbnailURI;

		// Find the image title
		$tmp = $('.photo_title, #label_photo_title');
		if ($tmp.length <= 0) {
			return null;
		}
		title = $.trim($tmp.text());

		// Find the document ID
		$tmp = $('#photoDetail');
		if ($tmp.length <= 0) {
			return null;
		}
		uri = $tmp.attr('src');
		if (!uri) {
			return null;
		}
		index = uri.indexOf('?');
		if (index >= 0) {
			uri = uri.substring(0, index);
		}
		documentID = getRestApiParam(uri, 'documents');
		if (!documentID) {
			return null;
		}

		// Assign the thumbnail URI
		thumbnailURI = uri;

		// Find the link URI
		$tmp = $('#imageCommentForm');
		if ($tmp.length <= 0) {
			return null;
		}
		linkURI = $tmp.attr('action');
		if (!linkURI) {
			return null;
		}

		return new jam.board.Item(jam.board.Item.TYPE_IMAGE, documentID, title, linkURI, thumbnailURI);
	};

	/**
	 * Creates a group item if available on the given page
	 * 
	 * @param {?string=} uri the URI for the item
	 * @return {jam.board.Item} the created item
	 */
	jam.board.Item.createGroupItem = function (uri) {
		var $tmp;
		/** @type {string} */
		var title;
		/** @type {number} */
		var index;
		/** @type {?string} */
		var id;
		/** @type {string} */
		var linkURI;
		/** @type {string} */
		var thumbnailURI;

		// Check for the type if specified
		$tmp = $('#groups_wall');
		if ($tmp.length <= 0) {
			return null;
		}

		// Find the title
		$tmp = $('.group_name');
		if ($tmp.length <= 0) {
			return null;
		}
		title = $.trim($tmp.text());

		// Find the document ID
		if (!uri) {
			uri = window.location.href;
		}
		id = getRestApiParam(uri, 'wall');
		if (!id) {
			return null;
		}

		// Assign the thumbnail URI
		$tmp = $('.navMainInfo .picFloat');
		if ($tmp.length <= 0) {
			return null;
		}
		thumbnailURI = $tmp.attr('src');

		// Assign the link URI
		linkURI = uri;

		return new jam.board.Item(jam.board.Item.TYPE_GROUP, id, title, linkURI, thumbnailURI);
	};

	/**
	 * Creates an item if available on the given page
	 * 
	 * @param {string} type the type
	 * @param {?string} typeCheckSelector the type check selector
	 * @param {string} titleSelector the selector for the type
	 * @param {string} idParam the ID REST parameter name
	 * @param {?string=} uri the URI for the item
	 * @return {jam.board.Item} the created item
	 */
	jam.board.Item.createItem = function (type, typeCheckSelector, titleSelector, idParam, uri) {
		var $tmp;
		/** @type {string} */
		var title;
		/** @type {number} */
		var index;
		/** @type {?string} */
		var id;
		/** @type {string} */
		var linkURI;
		/** @type {string} */
		var thumbnailURI;

		// Check for the type if specified
		if (typeCheckSelector) {
			$tmp = $(typeCheckSelector);
			if ($tmp.length <= 0) {
				return null;
			}
		}

		// Find the title
		$tmp = $(titleSelector);
		if ($tmp.length <= 0) {
			return null;
		}
		title = $.trim($tmp.text());

		// Find the document ID
		if (!uri) {
			uri = window.location.href;
		}
		id = getRestApiParam(uri, idParam);
		if (!id) {
			return null;
		}

		// Assign the thumbnail URI
		thumbnailURI = uri;

		// Assign the link URI
		linkURI = uri;

		return new jam.board.Item(type, id, title, linkURI, thumbnailURI);
	};

	/**
	 * Creates an item from the specified object
	 * 
	 * @param {*} object the object to create an item from
	 * @return {jam.board.Item} the created item
	 */
	jam.board.Item.createItemFromObject = function (object) {
		return new jam.board.Item(object.type, object.id, object.title, object.linkURI, object.thumbnailURI);
	};

	/**
	 * Board of items class
	 * 
	 * @param {string} name the name
	 * @param {Array.<jam.board.Item>=} items the items in the board
	 * @constructor
	 */
	jam.board.Board = function (name, items) {
		if (!items) {
			items = new Array();
		}

		/** @type {string} */
		this.name = name;

		/** @type {Array.<jam.board.Item>} */
		this.items = items;
	};

	/**
	 * Adds (or replaces) the specified item to the board
	 * 
	 * @param {jam.board.Item} item the item
	 */
	jam.board.Board.prototype.addItem = function (item) {
		// See if the item exists, and if so, then replace it
		/** @type {string} */
		var type = item.type;
		/** @type {string} */
		var id = item.id;
		/** @type {number} */
		var index;
		for (index = 0; index < this.items.length; index++) {
			/** @type {jam.board.Item} */
			var existingItem = this.items[index];
			if ((existingItem.type == type) && (existingItem.id == id)) {
				this.items[index] = item;
				return item;
			}
		}

		// Item does not exist, so add it
		this.items.push(item);

		return item;
	};

	/**
	 * Removes the specified item from the board
	 * 
	 * @param {string} type the type
	 * @param {string} id the ID
	 * @return {?jam.board.Item} the item that was removed, or null if none
	 *         found
	 */
	jam.board.Board.prototype.removeItem = function (type, id) {
		/** @type {number} */
		var index;
		for (index = 0; index < this.items.length; index++) {
			/** @type {jam.board.Item} */
			var existingItem = this.items[index];
			if ((existingItem.type == type) && (existingItem.id == id)) {
				this.items.splice(index, 1);
				return existingItem;
			}
		}
		return null;
	};

	/**
	 * Creates a board from the specified object
	 * 
	 * @param {*} object the object to create a board from
	 * @return {jam.board.Board} the created board
	 */
	jam.board.Board.createBoardFromObject = function (object) {
		/** @type {Array.<jam.board.Item>} */
		var items = new Array();
		var array = object.items;
		if (array) {
			var index;
			for (index = 0; index < array.length; index++) {
				items.push(jam.board.Item.createItemFromObject(array[index]));
			}
		}
		return new jam.board.Board(object.name, items);
	};

	/**
	 * Manager of board class
	 * 
	 * @param {string} id the identifier for the manager
	 * @param {Array.<jam.board.Board>=} boards the boards in the board
	 * @constructor
	 */
	jam.board.BoardManager = function (id, boards) {
		if (!boards) {
			boards = new Array();
		}

		/** @type {string} */
		this.id = id;

		/** @type {Array.<jam.board.Board>} */
		this.boards = boards;
	};

	/**
	 * Identifier of the shared, global instance
	 * 
	 * @const
	 * @type {string}
	 */
	jam.board.BoardManager.INSTANCE_ID = 'boardManager';

	/**
	 * Parses the specified manager JSON to a manager instance
	 * 
	 * @param {string} id the identifier for the manager
	 * @param {string} managerJSON the manager JSON to parse into a manager
	 *            instance
	 * @return {jam.board.BoardManager} the manager instance corresponding to
	 *         the manager JSON
	 */
	jam.board.BoardManager.parseJSON = function (id, managerJSON) {
		if (!window.JSON) {
			throw new Error('"JSON" not supported by this browser!');
		}

		/** @type {Array.<jam.board.Board>} */
		var boards = new Array();

		var managerObj = window.JSON.parse(managerJSON);
		if (managerObj) {
			/** @type {number} */
			var index;
			var array = managerObj.boards;
			if (array) {
				for (index = 0; index < array.length; index++) {
					boards.push(jam.board.Board.createBoardFromObject(array[index]));
				}
			}
		}

		return new jam.board.BoardManager(id, boards);
	};

	/**
	 * Returns the names of the boards being managed by this instance
	 * 
	 * @return {Array.<string>}
	 */
	jam.board.BoardManager.prototype.getBoardNames = function () {
		/** @type {Array.<string>} */
		var result = new Array(this.boards.length);
		/** @type {number} */
		var index;
		for (index = 0; index < this.boards.length; index++) {
			result.push(this.boards.name);
		}
		return result;
	};

	/**
	 * Adds the specified board to the manager
	 * 
	 * @param {jam.board.Board} board the board to add instance
	 * @return {jam.board.BoardManager} the manager instance
	 */
	jam.board.BoardManager.prototype.addBoard = function (board) {
		// See if the board exists, and if so, then replace it
		/** @type {string} */
		var lowerCasedBoardName = board.name.toLowerCase();
		/** @type {number} */
		var index;
		for (index = 0; index < this.boards.length; index++) {
			/** @type {jam.board.Board} */
			var existingBoard = this.boards[index];
			/** @type {string} */
			var existingName = existingBoard.name.toLowerCase();
			if (existingName == lowerCasedBoardName) {
				this.boards[index] = board;
				return this;
			}
		}

		// Board does not exist, so add it to the end
		this.boards.push(board);

		return this;
	};

	/**
	 * Removes the specified board from the manager
	 * 
	 * @param {string} boardName the name of the board to remove
	 * @return {?jam.board.Board} the board that was removed, or null if none
	 *         found
	 */
	jam.board.BoardManager.prototype.removeBoard = function (boardName) {
		/** @type {string} */
		var lowerCasedBoardName = boardName.toLowerCase();
		/** @type {number} */
		var index;
		for (index = 0; index < this.boards.length; index++) {
			/** @type {jam.board.Board} */
			var existingBoard = this.boards[index];
			/** @type {string} */
			var existingName = existingBoard.name.toLowerCase();
			if (existingName == lowerCasedBoardName) {
				this.boards.splice(index, 1);
				return existingBoard;
			}
		}
		return null;
	};

	/**
	 * Returns the board with the specified name from the manager
	 * 
	 * @param {string} boardName the name of the board to return
	 * @return {?jam.board.Board} the board with the specified name, or null if
	 *         none found
	 */
	jam.board.BoardManager.prototype.getBoard = function (boardName) {
		/** @type {string} */
		var lowerCasedBoardName = boardName.toLowerCase();
		/** @type {number} */
		var index;
		for (index = 0; index < this.boards.length; index++) {
			/** @type {jam.board.Board} */
			var existingBoard = this.boards[index];
			/** @type {string} */
			var existingName = existingBoard.name.toLowerCase();
			if (existingName == lowerCasedBoardName) {
				return existingBoard;
			}
		}
		return null;
	};

	/**
	 * Adds (or replaces) the specified item to the board with the specified
	 * name, creating the board if needed
	 * 
	 * @param {string} boardName the name of the board
	 * @param {jam.board.Item} item the item
	 * @return {jam.board.Board} the board that the item was added to
	 */
	jam.board.BoardManager.prototype.addItemToBoard = function (boardName, item) {
		// See if the board exists, and if so, then add the item to it
		/** @type {jam.board.Board} */
		var board;
		/** @type {string} */
		var lowerCasedBoardName = boardName.toLowerCase();
		/** @type {number} */
		var index;
		for (index = 0; index < this.boards.length; index++) {
			/** @type {jam.board.Board} */
			board = this.boards[index];
			/** @type {string} */
			var existingName = board.name.toLowerCase();
			if (existingName == lowerCasedBoardName) {
				board.name = boardName;
				board.addItem(item);
				return board;
			}
		}

		// Board does not exist, so create it with the item and add it to the
		// end
		board = new jam.board.Board(boardName);
		board.addItem(item);
		this.boards.push(board);

		return board;
	};

	/**
	 * Saves the instance
	 * 
	 * @param {?string=} key the key to save the instance with, or null to use
	 *            the id as the key
	 * @return {jam.board.BoardManager} the manager instance
	 */
	jam.board.BoardManager.prototype.save = function (key) {
		if (!window.JSON) {
			throw new Error('"JSON" not supported by this browser!');
		}

		if (!window.localStorage) {
			throw new Error('"localStorage" not supported by this browser!');
		}

		if (!key) {
			key = this.id;
		}

		/** @type {string} */
		var managerJSON = window.JSON.stringify(this);

		window.localStorage.setItem(key, managerJSON);

		return this;
	};

	jam.board.BoardManager.getLastBoardName = function () {
		if (!window.localStorage) {
			throw new Error('"localStorage" not supported by this browser!');
		}
		return window.localStorage.getItem("lastBoardName");
	};

	jam.board.BoardManager.setLastBoardName = function (boardName) {
		if (!window.localStorage) {
			throw new Error('"localStorage" not supported by this browser!');
		}
		window.localStorage.setItem("lastBoardName", boardName);
	};

	/**
	 * Returns the shared, global manager instance
	 * 
	 * @return {jam.board.BoardManager} the shared, global manager instance
	 */
	jam.board.BoardManager.getInstance = function () {
		if (!window.localStorage) {
			throw new Error('"localStorage" not supported by this browser!');
		}

		/** @type {jam.board.BoardManager} */
		var manager;

		/** @type {string} */
		var managerJSON = window.localStorage.getItem(jam.board.BoardManager.INSTANCE_ID) + "";
		if (managerJSON) {
			manager = jam.board.BoardManager.parseJSON(jam.board.BoardManager.INSTANCE_ID, managerJSON);
		} else {
			manager = new jam.board.BoardManager(jam.board.BoardManager.INSTANCE_ID);
		}

		return manager;
	};

	/**
	 * Saves the specified board manager as the shared, global manager instance
	 * 
	 * @return {jam.board.BoardManager} the shared, global manager instance
	 */
	jam.board.BoardManager.saveInstance = function (manager) {
		manager.id = jam.board.BoardManager.INSTANCE_ID;
		manager.save();
		return manager;
	};

	/*
	 * Code to add a "Pin It" menu to the "More" link...
	 */
	$(function () {
		/** @type {jam.board.Item} */
		var item;
		var $panelMoreLink;
		var $pinMenuItem;
		var $groupLinkArea;
		var $groupPinLink;

		// Try creating various items for the current page...
		item = jam.board.Item.createDocumentItem();
		if (!item) {
			item = jam.board.Item.createImageItem();
		}
		if (!item) {
			item = jam.board.Item.createItem(jam.board.Item.TYPE_WIKI, null, '.wiki_header .title_underscore', 'show');
		}
		if (!item) {
			item = jam.board.Item.createItem(jam.board.Item.TYPE_LINK, '#link_content', '.title_underscore', 'detail');
		}
		if (!item) {
			item = jam.board.Item.createItem(jam.board.Item.TYPE_LINKED_DOCUMENT, '.type.linked', '.document_title', 'documents');
		}
		if (!item) {
			item = jam.board.Item.createGroupItem();
		}

		// Add the "Pin It" menu item to the "More" dropdown if an item was
		// created
		if (item) {
			if (item.type != jam.board.Item.TYPE_GROUP) {
				$panelMoreLink = $('.more_panel ul, #more_panel ul, #panel_more_link, #panel_more_links');
				if ($panelMoreLink.length > 0) {
					$panelMoreLink = $panelMoreLink.first();
					$pinMenuItem = $('<li><a href="#PinIt">Pin It</a></li>');
					$panelMoreLink.append($pinMenuItem);
					$pinMenuItem.click(function () {
						// alert('Pin It invoked:\r\n\r\n' + item);
						/** @type {?string} */
						var boardName = window.prompt('Enter a board name to pin this item to:', jam.board.BoardManager.getLastBoardName());
						if (boardName) {
							/** @type {jam.board.BoardManager} */
							var manager = jam.board.BoardManager.getInstance();
							manager.addItemToBoard(boardName, item);
							manager.save();
							jam.board.BoardManager.setLastBoardName(boardName);
						}
						return false;
					});
				}
			} else {
				$groupLinkArea = $('.icon.following, .icon.members');
				if ($groupLinkArea.length > 0) {
					$groupLinkArea = $groupLinkArea.first();
					$groupPinLink = $('<li class="icon following"><a href="#PinIt">Pin It</a></li>');
					$groupLinkArea.after($groupPinLink);
					$groupPinLink.click(function () {
						// alert('Pin It invoked:\r\n\r\n' + item);
						/** @type {?string} */
						var boardName = window.prompt('Enter a board name to pin this item to:', jam.board.BoardManager.getLastBoardName());
						if (boardName) {
							/** @type {jam.board.BoardManager} */
							var manager = jam.board.BoardManager.getInstance();
							manager.addItemToBoard(boardName, item);
							manager.save();
							jam.board.BoardManager.setLastBoardName(boardName);
						}
						return false;
					});
				}
			}
		}
	});

})(window.jQuery);
