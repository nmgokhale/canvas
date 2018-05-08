/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import deepFreeze from "deep-freeze";
import ObjectModel from "../../src/object-model/object-model.js";
// import log4js from "log4js";

// const logger = log4js.getLogger("object-model-test");

describe("ObjectModel handle model OK", () => {

	it("should create a canvas", () => {
		const objectModel = new ObjectModel();

		const expectedPipeline =
			{	id: "123",
				nodes: [
					{ id: "node1", name: "Node 1" },
					{ id: "node2", name: "Node 2" }]
			};

		setupStartCanvasInfo("123", expectedPipeline, objectModel);

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});


	it("should clear a canvas", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{
				id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({ type: "CLEAR_PIPELINE_FLOW" });

		const expectedPipeline = null;
		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should add a node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		var newNodeData = { id: "node4", label: "Type", image: "imageName", type: "execution_node",
			operator_id_ref: "type", class_name: "canvas-node",
			input_ports: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
			output_ports: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
			x_pos: 40, y_pos: 40
		};

		// imageName - Just for Testing
		objectModel.dispatch({
			type: "ADD_NODE",
			data: { newNode: newNodeData },
			pipelineId: "123"
		});


		const expectedPipeline =
			{
				id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", label: "Type", image: "imageName", type: "execution_node",
						operator_id_ref: "type", class_name: "canvas-node",
						input_ports: [{ name: "inPort", label: "Input Port", cardinality: "1:1" }],
						output_ports: [{ name: "outPort", label: "Output Port", cardinality: "1:1" }],
						x_pos: 40, y_pos: 40 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should move a node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["node1", "node2", "node3"],
				offsetX: 5,
				offsetY: 7 },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 15, y_pos: 17 },
					{ id: "node2", x_pos: 25, y_pos: 27 },
					{ id: "node3", x_pos: 35, y_pos: 37 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);


		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should delete a node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "node1" },
			pipelineId: "123"
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "node3" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node2", x_pos: 20, y_pos: 20 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should disconnect a node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DISCONNECT_NODES",
			data: { selectedNodeIds: ["node1"] },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should add node attr", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "ADD_NODE_ATTR",
			data: {
				objIds: ["node1"],
				attrName: "bgcolor" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": ["bgcolor"] },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should remove node attr", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": ["bgcolor"] },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "REMOVE_NODE_ATTR",
			data: {
				objIds: ["node1"],
				attrName: "bgcolor" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ "id": "node1", "x_pos": 10, "y_pos": 10, "customAttrs": [] },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should add a comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		/* objectModel.dispatch({
			type: "ADD_COMMENT",
			data: { id: "comment3", mousePos: { x: 200, y: 300 }, selectedObjectIds: [] }
			class_name: "canvas-comment",
			content: " ",
			height: 32,
			width: 128,
		});*/

		objectModel.dispatch({
			type: "ADD_COMMENT",
			data: { id: "comment3",	x_pos: 200,	y_pos: 300,	selectedObjectIds: []	},
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 },
					{ id: "comment3",	x_pos: 200,	y_pos: 300 }
				],
				links: []
			};


		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(JSON.stringify(expectedPipeline), JSON.stringify(actualPipeline))).to.be.true;
	});

	it("should edit a comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "EDIT_COMMENT",
			data: { nodes: ["comment2"], offsetX: 425, offsetY: 125, height: 45, width: 250, label: "this is a new comment string" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2",
						x_pos: 425,
						y_pos: 125,
						content: "this is a new comment string",
						height: 45,
						width: 250 }
				],
				links: []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(JSON.stringify(expectedPipeline), JSON.stringify(actualPipeline))).to.be.true;
	});

	it("should move a comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: []
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "MOVE_OBJECTS",
			data: { nodes: ["comment1", "comment2"],
				offsetX: 5,
				offsetY: 7 },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 55, y_pos: 57 },
					{ id: "comment2", x_pos: 65, y_pos: 67 }
				],
				links: []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should delete a comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 },
					{ id: "comment3", x_pos: 70, y_pos: 70 }
				],
				links: []
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "comment1" },
			pipelineId: "123"
		});

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "comment2" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ "id": "123",
				"nodes": [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				"comments": [
					{ id: "comment3", x_pos: 70, y_pos: 70 }
				],
				"links": []
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;

	});

	it("should add comment attr", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "ADD_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": ["bgcolor"] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should remove comment attr", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": ["bgcolor"] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "REMOVE_COMMENT_ATTR",
			data: { objIds: ["comment1"],
				attrName: "bgcolor" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ "id": "comment1", "x_pos": 50, "y_pos": 50, "customAttrs": [] },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should add a link", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link3", class_name: "canvas-node-link",
				type: "nodeLink", srcNodeId: "node2", trgNodeId: "node3",
				srcNodePortId: "sourceport1", trgNodePortId: "targetport1" },
			pipelineId: "123"
		});

		objectModel.dispatch({
			type: "ADD_LINK",
			data: { id: "link4", class_name: "canvas-comment-link",
				type: "commentLink", srcNodeId: "comment1", trgNodeId: "node2" },
			pipelineId: "123"
		});


		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" },
					{ id: "link3", class_name: "canvas-node-link",
						srcNodeId: "node2", trgNodeId: "node3", type: "nodeLink",
						srcNodePortId: "sourceport1", trgNodePortId: "targetport1" },
					{ id: "link4", class_name: "canvas-comment-link",
						srcNodeId: "comment1", trgNodeId: "node2", type: "commentLink" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		// var exp = JSON.stringify(expectedPipeline);
		// var act = JSON.stringify(actualPipeline);
		//
		// for (var i = 0; i < act.length; i++) {
		// 	if (exp[i] !== act[i]) {
		// 		logger.info("Mismatch at index = " + i + " exp = " + exp[i] + " act = " + act[i]);
		// 	} else {
		// 		// logger.info("Match OK at index = " + i + " exp = " + exp[i] + " act = " + act[i]);
		// 	}
		// }


		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should delete a link", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DELETE_LINK",
			data: { id: "link1" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should delete a link when a node is deleted", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "node1" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should delete a link when a comment is deleted", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "DELETE_OBJECT",
			data: { id: "comment1" },
			pipelineId: "123"
		});

		const expectedPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" }
				]
			};

		const actualPipeline = getPipelineWithoutTransientData(objectModel);

		// logger.info("Expected Canvas = " + JSON.stringify(expectedPipeline, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualPipeline, null, 4));

		expect(isEqual(expectedPipeline, actualPipeline)).to.be.true;
	});

	it("should select an object", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should clear current selections", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		objectModel.dispatch({
			type: "CLEAR_SELECTIONS"
		});


		const expectedSelections = [];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});

		objectModel.toggleSelection("comment1", true);

		const expectedSelections = ["node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node3"]
		});

		objectModel.toggleSelection("comment1", true);

		const expectedSelections = ["node3", "comment1"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle off node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1", "node3"]
		});


		objectModel.toggleSelection("node3", true);


		const expectedSelections = ["comment1"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select toggle on node", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});

		objectModel.toggleSelection("node3", true);

		const expectedSelections = ["comment1", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it("should select nodes in a simple subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a fork subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node2", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node1", "node4", "node2"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a merge subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node3" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node1", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a simple partial subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node5" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node2" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});

		objectModel.selectSubGraph("node4");

		const expectedSelections = ["node2", "node4", "node3"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node13");

		const expectedSelections = ["node1", "node13", "node2", "node3", "node4", "node11", "node12",
			"node5", "node6", "node7"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		// logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex patial subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});

		objectModel.selectSubGraph("node12");

		const expectedSelections = ["node1", "node12", "node2", "node3", "node4",
			"node5", "node6", "node7"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex single input subgraph", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node8"]
		});

		objectModel.selectSubGraph("node11");

		const expectedSelections = ["node8", "node11", "node4", "node12"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Selections = " + JSON.stringify(expectedSelections));
		// logger.info("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	it("should select nodes in a complex subgraph starting with comment", () => {
		const objectModel = new ObjectModel();

		const startPipeline =
			{ id: "123",
				nodes: [
					{ id: "node1", x_pos: 10, y_pos: 10 },
					{ id: "node2", x_pos: 20, y_pos: 20 },
					{ id: "node3", x_pos: 30, y_pos: 30 },
					{ id: "node4", x_pos: 40, y_pos: 30 },
					{ id: "node5", x_pos: 50, y_pos: 30 },
					{ id: "node6", x_pos: 60, y_pos: 30 },
					{ id: "node7", x_pos: 70, y_pos: 30 },
					{ id: "node8", x_pos: 80, y_pos: 30 },
					{ id: "node9", x_pos: 90, y_pos: 30 },
					{ id: "node10", x_pos: 100, y_pos: 30 },
					{ id: "node11", x_pos: 110, y_pos: 30 },
					{ id: "node12", x_pos: 120, y_pos: 30 },
					{ id: "node13", x_pos: 130, y_pos: 30 }
				],
				comments: [
					{ id: "comment1", x_pos: 50, y_pos: 50 },
					{ id: "comment2", x_pos: 60, y_pos: 60 }
				],
				links: [
					{ id: "link1", srcNodeId: "node1", trgNodeId: "node2" },
					{ id: "link2", srcNodeId: "node2", trgNodeId: "node3" },
					{ id: "link3", srcNodeId: "node3", trgNodeId: "node4" },
					{ id: "link5", srcNodeId: "node4", trgNodeId: "node9" },
					{ id: "link4", srcNodeId: "comment1", trgNodeId: "node7" },
					{ id: "link6", srcNodeId: "node4", trgNodeId: "node10" },
					{ id: "link7", srcNodeId: "node4", trgNodeId: "node11" },
					{ id: "link8", srcNodeId: "node4", trgNodeId: "node12" },
					{ id: "link9", srcNodeId: "node9", trgNodeId: "node10" },
					{ id: "link10", srcNodeId: "node12", trgNodeId: "node11" },
					{ id: "link11", srcNodeId: "node11", trgNodeId: "node13" },
					{ id: "link12", srcNodeId: "node8", trgNodeId: "node4" },
					{ id: "link13", srcNodeId: "node1", trgNodeId: "node5" },
					{ id: "link14", srcNodeId: "node5", trgNodeId: "node6" },
					{ id: "link15", srcNodeId: "node1", trgNodeId: "node7" },
					{ id: "link16", srcNodeId: "node7", trgNodeId: "node4" },
					{ id: "link17", srcNodeId: "node6", trgNodeId: "node4" }
				]
			};

		setupStartCanvasInfo("123", startPipeline, objectModel);

		objectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});

		objectModel.selectSubGraph("node13");

		const expectedSelections = ["comment1", "node13", "node7", "node4", "node11", "node12"];
		const actualSelections = objectModel.getSelectedObjectIds();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedSelections, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualSelections, null, 4));

		expect(isEmpty(difference(expectedSelections, actualSelections))).to.be.true;
	});

	function setupStartCanvasInfo(primaryPipeline, pipeline, objectModel) {
		const canvasInfo =
			{	id: "456",
				primary_pipeline: primaryPipeline,
				pipelines: [pipeline]
			};

		deepFreeze(canvasInfo);

		objectModel.dispatch({
			type: "SET_CANVAS_INFO",
			data: canvasInfo,
			layoutinfo: objectModel.getLayout()
		});
	}

	function getPipelineWithoutTransientData(objectModel) {
		const pipeline = objectModel.getCanvasInfoPipeline();

		if (pipeline === null) {
			return null;
		}

		// Remove transient data before comparing with expected
		for (var i = 0; i < pipeline.nodes.length; i++) {
			delete pipeline.nodes[i].width;
			delete pipeline.nodes[i].height;
			delete pipeline.nodes[i].outputPortsHeight;
			delete pipeline.nodes[i].inputPortsHeight;
		}
		return pipeline;
	}

});