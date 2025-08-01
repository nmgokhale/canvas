/*
 * Copyright 2017-2025 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { get, has } from "lodash";
import KeyboardUtils from "../common-canvas/keyboard-utils.js";
import PaletteContentListItemBtn from "./palette-content-list-item-btn.jsx";
import Icon from "../icons/icon.jsx";
import SVG from "react-inlinesvg";
import { CANVAS_CARBON_ICONS, DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM,
	USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON }
	from "../common-canvas/constants/canvas-constants.js";

import SUPERNODE_ICON from "../../assets/images/supernode.svg";
import SUPERNODE_EXT_ICON from "../../assets/images/supernode_ext.svg";

class PaletteContentListItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showFullDescription: false
		};

		this.ghostData = null;

		this.showFullDescription = this.showFullDescription.bind(this);
		this.showShortDescription = this.showShortDescription.bind(this);

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	onMouseDown() {
		// Make sure the tip doesn't appear when starting to drag a node.
		this.props.canvasController.closeTip();

		// Sets the focus index on the parent palette-content-list so
		// future key presses that move focus will work correctly.
		if (this.props.setFocusIndex) {
			this.props.setFocusIndex();
		}

		// Prepare the ghost image on mouse down because asynchronous loading of
		// SVG files will be too slow if this is done in onDragStart.
		this.ghostData = this.props.canvasController.getGhostNode(this.props.nodeTypeInfo.nodeType);
	}

	onDragStart(ev) {
		this.props.canvasController.closeTip();

		// We cannot use the dataTransfer object for the nodeTemplate because
		// the dataTransfer data is not available during dragOver events so we set
		// the nodeTemplate into the canvas controller.
		this.props.canvasController.nodeTemplateDragStart(this.ghostData.nodeTemplate);

		// On firefox, the drag will not start unless something is written to
		// the dataTransfer object so just write an empty string
		ev.dataTransfer.setData(DND_DATA_TEXT, "");

		if (this.ghostData) {
			ev.dataTransfer.setDragImage(this.ghostData.element, this.ghostData.centerX, this.ghostData.centerY);
		}
	}

	onKeyDown(evt) {
		if (KeyboardUtils.createAutoNode(evt)) {
			this.createAutoNode(true);

		} else if (KeyboardUtils.createAutoNodeNoLink(evt)) {
			this.createAutoNode(false); // false indicates no links are required

		} else if (KeyboardUtils.nextNodeInCategory(evt) && this.props.nextNodeInCategory) {
			this.props.nextNodeInCategory(evt);

		} else if (KeyboardUtils.previousNodeInCategory(evt) && this.props.previousNodeInCategory) {
			this.props.previousNodeInCategory(evt);

		} else if (KeyboardUtils.tabFocusOutOfPalette(evt) && this.props.tabOut) {
			this.props.tabOut(evt);
		}
	}

	// This is needed in-case the drag ends somewhere other than the canvas area.
	onDragEnd() {
		this.props.canvasController.nodeTemplateDragEnd();
	}

	onDoubleClick() {
		this.createAutoNode(true);
	}

	onClick() {
		if (this.props.allowClickToAdd) {
			this.createAutoNode(true);
		}
	}

	onMouseOver(evt) {
		if (!this.props.isDisplaySearchResult && evt.buttons === 0) {
			this.displayTip();
		}
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	getHighlightedCategoryLabel() {
		return this.getHighlightedText(
			this.props.nodeTypeInfo.category.label,
			this.props.nodeTypeInfo.occurrenceInfo.catLabelOccurrences);
	}

	getHighlightedLabel(labelText) {
		return this.getHighlightedText(
			labelText,
			this.props.nodeTypeInfo.occurrenceInfo.nodeLabelOccurrences);
	}

	getHighlightedDesc() {
		const DISPLAY_LEN = 150; // Max number of characters for a description.
		let desc = this.props.nodeTypeInfo.nodeType.app_data.ui_data.description;
		let nodeDescOccurrences = this.props.nodeTypeInfo.occurrenceInfo.nodeDescOccurrences;
		let isLongDescription = false;

		if (desc.length > DISPLAY_LEN) {
			isLongDescription = true;
			if (!this.state.showFullDescription) {
				const { abbrDesc, occurrences } = this.getAbbreviatedDescription(desc, nodeDescOccurrences, DISPLAY_LEN);
				desc = abbrDesc;
				nodeDescOccurrences = occurrences;
			}
		}

		const elements = this.getHighlightedText(desc, nodeDescOccurrences);

		// If it's a long description, we need to add either the 'Show more' or
		// 'Show less' button depending on whether the full description is shown or not.
		if (isLongDescription) {
			if (this.state.showFullDescription) {
				elements.push(
					<PaletteContentListItemBtn id={"palette.flyout.search.less"} onClick={this.showShortDescription} />
				);

			} else {
				elements.push(
					<PaletteContentListItemBtn id={"palette.flyout.search.more"} onClick={this.showFullDescription} />
				);
			}
		}
		return elements;
	}

	// Returns an abbeviated description, constrained to the displayLen passed in,
	// based on the full description passed in. The function makes sure the first
	// occurrence of text to be highlighted is displayed with the abbreviated
	// text. There are three possibilities:
	// 1. The first occurrence is within the first displayLen number of characters
	//    meaning we end the abbreviated text with " ..."
	// 2. The first occurrence is somewhere in the middle of the text in which
	//    the abbreviated dscription is prefixed with "... " and suffixed with " ..."
	// 3. The first occurrence is within displayLen number of characters of the end
	//    of the description in which case we prefix the descriptin with "... "
	// This function also adjusts the occurencs of highlighted text in the
	// description to account for any text that has been removed from the
	// beginning of the description.
	getAbbreviatedDescription(desc, nodeDescOccurrences, displayLen) {
		// Not all descriptions will have occurencs. If not, just abbreviate and return.
		if (nodeDescOccurrences.length === 0) {
			const abbr = desc.substring(0, displayLen) + " ...";
			return { abbrDesc: abbr, occurrences: nodeDescOccurrences };
		}

		const firstOccurrenceStart = nodeDescOccurrences[0].start;
		const remainder = desc.length - firstOccurrenceStart;
		let abbrDesc = "";
		let offset = 0;

		if (firstOccurrenceStart < displayLen) {
			offset = 0;
			abbrDesc = desc.substring(offset, displayLen) + " ...";

		} else if (remainder > displayLen) {
			offset = firstOccurrenceStart;
			abbrDesc = "... " + desc.substring(offset, firstOccurrenceStart + displayLen) + " ...";
			offset -= 4; // Subtract 4 for the "... " string

		} else {
			offset = desc.length - displayLen;
			abbrDesc = "... " + desc.substring(offset, desc.length);
			offset -= 4; // Subtract 4 for the "... " string
		}

		const occurrences = nodeDescOccurrences.map((occ) => ({ start: occ.start - offset, end: occ.end - offset }));

		return { abbrDesc, occurrences };
	}

	// Returns an array of highlighted and non-highlighted text based on the
	// textToHighlight passed in and the occurrences array which contains elements
	// that indicate where text should be highlighted.
	getHighlightedText(textToHighlight, occurrences) {
		if (!occurrences || occurrences.length === 0) {
			return [<span key="o">{textToHighlight}</span>];
		}

		const highlightedElements = [];
		let index = 0;
		let text = "";
		occurrences.forEach((occ, i) => {
			text = textToHighlight.substring(index, occ.start);
			highlightedElements.push(<span key={"s" + i}>{text}</span>);

			text = textToHighlight.substring(occ.start, occ.end);
			highlightedElements.push(<mark key={"m" + i}>{text}</mark>);

			index = occ.end;

			if (i === occurrences.length - 1 &&
					occ.end < textToHighlight.length) {
				text = textToHighlight.substring(occ.end);
				highlightedElements.push(<span key={"f" + i}>{text}</span>);
			}
		});

		return highlightedElements;
	}

	// Returns the class to be applied to the main div for this palette
	// item depending on whether we are displaying search results (or not)
	// and if there is a special palette class specified (or not).
	getMainDivClass() {
		const paletteClass = this.props.nodeTypeInfo?.nodeType?.app_data?.ui_data?.palette_class_name;

		let mainDivClass = this.props.isDisplaySearchResult
			? "palette-list-item search-result"
			: "palette-list-item";

		mainDivClass += (paletteClass ? " " + paletteClass : "");

		mainDivClass += !this.props.isPaletteWide ? " palette-narrow" : "";

		return mainDivClass;
	}

	showFullDescription() {
		this.setState({ showFullDescription: true });
	}

	showShortDescription() {
		this.setState({ showFullDescription: false });
	}

	// Sets the focus on this palette (node) item and displays
	// a tooltip. This is called by the parent palette-content-list
	// when the user moves focus to a new node using the keyboard, so
	// we always show a tip for the keyboard user.
	focus() {
		this.itemRef.current.focus();
		this.displayTip();
	}

	// Display a tip for this palette (node) item.
	displayTip() {
		this.props.canvasController.closeTip();

		const nodeTemplate = this.props.nodeTypeInfo.category.empty_text
			? { app_data: { ui_data: { label: this.props.nodeTypeInfo.category.empty_text } } }
			: this.props.nodeTypeInfo.nodeType;

		this.props.canvasController.openTip({
			id: "paletteTip_" + this.props.nodeTypeInfo.nodeType.op,
			type: TIP_TYPE_PALETTE_ITEM,
			targetObj: this.itemRef.current,
			nodeTemplate: nodeTemplate,
			category: this.props.nodeTypeInfo.category
		});
	}

	// Returns true if this item is disabled and should not be draggable or double-clicked
	// from the palette.
	isItemDisabled() {
		const disabled = this.props.nodeTypeInfo.nodeType?.app_data?.ui_data?.palette_disabled;
		return !this.props.isEditingEnabled || disabled;
	}

	// Converts the palette node from its pipeline flow format to the internal API
	// format and calls canvas controller to automatically add the node to the
	// canvas. If addLink is true a link will be added between to the new node
	// from the adjacent node.
	createAutoNode(addLink) {
		if (this.props.createAutoNode && !this.isItemDisabled()) {
			this.props.createAutoNode(this.props.nodeTypeInfo.nodeType, addLink);
		}
	}

	render() {
		let itemText = null;
		let labelText = get(this.props, "nodeTypeInfo.nodeType.app_data.ui_data.label", "");
		let draggable = this.isItemDisabled() ? "false" : "true";
		let icon = null;
		const ariaDisabled = this.isItemDisabled();

		if (has(this.props.nodeTypeInfo.nodeType, "app_data.ui_data.image")) {
			let image = this.props.nodeTypeInfo.nodeType.app_data.ui_data.palette_image
				? this.props.nodeTypeInfo.nodeType.app_data.ui_data.palette_image
				: this.props.nodeTypeInfo.nodeType.app_data.ui_data.image;

			if (image === USE_DEFAULT_ICON) {
				image = SUPERNODE_ICON;
			} else if (image === USE_DEFAULT_EXT_ICON) {
				image = SUPERNODE_EXT_ICON;
			}

			if (typeof image === "object" && React.isValidElement(image)) {
				icon = image;
			} else if (typeof image === "string") {
				icon = image.endsWith(".svg")
					? <SVG src={image} className="palette-list-item-icon" draggable="false" aria-hidden="true" />
					: <img src={image} className="palette-list-item-icon" draggable="false" alt={""} />;
			}
		}

		if (labelText) {
			if (this.props.isPaletteWide || !icon) {
				itemText = this.props.isDisplaySearchResult
					? this.getHighlightedLabel(labelText)
					: (<span>{labelText}</span>);

			// For the narrow palette, we 'display' a label with zero font-size
			// so the screen reader will read the label but it will not be visible.
			} else if (!this.props.isPaletteWide) {
				itemText = (<span>{labelText}</span>);
			}
		}

		const ranking = this.props.isShowRanking && this.props.isDisplaySearchResult && has(this.props.nodeTypeInfo, "occurrenceInfo.ranking")
			? (<span>{this.props.nodeTypeInfo.occurrenceInfo.ranking}</span>)
			: null;

		// Special case for when there are no nodes in the category so we show
		// a dummy node to include the empty text from the category.
		if (this.props.nodeTypeInfo.category.node_types.length === 0 && this.props.nodeTypeInfo.category.empty_text) {
			labelText = this.props.nodeTypeInfo.category.empty_text;
			if (this.props.isPaletteWide) {
				itemText = (<span>{labelText}</span>);
			}
			draggable = "false";
			icon = (<Icon type={CANVAS_CARBON_ICONS.WARNING_UNFILLED} className="palette-list-item-icon-warning" draggable="false" />);
		}

		const mainDivClass = this.getMainDivClass();

		const categoryLabel = this.props.isDisplaySearchResult
			? (<div className={"palette-list-item-category-label"}>{this.getHighlightedCategoryLabel()}</div>)
			: null;

		const description = this.props.isDisplaySearchResult &&
				this.props?.nodeTypeInfo?.nodeType?.app_data?.ui_data?.description
			? (<div className={"palette-list-item-description"}>{this.getHighlightedDesc()}</div>)
			: null;

		const nodeLabel = itemText
			? <div className="palette-list-item-text-div">{itemText}</div>
			: null;

		this.itemRef = React.createRef();

		return (
			<div
				ref={this.itemRef}
				data-id={this.props.nodeTypeInfo.nodeType.op}
				tabIndex={this.props.tabIndex}
				role={"button"}
				aria-disabled={ariaDisabled}
				draggable={draggable}
				className={mainDivClass}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				onKeyDown={this.props.isEditingEnabled ? this.onKeyDown : null}
				onMouseDown={this.props.isEditingEnabled ? this.onMouseDown : null}
				onDragStart={this.props.isEditingEnabled ? this.onDragStart : null}
				onDragEnd={this.props.isEditingEnabled ? this.onDragEnd : null}
				onClick={this.props.isEditingEnabled ? this.onClick : null}
				onDoubleClick={this.props.isEditingEnabled ? this.onDoubleClick : null}
			>
				{categoryLabel}
				<div className="palette-list-item-icon-and-text">
					{icon}
					{nodeLabel}
					{ranking}
				</div>
				{description}
			</div>
		);
	}
}

PaletteContentListItem.propTypes = {
	nodeTypeInfo: PropTypes.object.isRequired,
	isDisplaySearchResult: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired,
	tabIndex: PropTypes.number.isRequired,
	nextNodeInCategory: PropTypes.func,
	previousNodeInCategory: PropTypes.func,
	setFocusIndex: PropTypes.func,
	allowClickToAdd: PropTypes.bool,
	isEditingEnabled: PropTypes.bool.isRequired,
	isPaletteWide: PropTypes.bool,
	isShowRanking: PropTypes.bool,
	createAutoNode: PropTypes.func,
	tabOut: PropTypes.func
};

export default PaletteContentListItem;
