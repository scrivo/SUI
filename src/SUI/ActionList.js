/* Copyright (c) 2011, Geert Bergman (geert@scrivo.nl)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of "Scrivo" nor the names of its contributors may be
 *    used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * $Id: ActionList.js 786 2013-08-09 13:26:51Z geert $
 */

"use strict";

SUI.ActionList = SUI.defineClass(
	/** @lends SUI.ActionList.prototype */{

	/**
	 * @class
	 * <p>SUI.ActionList is a component that helps you manage the different
	 * actions that can be performed in an user interface. It gives you a
	 * centralized repository to store your actions and different interface
	 * elements can register to and trigger those actions.
	 * </p>
	 * <p>For example: in your interface the save action is triggered by a
	 * toolbar button, a context menu item and a key combination. Instead of
	 * calling your save action directly by the element handlers of these
	 * controls, you can call this action through the action list. The benefits
	 * of the action list is that the toolbar and context menu can use common
	 * data as the action's descriptive text and icon, but it also provides a
	 * centralized way to enable/disable the action and show the enabled state
	 * in the user interface.
	 * </p>
	 * <p>The following code exerpt shows an action list together with a
	 * toolbar and context menu component that use the actions of the list.
	 * Both the toolbar and context menu will also use the action list for
	 * the text and icon of their items. Changes to the enabled state of the
	 * action list's items will be reflected by the toolbar and context
	 * menu.
	 * </p>
	 * <pre class="sh_javascript">
	 * // Create an actionlist: add descriptive information (icon, title)
	 * // to the action and store these in the list.
	 * var actionList = new SUI.ActionList([{
	 *     actionId: "error",
	 *     title: "Show an error message",
	 *     icon: "delete.png",
	 *     handler: function(){alert("Error");}
	 * },{
	 *     actionId: "ok",
	 *     title: "Show an ok message",
	 *     icon: "tick.png",
	 *     handler: function(){alert("Ok");}
	 * },{
	 *     actionId: "alert",
	 *     title: "Show an alert message",
	 *     icon: "info.png",
	 *     handler: function(){alert("Alert");}
	 * }]);
	 *
	 * // Create a toolbar that uses actions from the action list
	 * var toolbar = new SUI.Toolbar({
	 *     top: 20, left: 20, width: 120,
	 *     actionlist: actionList,
	 *     tools: [
	 *         new SUI.ToolbarButton({actionId: "error"}),
	 *         new SUI.ToolbarButton({actionId: "ok"}),
	 *         new SUI.ToolbarButton({actionId: "alert"})
	 *     ]
	 * });
	 *
	 * // Create a menu that uses actions from the action list
	 * var menu = new SUI.PopupMenu({
	 *     actionlist: actionList,
	 *     items: [
	 *         { actionId: "error" },
	 *         { actionId: "ok" },
	 *         { actionId: "alert" }
	 *     ]
	 * });
	 * </pre>
	 *
	 * @description
	 * Construct an action list component. You can add your actions
	 * directly by passing them to the constructor as an array.
	 *
	 * @constructs
	 * @param {Object[]} arg An object array that describes a set of actions
	 *    that will added to the action list.
	 * @param {String} arg[].actionId The action's name/id.
	 * @param {Function} arg[].handler The action handler.
	 * @param {boolean} [arg[].enabled=true] The enabled state of the action.
	 * @param {boolean} [arg[].selected=false] The selected state of the
	 *    action.
	 * @param {String} [arg[].title="Action 'actionId'"] A descriptive title
	 *    for the action.
	 * @param {String} [arg[].icon] An icon for the action.
	 */
	initializer: function(arg) {

		// create a new list
		this._list = [];

		// and add the given actions
		for (var i=0; i<arg.length; i++) {
			this.add(arg[i]);
		}
	},

	/**
	 * Add an action to the action list.
	 * @param {Object} a An argument object that describes the action to add.
	 * @param {String} a.actionId The action's name/id.
	 * @param {Function} a.handler The action handler.
	 * @param {boolean} [a.enabled=true] The enabled state of the action.
	 * @param {boolean} [a.selected=false] The selected state of the action.
	 * @param {String} [a.title="Action 'actionId'"] A descriptive title for
	 *    the action.
	 * @param {String} [a.icon] An icon for the action.
	 */
	add: function(a) {
		this._list[a.actionId] = {
			handler : a.handler,
			enabled : a.enabled || true,
			selected : a.selected || false ,
			title: a.title || "Action "+a.action,
			icon: a.icon || null,
			listeners: []
		};
	},

	/**
	 * Execute one of the list's actions.
	 * @param {String} aId The action id of the action to execute.
	 * @exception {String} If doAction is called upon an disabled action.
	 */
	doAction: function(aId) {
		if (this._list[aId].enabled) {
			this._list[aId].handler();
		} else {
			throw "Action ["+aId+"] not enabled";
		}
	},

	/**
	 * Enable/disable a number of actions in the list.
	 * @param {Object} actObj A list of action id's with the preferred
	 *     enabled state in object notation: the field names are the names of
	 *     the action id's, the value of each field is the action's enabled
	 *     state.
	 */
	enable: function(actObj) {
		for (var i in actObj) {
			if (actObj.hasOwnProperty(i)) {
				this._list[i].enabled = actObj[i];
				for (var j=0; j<this._list[i].listeners.length; j++) {
					this._list[i].listeners[j].enable(actObj[i]);
				}
			}
		}
	},

	/**
	 * Retrieve an action from the list.
	 * @param {String} aId The action id of the action to retrieve.
	 * @return {Object} An action object.
	 */
	get: function(aId) {
		return this._list[aId];
	},

	/**
	 * Select/deselect a number of actions in the list.
	 * @param {Object} actObj A list of action id's with the preferred
	 *     selected state in object notation: the field names are the names of
	 *     the action id's, the value of each field is the action's selected
	 *     state.
	 */
	select: function(actObj) {
		for (var i in actObj) {
			this._list[i].selected = actObj[i];
			for (var j=0; j<this._list[i].listeners.length; j++) {
				this._list[i].listeners[j].select(actObj[i]);
			}
		}
	},

	/**
	 * Array to store the actions.
	 * @type Object[]
	 * @private
	 */
	_list: null

});
